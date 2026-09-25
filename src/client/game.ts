import { Character, Player, Animal } from "./character"
import { inputKeys, Vector2 } from "./utilities";
import { World } from "./world";
import { canvas } from "./globalVar";
import { InteractionHandler } from "./interactionHandler";
import { checkRectangleCollision } from "./helpers";

let previousTime = 0;
let deltaTime = 0;

class Game {
    player: Player;
    world: World;
    dog: Animal;
    interactionHandler: InteractionHandler;
    currentMap: "world" | "world_2" = "world";
    private isChangingWorld = false;
    private arrivalSwitcherId: number | null = null;
    
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
        this.checkMapSwitchers();
        this.dog.approachTarget(this.player, deltaTime);
        
        this.world.draw(ctx, this.player.getWorldPos());
        this.drawMapSwitchers();
        this.player.draw(ctx, deltaTime);
        this.dog.draw(ctx, deltaTime, this.player.getWorldPos(), this.player.worldPos);
        this.interactionHandler.tick(ctx, this.player.getWorldPos());
    }
    changeworld = async (destinationMap: "world" | "world_2") => {
        if (destinationMap === this.currentMap || this.isChangingWorld) return;
        this.isChangingWorld = true;
        const nextWorld = new World(
            `/images/${destinationMap}.png`,
            `/map_properties/${destinationMap}.tmj`
        );
        try {
            await nextWorld.prepare();
        } catch (error) {
            this.isChangingWorld = false;
            console.error(`Unable to load map ${destinationMap}:`, error);
            return;
        }
        const arrivalSwitcher = nextWorld.mapSwitchers.find((item) =>
            item.properties.some((property) => property.name === "targetMap" && property.value === this.currentMap)
        );
        if (!arrivalSwitcher) {
            this.isChangingWorld = false;
            console.error(`No reciprocal map switcher in ${destinationMap} points to ${this.currentMap}`);
            return;
        }
        const destination = {
            x: (arrivalSwitcher.x + arrivalSwitcher.width / 2) * 2,
            y: (arrivalSwitcher.y + arrivalSwitcher.height / 2) * 2
        };
        this.currentMap = destinationMap;
        this.world = nextWorld;
        this.interactionHandler.world = nextWorld;
        this.arrivalSwitcherId = arrivalSwitcher.id;
        // The player's camera offset is the inverse of their map position.
        this.player.worldPos = {
            x: destination.x - canvas.clientWidth / 2,
            y: destination.y - canvas.clientHeight / 2
        };
        // Keep the dog near the player; its position is stored in world space too.
        this.dog.worldPos = {
            x: destination.x + 48,
            y: destination.y
        };
        this.interactionHandler.isViewOpen = false;
        this.interactionHandler.isViewAvailable = false;
        this.isChangingWorld = false;
    }
    prepareWorld = async () => {
        await this.world.prepare();
    }
    private checkMapSwitchers = () => {
        if (this.isChangingWorld) return;
        const playerBox = {
            x: this.player.worldPos.x + canvas.clientWidth / 2,
            y: this.player.worldPos.y + canvas.clientHeight / 2,
            width: this.player.collisionBox.width,
            height: this.player.collisionBox.height
        };
        const overlappingSwitchers = this.world.mapSwitchers.filter((item) =>
            checkRectangleCollision(playerBox, {
                x: item.x * 2,
                y: item.y * 2,
                width: item.width * 2,
                height: item.height * 2
            })
        );
        if (!overlappingSwitchers.some((item) => item.id === this.arrivalSwitcherId)) {
            this.arrivalSwitcherId = null;
        }
        const switcher = overlappingSwitchers.find((item) => item.id !== this.arrivalSwitcherId);
        if (!switcher) return;

        const destinationMap = switcher.properties.find((property) => property.name === "targetMap")?.value;
        if (destinationMap !== "world" && destinationMap !== "world_2") {
            console.error(`Unknown targetMap on map switcher: ${String(destinationMap)}`);
            return;
        }
        this.changeworld(destinationMap);
    }
    private drawMapSwitchers = () => {
        ctx.save();
        ctx.fillStyle = "rgba(0, 200, 255, 0.25)";
        ctx.strokeStyle = "#00c8ff";
        ctx.lineWidth = 3;
        const cameraOffset = this.player.getWorldPos();
        this.world.mapSwitchers.forEach((switcher) => {
            const x = switcher.x * 2 + cameraOffset.x;
            const y = switcher.y * 2 + cameraOffset.y;
            const width = switcher.width * 2;
            const height = switcher.height * 2;
            ctx.fillRect(x, y, width, height);
            ctx.strokeRect(x, y, width, height);
        });
        ctx.restore();
    }
}

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.imageSmoothingEnabled = false;

const game = new Game();
const prepared = game.prepareWorld();
const animate = (currentTime: number = 0) => {
    deltaTime = (currentTime - previousTime) / 1000;
    previousTime = currentTime;
    game.tick(deltaTime);
    requestAnimationFrame(animate);
}
export {
    animate
}
