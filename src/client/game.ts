import { Character, Player, Animal } from "./character"
import { inputKeys, MapName, Vector2 } from "./utilities";
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
    currentMap: MapName = "world";
    private isChangingWorld = false;
    private arrivalSwitcherId: number | null = null;
    mobileUI: MobileUI;
    isMobileScreen: boolean;
    isTouchDevice: boolean;
    private readonly startScreenImage = new Image();
    private readonly helperIconImage = new Image();
    private readonly globeIconImage = new Image();
    private markerAnimationTime = 0;
    private readonly backgroundMusic = new Audio(assetUrl("sounds/10 - Dark Castle.ogg"));
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
        window.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !this.gameStarted) {
                event.preventDefault();
                this.startGame();
            }
        });
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
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.35;
        this.startScreenImage.src = assetUrl("images/scenery/view_1.png");
        this.helperIconImage.src = assetUrl("images/helper_icon.png");
        this.globeIconImage.src = assetUrl("images/globe_icon.png");
        canvas.addEventListener("pointerdown", this.handleStartPointer);
        this.world = new World(assetUrl("images/world.png"), assetUrl("images/world_front.png"));
        this.player = new Player(assetUrl("images/character.png"));
        this.dog = new Animal(assetUrl("images/animal.png"));
        this.interactionHandler = new InteractionHandler(this.world, this.player);
        this.interactionHandler.onTravel = (destination) => { void this.changeworld(destination, true); };
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
        if (!this.interactionHandler.isGlobeMenuOpen) this.player.tick(deltaTime, this.world.collisionData);
        this.markerAnimationTime += Math.max(0, deltaTime);
        this.checkMapSwitchers();
        this.dog.approachTarget(this.player, deltaTime);
        
        this.world.draw(ctx, this.player.getWorldPos());
        this.world.drawAnimatedSprites(ctx, this.player.getWorldPos(), deltaTime);
        this.drawViewPoints();
        this.drawMapSwitchers();
        this.drawInfoLocations();
        this.drawGlobes();
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
            this.startGame();
        }
    }
    private startGame = () => {
        if (this.gameStarted) return;
        this.gameStarted = true;
        void this.backgroundMusic.play().catch((error: unknown) => {
            console.warn("Unable to start background music:", error);
        });
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
        ctx.fillText("Dispersed Memory", canvas.width / 2, canvas.height * 0.3);
        // ctx.shadowBlur = 0;
        const button = this.getStartButtonBounds();
        ctx.fillStyle = "#fff4df";
        ctx.font = "18px Arial";
        ctx.fillText("WASD to move  • Hold I to interact", canvas.width / 2, button.y - 24);
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
    changeworld = async (destinationMap: MapName, preferEntrySwitcher = false) => {
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
        const rowThreeEntry = preferEntrySwitcher
            ? nextWorld.mapSwitchers.find((item) =>
                Number(item.properties?.find((property) => property.name === "row")?.value) === 3
            )
            : undefined;
        const arrivalSwitcher = rowThreeEntry ?? nextWorld.mapSwitchers.find((item) =>
            item.properties.some((property) => property.name === "targetMap" && property.value === this.currentMap)
        );
        const start = nextWorld.startingPoints[0];
        const destination = arrivalSwitcher
            ? { x: (arrivalSwitcher.x + arrivalSwitcher.width / 2) * 2, y: (arrivalSwitcher.y + arrivalSwitcher.height / 2) * 2 }
            : start
                ? { x: (start.x + start.width / 2) * 2, y: (start.y + start.height / 2) * 2 }
                : nextWorld.mapSwitchers[0]
                    ? { x: (nextWorld.mapSwitchers[0].x + nextWorld.mapSwitchers[0].width / 2) * 2, y: (nextWorld.mapSwitchers[0].y + nextWorld.mapSwitchers[0].height / 2) * 2 }
                    : { x: 800, y: 640 };
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
        if (destinationMap !== "world" && destinationMap !== "world_2" && destinationMap !== "port_world" && destinationMap !== "reflection_world" && destinationMap !== "world_4" && destinationMap !== "world_5") {
            console.error(`Unknown targetMap on map switcher: ${String(destinationMap)}`);
            return;
        }
        this.changeworld(destinationMap);
    }
    private drawMapSwitchers = () => {
        const cameraOffset = this.player.getWorldPos();
        this.world.mapSwitchers.forEach((switcher) => {
            this.drawMarker(switcher, cameraOffset, 1);
        });
    }

    private drawInfoLocations = () => {
        const cameraOffset = this.player.getWorldPos();
        this.world.infoLocations.forEach((location) => {
            if (!location.visible) return;
            this.drawMarker(location, cameraOffset, 1);
        });
    }

    private drawGlobes = () => {
        if (!this.globeIconImage.complete || this.globeIconImage.naturalWidth === 0) return;
        const cameraOffset = this.player.getWorldPos();
        this.world.globes.forEach((globe) => {
            if (!globe.visible) return;
            const property = (name: string) => globe.properties?.find((item) => item.name === name)?.value;
            const firstFrame = Math.max(0, Math.min(2, Math.floor(Number(property("col_start")) || 0)));
            const requestedLastFrame = Number(property("col_end"));
            const lastFrame = Number.isFinite(requestedLastFrame)
                ? Math.max(firstFrame + 1, Math.min(3, Math.floor(requestedLastFrame)))
                : 3;
            const frameCount = lastFrame - firstFrame;
            const frame = firstFrame + Math.floor(this.markerAnimationTime * 8) % frameCount;
            ctx.drawImage(
                this.globeIconImage,
                frame * 16, 0, 16, 17,
                (globe.x * 2 + cameraOffset.x) * GLOBAL_SCALE,
                (globe.y * 2 + cameraOffset.y) * GLOBAL_SCALE,
                globe.width * 2 * GLOBAL_SCALE,
                globe.height * 2 * GLOBAL_SCALE
            );
        });
    }

    private drawViewPoints = () => {
        const cameraOffset = this.player.getWorldPos();
        this.world.viewPoints.forEach((point) => {
            if (!point.visible) return;
            this.drawMarker(point, cameraOffset, 3);
        });
    }

    private drawMarker = (marker: { x: number; y: number; width: number; height: number; properties?: Array<{ name: string; value: string | number }> }, cameraOffset: Vector2, defaultRow: number) => {
        if (!this.helperIconImage.complete || this.helperIconImage.naturalWidth === 0) return;
        const property = (name: string) => marker.properties?.find((item) => item.name === name)?.value;
        const row = Math.max(1, Math.floor(Number(property("row")) || defaultRow));
        const colStart = Math.max(0, Math.floor(Number(property("col_start")) || 0));
        const requestedColEnd = Number(property("col_end"));
        const colEnd = Number.isFinite(requestedColEnd) ? Math.floor(requestedColEnd) : 3;
        const frameCount = Math.max(1, Math.min(3, colEnd) - Math.min(2, colStart));
        const firstFrame = Math.min(2, colStart);
        const frame = firstFrame + Math.floor(this.markerAnimationTime * 8) % frameCount;
        const frameWidth = 16;
        const frameHeight = 17;
        const x = (marker.x * 2 + cameraOffset.x) * GLOBAL_SCALE;
        const y = (marker.y * 2 + cameraOffset.y) * GLOBAL_SCALE;
        const width = marker.width * 2 * GLOBAL_SCALE;
        const height = marker.height * 2 * GLOBAL_SCALE;
        ctx.drawImage(this.helperIconImage, frame * frameWidth, (row - 1) * frameHeight, frameWidth, frameHeight, x, y, width, height);
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
