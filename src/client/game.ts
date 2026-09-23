import { Character, Player, Animal } from "./character"
import { inputKeys } from "./utilities";
import { World } from "./world";
import { canvas } from "./globalVar";

let previousTime = 0;
let deltaTime = 0;

class Game {
    player: Player;
    world: World;
    dog: Animal;
    
    constructor() {
        window.addEventListener("keypress", (e) => {
        inputKeys.add(e.key);
        })
        window.addEventListener("keyup", (e) => {
            inputKeys.delete(e.key);
        })
        this.world = new World("/images/world.png");
        this.player = new Player("/images/character.png");
        this.dog = new Animal("/images/animal.png")
    }
    tick = (deltaTime: number) => {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.player.tick(deltaTime, this.world.collisionData);
        this.world.draw(ctx, this.player.getWorldPos());
        this.player.draw(ctx, deltaTime);
        this.dog.draw(ctx, deltaTime, this.player.getWorldPos(), this.player.worldPos);
        this.dog.approachTarget(this.player, deltaTime);
    }
}

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.imageSmoothingEnabled = false;

const game = new Game();
const animate = (currentTime: number = 0) => {
    deltaTime = (currentTime - previousTime) / 1000;
    previousTime = currentTime;
    game.tick(deltaTime);
    requestAnimationFrame(animate);
}
export {
    animate
}