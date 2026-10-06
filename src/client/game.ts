import { Character, Player, Animal } from "./character"
import { inputKeys, Vector2 } from "./utilities";
import { World } from "./world";
import { assetUrl, canvas, GLOBAL_SCALE, resizeCanvas } from "./globalVar";
import { InteractionHandler } from "./interactionHandler";
import { checkRectangleCollision } from "./helpers";
import { MobileUI } from "./UI";

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
    mobileUI: MobileUI;
    isMobileScreen: boolean;
    isTouchDevice: boolean;
    private readonly startScreenImage = new Image();
    private gameStarted = false;
    
    constructor() {
        this.isMobileScreen = false;

        window.addEventListener("keypress", (e) => {
            inputKeys.add(e.key);
            inputKeys.delete(e.key+"u");
        })
        window.addEventListener("keyup", (e) => {
            inputKeys.delete(e.key);
            inputKeys.add(e.key+"u");
        })
        window.addEventListener("resize", () => {
            // Save the player's map-space position before the canvas center changes.
            const playerMapX = this.player.worldPos.x + canvas.width / (2 * GLOBAL_SCALE);
            const playerMapY = this.player.worldPos.y + canvas.height / (2 * GLOBAL_SCALE);
            resizeCanvas();
            // worldPos is the camera offset, so compensate for the new screen center.
            this.player.worldPos.x = playerMapX - canvas.width / (2 * GLOBAL_SCALE);
            this.player.worldPos.y = playerMapY - canvas.height / (2 * GLOBAL_SCALE);
            ctx.imageSmoothingEnabled = false;
            this.mobileUI.resize();
        });

        this.isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
        this.startScreenImage.src = assetUrl("images/scenery/view_1.png");
        canvas.addEventListener("pointerdown", this.handleStartPointer);
        this.world = new World(assetUrl("images/world.png"), assetUrl("images/world_front.png"));
        this.player = new Player(assetUrl("images/character.png"));
        this.dog = new Animal(assetUrl("images/animal.png"));
        this.interactionHandler = new InteractionHandler(this.world, this.player);
        this.mobileUI = new MobileUI;
    }
    tick = (deltaTime: number) => {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "BLACK"
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (!this.gameStarted) {
            this.drawStartScreen();
            return;
        }
        this.player.tick(deltaTime, this.world.collisionData);
        this.checkMapSwitchers();
        this.dog.approachTarget(this.player, deltaTime);
        
        this.world.draw(ctx, this.player.getWorldPos());
        this.world.drawAnimatedSprites(ctx, this.player.getWorldPos(), deltaTime);
        this.drawViewPoints();
        this.drawMapSwitchers();
        this.player.draw(ctx, deltaTime);
        this.dog.draw(ctx, deltaTime, this.player.getWorldPos(), this.player.worldPos);
        this.world.drawFront(ctx, this.player.getWorldPos());
        this.interactionHandler.tick(ctx);
        if (this.isTouchDevice) {
            this.mobileUI.draw(ctx);
        }
    }
    private handleStartPointer = (event: PointerEvent) => {
        if (this.gameStarted) return;
        const bounds = canvas.getBoundingClientRect();
        const x = (event.clientX - bounds.left) * canvas.width / bounds.width;
        const y = (event.clientY - bounds.top) * canvas.height / bounds.height;
        const button = this.getStartButtonBounds();
        if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
            this.gameStarted = true;
        }
    }
    private getStartButtonBounds = () => ({
        x: canvas.width / 2 - 110,
        y: canvas.height * 0.76 - 30,
        width: 220,
        height: 60
    });
    private drawStartScreen = () => {
        if (!this.startScreenImage.complete || this.startScreenImage.naturalWidth === 0) return;
        const coverScale = Math.max(canvas.width / this.startScreenImage.naturalWidth, canvas.height / this.startScreenImage.naturalHeight);
        const width = this.startScreenImage.naturalWidth * coverScale;
        const height = this.startScreenImage.naturalHeight * coverScale;
        ctx.save();
        ctx.drawImage(this.startScreenImage, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
        ctx.fillStyle = "rgba(13, 20, 19, 0.38)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff4df";
        // ctx.shadowColor = "rgba(0,0,0,0.65)";
        // ctx.shadowBlur = 14;
        ctx.font = `bold ${Math.max(38, Math.min(38, canvas.width * 0.085))}px Arial`;
        ctx.fillText("Oil Museum path Finder", canvas.width / 2, canvas.height * 0.3);
        // ctx.shadowBlur = 0;
        const button = this.getStartButtonBounds();
        ctx.fillStyle = "BLACK";
        ctx.beginPath();
        ctx.roundRect(button.x, button.y, button.width, button.height, 12);
        ctx.fill();
        ctx.strokeStyle = "#ffbd75";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.font = "bold 24px Arial";
        ctx.fillText("START GAME", canvas.width / 2, button.y + 39);
        ctx.restore();
    }
    changeworld = async (destinationMap: "world" | "world_2") => {
        if (destinationMap === this.currentMap || this.isChangingWorld) return;
        this.isChangingWorld = true;
        const nextWorld = new World(
            assetUrl(`images/${destinationMap}.png`),
            destinationMap === "world" ? assetUrl("images/world_front.png") : "",
            assetUrl(`map_properties/${destinationMap}.tmj`)
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
            x: destination.x - canvas.width / (2 * GLOBAL_SCALE),
            y: destination.y - canvas.height / (2 * GLOBAL_SCALE)
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
        const startingPoint = this.world.startingPoints[0];
        if (startingPoint) {
            const playerMapX = (startingPoint.x + startingPoint.width / 2) * 2;
            const playerMapY = (startingPoint.y + startingPoint.height / 2) * 2;
            this.player.worldPos = {
                x: playerMapX - canvas.width / (2 * GLOBAL_SCALE),
                y: playerMapY - canvas.height / (2 * GLOBAL_SCALE)
            };
        }
    }
    private checkMapSwitchers = () => {
        if (this.isChangingWorld) return;
        const playerBox = {
            x: this.player.worldPos.x + canvas.width / (2 * GLOBAL_SCALE),
            y: this.player.worldPos.y + canvas.height / (2 * GLOBAL_SCALE),
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
            const x = (switcher.x * 2 + cameraOffset.x) * GLOBAL_SCALE;
            const y = (switcher.y * 2 + cameraOffset.y) * GLOBAL_SCALE;
            const width = switcher.width * 2 * GLOBAL_SCALE;
            const height = switcher.height * 2 * GLOBAL_SCALE;
            ctx.fillRect(x, y, width, height);
            ctx.strokeRect(x, y, width, height);
        });
        ctx.restore();
    }

    private drawViewPoints = () => {
        ctx.save();
        ctx.fillStyle = "rgba(255, 140, 0, 0.3)";
        ctx.strokeStyle = "orange";
        ctx.lineWidth = 3;
        const cameraOffset = this.player.getWorldPos();
        this.world.viewPoints.forEach((point) => {
            if (!point.visible) return;

            const x = (point.x * 2 + cameraOffset.x) * GLOBAL_SCALE;
            const y = (point.y * 2 + cameraOffset.y) * GLOBAL_SCALE;
            const width = point.width * 2 * GLOBAL_SCALE;
            const height = point.height * 2 * GLOBAL_SCALE;
            ctx.fillRect(x, y, width, height);
            ctx.strokeRect(x, y, width, height);
        });
        ctx.restore();
    }
}

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.imageSmoothingEnabled = false;

const game = new Game();
game.prepareWorld();
const animate = (currentTime: number = 0) => {
    deltaTime = (currentTime - previousTime) / 1000;
    previousTime = currentTime;
    game.tick(deltaTime);
    requestAnimationFrame(animate);
}
export {
    animate
}
