import { Character } from "./character"
import { inputKeys } from "./utilities";
import { World } from "./world";

const apple = 10;
let x:number = 20;
let previousTime = 0;
let deltaTime = 0;

class Game {
    player: Character;
    world: World;
    
    constructor() {
        this.player = new Character("/images/character.png");
        this.world = new World("/images/world.png");
    }
    tick = (deltaTime: number) => {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.fillRect(x, 100, 20, 20);
        this.player.tick();
        this.world.draw(ctx);
        this.player.draw(ctx, deltaTime);
    }
}

const player: Character = new Character("/images/character.png");
const canvas = document.getElementById("game_canvas") as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = 800;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
window.addEventListener("keypress", (e) => {
    if (e.key == "d") {
        inputKeys.add("d")
    }
})
window.addEventListener("keyup", (e) => {
    if (e.key == "d") {
        inputKeys.delete("d");
    }
})
const game = new Game();
const animate = (currentTime: number = 0) => {
    deltaTime = (currentTime - previousTime) / 1000;
    previousTime = currentTime;
    // console.log(deltaTime);
    if (inputKeys.has("d")) {
        x++;
    }
    game.tick(deltaTime);
    requestAnimationFrame(animate);
}
export {
    apple,
    animate
}