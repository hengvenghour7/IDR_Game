import { Character, Player, Animal } from "./character"
import { inputKeys, Vector2 } from "./utilities";
import { World } from "./world";
import { canvas } from "./globalVar";
import { InteractionHandler } from "./interactionHandler";

let previousTime = 0;
let deltaTime = 0;

class Game {
    player: Player;
    world: World;
    dog: Animal;
    interactionHandler: InteractionHandler;
    
    constructor() {
        window.addEventListener("keypress", (e) => {
            inputKeys.add(e.key);
            inputKeys.delete(e.key+"u");
        })
        window.addEventListener("keyup", (e) => {
            inputKeys.delete(e.key);
            inputKeys.add(e.key+"u");
        })
        window.addEventListener("resize", (e) => {
            // console.log("resize ", canvas.clientWidth);
            // canvas.width = canvas.clientWidth;
            // canvas.height = canvas.clientHeight;
        })  
        this.world = new World("/images/world.png");
        this.player = new Player("/images/character.png");
        this.dog = new Animal("/images/animal.png");
        this.interactionHandler = new InteractionHandler(this.world, this.player);
    }
    tick = (deltaTime: number) => {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.player.tick(deltaTime, this.world.collisionData);
        this.dog.approachTarget(this.player, deltaTime);
        
        this.world.draw(ctx, this.player.getWorldPos());
        this.player.draw(ctx, deltaTime);
        this.dog.draw(ctx, deltaTime, this.player.getWorldPos(), this.player.worldPos);
        this.interactionHandler.tick(ctx, this.player.getWorldPos());
    }
    changeworld = ( destination: Vector2) => {

    }
    prepareWorld = () => {

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