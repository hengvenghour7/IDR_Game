const TILE_SIZE: number = 32;
const BASE_TILE_SIZE: number = 16;
const WORLD_SCALE_FACTOR: number = 2;
const CHARACTER_TILE_SIZE: number = 32;

const canvas = document.getElementById("game_canvas") as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = 800;

export {
    TILE_SIZE,
    BASE_TILE_SIZE,
    WORLD_SCALE_FACTOR,
    CHARACTER_TILE_SIZE,
    canvas
}