import { Universe, Cell} from "wasm-game-of-life";
import {memory} from "wasm-game-of-life/wasm_game_of_life_bg.wasm";

const CELL_SIZE = 7; //in px.
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

let universe = Universe.new();
let width = universe.width();
let height = universe.height();


// Canvas
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;


const ctx = canvas.getContext('2d');
let animationId = null;
const renderLoop = () => {
    universe.tick();
    drawGrid();
    drawCells();

    animationId = requestAnimationFrame(renderLoop);
};


const drawGrid = () => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;

    // Horizontal lines.
    for (let j = 0; j <= height; j++) {
        let y =  j * (CELL_SIZE + 1) + 1;
        ctx.moveTo(0, y);
        ctx.lineTo((CELL_SIZE + 1) * width + 1, y);
    }

    // Verticle lines.
    for (let i = 0; i <= width; i++) {
        let x =  i * (CELL_SIZE + 1) + 1;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, (CELL_SIZE + 1) * height + 1);
    }
    ctx.stroke();
};

const getIndex = (row, column) => {
    return row * width + column;
};

const drawCells = () => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

    ctx.beginPath();

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++){
            const idx = getIndex(row, col);

            ctx.fillStyle = cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;
            ctx.fillRect(
                col * (CELL_SIZE + 1) + 1,
                row * (CELL_SIZE + 1) + 1,
                CELL_SIZE,
                CELL_SIZE
            );
        }
    }

    ctx.stroke()
};


// Buttons
const isPaused = () => {
    return animationId === null;
};
const playPauseButton = document.getElementById("play-pause");
const play = () => {
    playPauseButton.textContent = "pause";
    renderLoop();
};

const pause = () => {
    playPauseButton.textContent =  "play";
    cancelAnimationFrame(animationId);
    animationId = null;
};


const tickButton = document.getElementById("tick");
const executeTick = () => {
    if (animationId !== null) {
        // only execute when the loop is in pause.
        return
    }
    universe.tick();
    drawGrid();
    drawCells();
};

const resetButton = document.getElementById("reset");
const resetUniverse = () => {
    universe = Universe.new();
    height = universe.height();
    width = universe.width();

    drawGrid();
    drawCells();
};

// Event listeners
tickButton.addEventListener("click", event => {
    executeTick();
});


playPauseButton.addEventListener("click", event => {
    if (isPaused()) {
        play();
    } else {
        pause();
    }
});


canvas.addEventListener("click", event => {
    const boundingRect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / boundingRect.width;
    const scaleY = canvas.height / boundingRect.height;

    const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
    const canvasTop = (event.clientY - boundingRect.top) * scaleY;

    const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
    const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

    universe.toggle_cell(row, col);

    drawGrid();
    drawCells();
});

resetButton.addEventListener("click", event => {
   resetUniverse();
});

drawGrid();
drawCells();
pause();