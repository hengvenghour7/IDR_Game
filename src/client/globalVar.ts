/// <reference types="vite/client" />

const TILE_SIZE: number = 32;
const BASE_TILE_SIZE: number = 16;
const WORLD_SCALE_FACTOR: number = 2;
const CHARACTER_TILE_SIZE: number = 32;
const GLOBAL_SCALE: number = 1.5;

const canvas = document.getElementById("game_canvas") as HTMLCanvasElement;
const resizeCanvas = () => {
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width > 0 && bounds.height > 0) {
        canvas.width = Math.round(bounds.width);
        canvas.height = Math.round(bounds.height);
    }
};
resizeCanvas();

const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}${path}`;

export {
    TILE_SIZE,
    BASE_TILE_SIZE,
    WORLD_SCALE_FACTOR,
    CHARACTER_TILE_SIZE,
    GLOBAL_SCALE,
    canvas,
    assetUrl,
    resizeCanvas,
}
