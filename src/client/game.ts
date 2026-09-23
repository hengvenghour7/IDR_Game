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
        window.addEventListener("keypress", (e) => {
        inputKeys.add(e.key);
        })
        window.addEventListener("keyup", (e) => {
            inputKeys.delete(e.key);
        })
        this.world = new World("/images/world.png");
        this.player = new Character("/images/character.png");
    }
    tick = (deltaTime: number) => {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.fillRect(x, 100, 20, 20);
        this.player.tick(deltaTime, this.world.collisionData);
        this.world.draw(ctx);
        this.player.draw(ctx, deltaTime);
    }
}

const canvas = document.getElementById("game_canvas") as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = 800;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.imageSmoothingEnabled = false;

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