/// <reference types="vite/client" />

declare const __RESOURCE_VERSION__: string;

const TILE_SIZE: number = 32;
const BASE_TILE_SIZE: number = 16;
const WORLD_SCALE_FACTOR: number = 2;
const CHARACTER_TILE_SIZE: number = 32;
const DESKTOP_GLOBAL_SCALE = 1.5;
const PHONE_GLOBAL_SCALE = 1;
const SCALE_OPTIONS = [0.8, 1, DESKTOP_GLOBAL_SCALE] as const;
let GLOBAL_SCALE = DESKTOP_GLOBAL_SCALE;
let hasUserScaleChoice = false;

const setGlobalScale = (scale: number) => {
    if (SCALE_OPTIONS.includes(scale as typeof SCALE_OPTIONS[number])) {
        GLOBAL_SCALE = scale;
        hasUserScaleChoice = true;
    }
};

const canvas = document.getElementById("game_canvas") as HTMLCanvasElement;
const resizeCanvas = () => {
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width > 0 && bounds.height > 0) {
        // Use the smaller scale on phones in both portrait and landscape.
        if (!hasUserScaleChoice) {
            const isPhone = window.matchMedia("(pointer: coarse)").matches
                && Math.min(window.innerWidth, window.innerHeight) <= 600;
            GLOBAL_SCALE = isPhone ? PHONE_GLOBAL_SCALE : DESKTOP_GLOBAL_SCALE;
        }
        canvas.width = Math.round(bounds.width);
        canvas.height = Math.round(bounds.height);
    }
};
resizeCanvas();

const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}${path}?v=${__RESOURCE_VERSION__}`;

export {
    TILE_SIZE,
    BASE_TILE_SIZE,
    WORLD_SCALE_FACTOR,
    CHARACTER_TILE_SIZE,
    GLOBAL_SCALE,
    SCALE_OPTIONS,
    canvas,
    assetUrl,
    resizeCanvas,
    setGlobalScale,
}
