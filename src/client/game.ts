import { Character, Player, Animal } from "./character"
import { inputKeys, MapName, Vector2 } from "./utilities";
import { World } from "./world";
import { assetUrl, canvas, GLOBAL_SCALE, resizeCanvas, SCALE_OPTIONS, setGlobalScale } from "./globalVar";
import { InteractionHandler } from "./interactionHandler";
import { checkRectangleCollision } from "./helpers";
import { MobileUI } from "./UI";

let previousTime = 0;
let deltaTime = 0;

class Game {
    private readonly totalMemoryCount = 7;
    player: Player;
    world: World;
    dog: Animal;
    interactionHandler: InteractionHandler;
    currentMap: MapName = "reflection_world";
    private isChangingWorld = false;
    private arrivalSwitcherId: number | null = null;
    mobileUI: MobileUI;
    isMobileScreen: boolean;
    isTouchDevice: boolean;
    private readonly startScreenImage = new Image();
    private readonly helperIconImage = new Image();
    private readonly globeIconImage = new Image();
    private readonly memoryIconImage = new Image();
    private readonly soundIconImage = new Image();
    private readonly muteIconImage = new Image();
    private readonly memoryImages = new Map<string, HTMLImageElement>();
    private readonly collectedMemories: string[] = [];
    private readonly memoryVisibility = new Map<string, boolean>();
    private isMemoriesListOpen = true;
    private markerAnimationTime = 0;
    private readonly backgroundMusic = new Audio(assetUrl("sounds/3 - Revelation.ogg"));
    private isMusicMuted = false;
    private musicNeedsTap = false;
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
        this.backgroundMusic.preload = "auto";
        this.backgroundMusic.addEventListener("error", () => {
            console.error("Unable to load background music:", this.backgroundMusic.error);
        });
        this.startScreenImage.src = assetUrl("images/scenery/view_1.png");
        this.helperIconImage.src = assetUrl("images/helper_icon.png");
        this.globeIconImage.src = assetUrl("images/globe_icon.png");
        this.memoryIconImage.src = assetUrl("images/memories_icon.png");
        this.soundIconImage.src = assetUrl("images/sound.png");
        this.muteIconImage.src = assetUrl("images/mute.png");
        canvas.addEventListener("pointerdown", this.handleStartPointer);
        canvas.addEventListener("pointerdown", this.handleSoundButtonPointer);
        canvas.addEventListener("pointerdown", this.handleScaleButtonPointer);
        canvas.addEventListener("pointerdown", this.handleMemoriesPanelPointer);
        this.world = new World(assetUrl("images/reflection_world.png"), "", assetUrl("map_properties/reflection_world.tmj"));
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
        this.drawCollectedMemoryStack();
        this.world.drawAnimatedSprites(ctx, this.player.getWorldPos(), deltaTime);
        this.drawViewPoints();
        this.drawMapSwitchers();
        this.drawInfoLocations();
        this.drawGlobes();
        this.drawMemories();
        this.player.draw(ctx, deltaTime);
        this.dog.draw(ctx, deltaTime, this.player.getWorldPos(), this.player.worldPos);
        this.world.drawFront(ctx, this.player.getWorldPos());
        this.interactionHandler.tick(ctx);
        this.drawMemoriesPanel();
        this.drawSoundButton(ctx);
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
    private handleSoundButtonPointer = (event: PointerEvent) => {
        if (!this.gameStarted) return;
        const bounds = canvas.getBoundingClientRect();
        const x = (event.clientX - bounds.left) * canvas.width / bounds.width;
        const y = (event.clientY - bounds.top) * canvas.height / bounds.height;
        const button = this.getSoundButtonBounds();
        if (x < button.x || x > button.x + button.size || y < button.y || y > button.y + button.size) return;
        event.preventDefault();
        if (this.isMusicMuted || this.backgroundMusic.paused) {
            this.isMusicMuted = false;
            this.backgroundMusic.muted = false;
            this.playBackgroundMusic();
        } else {
            this.isMusicMuted = true;
            this.backgroundMusic.muted = true;
        }
    }
    private getSoundButtonBounds = () => ({
        x: canvas.width - 52,
        y: 66,
        size: 40
    });
    private getScaleButtonBounds = () => ({
        x: this.isTouchDevice ? canvas.width - 72 : canvas.width - 200,
        y: 16,
        width: 56,
        height: 40,
        gap: 8
    });
    private handleScaleButtonPointer = (event: PointerEvent) => {
        if (!this.gameStarted) return;
        const bounds = canvas.getBoundingClientRect();
        const x = (event.clientX - bounds.left) * canvas.width / bounds.width;
        const y = (event.clientY - bounds.top) * canvas.height / bounds.height;
        const buttons = this.getScaleButtonBounds();
        if (y < buttons.y || y > buttons.y + buttons.height) return;
        let buttonIndex: number;
        if (this.isTouchDevice) {
            if (x < buttons.x || x > buttons.x + buttons.width) return;
            const currentIndex = SCALE_OPTIONS.indexOf(GLOBAL_SCALE as typeof SCALE_OPTIONS[number]);
            buttonIndex = (currentIndex + 1) % SCALE_OPTIONS.length;
        } else {
            buttonIndex = Math.floor((x - buttons.x) / (buttons.width + buttons.gap));
            if (buttonIndex < 0 || buttonIndex >= SCALE_OPTIONS.length
                || x > buttons.x + buttonIndex * (buttons.width + buttons.gap) + buttons.width) return;
        }
        event.preventDefault();

        const playerMapX = this.player.worldPos.x + canvas.width / (2 * GLOBAL_SCALE);
        const playerMapY = this.player.worldPos.y + canvas.height / (2 * GLOBAL_SCALE);
        setGlobalScale(SCALE_OPTIONS[buttonIndex]);
        this.player.worldPos.x = playerMapX - canvas.width / (2 * GLOBAL_SCALE);
        this.player.worldPos.y = playerMapY - canvas.height / (2 * GLOBAL_SCALE);
    }
    private drawSoundButton = (context: CanvasRenderingContext2D) => {
        const icon = this.isMusicMuted ? this.muteIconImage : this.soundIconImage;
        if (!icon.complete || icon.naturalWidth === 0) return;
        const button = this.getSoundButtonBounds();
        context.drawImage(icon, button.x, button.y, button.size, button.size);
        if (this.musicNeedsTap) {
            context.save();
            context.font = "14px Arial";
            context.textAlign = "right";
            context.textBaseline = "middle";
            context.fillStyle = "#fff4df";
            context.fillText("Tap for sound", button.x - 8, button.y + button.size / 2);
            context.restore();
        }
        const scaleButtons = this.getScaleButtonBounds();
        const optionsToDraw = this.isTouchDevice
            ? [GLOBAL_SCALE]
            : SCALE_OPTIONS;
        optionsToDraw.forEach((scale, index) => {
            const x = scaleButtons.x + index * (scaleButtons.width + scaleButtons.gap);
            const isSelected = scale === GLOBAL_SCALE;
            context.fillStyle = "rgba(0, 0, 0, 0.7)";
            context.beginPath();
            context.roundRect(x, scaleButtons.y, scaleButtons.width, scaleButtons.height, 8);
            context.fill();
            context.strokeStyle = isSelected ? "#4ade80" : "#ffbd75";
            context.lineWidth = isSelected ? 3 : 2;
            context.stroke();
            context.fillStyle = "#fff4df";
            context.font = "bold 14px Arial";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(`${scale}×`, x + scaleButtons.width / 2, scaleButtons.y + scaleButtons.height / 2);
        });
    }
    private startGame = () => {
        if (this.gameStarted) return;
        this.gameStarted = true;
        this.playBackgroundMusic();
    }
    private playBackgroundMusic = () => {
        void this.backgroundMusic.play().catch((error: unknown) => {
            this.musicNeedsTap = true;
            console.warn("Unable to start background music:", error);
        }).then(() => {
            if (!this.backgroundMusic.paused) this.musicNeedsTap = false;
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
    changeworld = async (destinationMap: MapName, travelToGlobe = false) => {
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
        const destinationGlobe = travelToGlobe ? nextWorld.globes.find((globe) => globe.visible) : undefined;
        const arrivalSwitcher = destinationGlobe ? undefined : nextWorld.mapSwitchers.find((item) =>
            item.properties.some((property) => property.name === "targetMap" && property.value === this.currentMap)
        );
        const start = nextWorld.startingPoints[0];
        const destination = destinationGlobe
            ? { x: (destinationGlobe.x + destinationGlobe.width / 2) * 2, y: (destinationGlobe.y + destinationGlobe.height / 2) * 2 }
            : arrivalSwitcher
            ? { x: (arrivalSwitcher.x + arrivalSwitcher.width / 2) * 2, y: (arrivalSwitcher.y + arrivalSwitcher.height / 2) * 2 }
            : start
                ? { x: (start.x + start.width / 2) * 2, y: (start.y + start.height / 2) * 2 }
                : nextWorld.mapSwitchers[0]
                    ? { x: (nextWorld.mapSwitchers[0].x + nextWorld.mapSwitchers[0].width / 2) * 2, y: (nextWorld.mapSwitchers[0].y + nextWorld.mapSwitchers[0].height / 2) * 2 }
                    : { x: 800, y: 640 };
        this.currentMap = destinationMap;
        this.world = nextWorld;
        this.interactionHandler.world = nextWorld;
        this.arrivalSwitcherId = arrivalSwitcher?.id ?? null;
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
        if (destinationMap !== "world" && destinationMap !== "world_2" && destinationMap !== "port_world" && destinationMap !== "reflection_world" && destinationMap !== "world_4" && destinationMap !== "world_5" && destinationMap !== "birth_world") {
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
            const frame = firstFrame + Math.floor(this.markerAnimationTime * 7) % frameCount;
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

    private drawMemories = () => {
        if (!this.memoryIconImage.complete || this.memoryIconImage.naturalWidth === 0) return;
        const cameraOffset = this.player.getWorldPos();
        this.world.memories.forEach((memory) => {
            if (!memory.visible) return;
            const key = memory.properties?.find((property) => property.name === "key")?.value;
            if (typeof key !== "string" || this.collectedMemories.includes(key)) return;
            const memoryBox = {
                x: memory.x * 2,
                y: memory.y * 2,
                width: memory.width * 2,
                height: memory.height * 2
            };
            if (checkRectangleCollision(memoryBox, this.player.getCollisionBox())) {
                this.collectedMemories.push(key);
                this.memoryVisibility.set(key, true);
                return;
            }
            const property = (name: string) => memory.properties?.find((item) => item.name === name)?.value;
            const firstFrame = Math.max(0, Math.min(2, Math.floor(Number(property("col_start")) || 0)));
            const requestedLastFrame = Number(property("col_end"));
            const lastFrame = Number.isFinite(requestedLastFrame)
                ? Math.max(firstFrame + 1, Math.min(3, Math.floor(requestedLastFrame)))
                : 3;
            const frameCount = lastFrame - firstFrame;
            const frame = firstFrame + Math.floor(this.markerAnimationTime * 7) % frameCount;
            ctx.drawImage(
                this.memoryIconImage,
                frame * 16, 0, 16, 17,
                (memory.x * 2 + cameraOffset.x) * GLOBAL_SCALE,
                (memory.y * 2 + cameraOffset.y) * GLOBAL_SCALE,
                memory.width * 2 * GLOBAL_SCALE,
                memory.height * 2 * GLOBAL_SCALE
            );
        });
    }

    private drawCollectedMemoryStack = () => {
        if (this.currentMap !== "reflection_world" || this.collectedMemories.length === 0) return;

        this.getSortedCollectedMemories().forEach((key, index) => {
            if (this.memoryVisibility.get(key) === false) return;
            let image = this.memoryImages.get(key);
            if (!image) {
                image = new Image();
                image.src = assetUrl(`images/memories/${key}.png`);
                this.memoryImages.set(key, image);
            }
            if (!image.complete || image.naturalWidth === 0) return;
            // Memory images are full-map transparent layers, so align each at the
            // reflection map origin and use the same scale as the world texture.
            ctx.drawImage(
                image,
                this.player.getWorldPos().x * GLOBAL_SCALE,
                this.player.getWorldPos().y * GLOBAL_SCALE,
                1600 * 2 * GLOBAL_SCALE,
                1280 * 2 * GLOBAL_SCALE
            );
        });
    }

    private getMemoriesPanelLayout = () => {
        const x = 16;
        const y = 16;
        const width = Math.min(250, canvas.width - 32);
        const hintHeight = 30;
        const headerHeight = 34;
        const rowHeight = 30;
        const listHeight = this.isMemoriesListOpen ? this.collectedMemories.length * rowHeight : 0;
        return { x, y, width, height: hintHeight + headerHeight + listHeight, hintHeight, headerHeight, rowHeight };
    }

    private getSortedCollectedMemories = () => [...this.collectedMemories].sort((left, right) => {
        const leftOrder = Number(left.match(/^\d+/)?.[0] ?? Number.MAX_SAFE_INTEGER);
        const rightOrder = Number(right.match(/^\d+/)?.[0] ?? Number.MAX_SAFE_INTEGER);
        return leftOrder - rightOrder || left.localeCompare(right);
    });

    private drawMemoriesPanel = () => {
        const panel = this.getMemoriesPanelLayout();
        const memories = this.getSortedCollectedMemories();
        ctx.save();
        ctx.fillStyle = "rgba(20, 20, 24, 0.82)";
        ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 1;
        ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.font = "12px Arial";
        ctx.fillStyle = "#dedede";
        ctx.fillText("Collected memories below can be to toggle it on or off.", panel.x + 10, panel.y + panel.hintHeight / 2, panel.width - 20);
        const headerY = panel.y + panel.hintHeight;
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(panel.x, headerY, panel.width, panel.headerHeight);
        ctx.font = "bold 16px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Memories", panel.x + 10, headerY + panel.headerHeight / 2, panel.width - 100);
        ctx.textAlign = "right";
        ctx.fillText(`${this.collectedMemories.length}/${this.totalMemoryCount}`, panel.x + panel.width - 30, headerY + panel.headerHeight / 2);
        ctx.textAlign = "center";
        ctx.fillText(this.isMemoriesListOpen ? "▾" : "▸", panel.x + panel.width - 14, headerY + panel.headerHeight / 2);

        if (this.isMemoriesListOpen) memories.forEach((key, index) => {
            const rowY = headerY + panel.headerHeight + index * panel.rowHeight;
            const isEnabled = this.memoryVisibility.get(key) !== false;
            ctx.strokeStyle = "white";
            ctx.strokeRect(panel.x + 10, rowY + 7, 16, 16);
            if (isEnabled) {
                ctx.fillStyle = "#9bd36a";
                ctx.fillRect(panel.x + 13, rowY + 10, 10, 10);
            }
            const title = key.includes(".") ? key.slice(key.indexOf(".") + 1) : key;
            ctx.textAlign = "left";
            ctx.font = "14px Arial";
            ctx.fillStyle = isEnabled ? "white" : "#b8b8b8";
            ctx.fillText(title.charAt(0).toUpperCase() + title.slice(1), panel.x + 34, rowY + panel.rowHeight / 2, panel.width - 44);
        });
        ctx.restore();
    }

    private handleMemoriesPanelPointer = (event: PointerEvent) => {
        const bounds = canvas.getBoundingClientRect();
        const x = (event.clientX - bounds.left) * canvas.width / bounds.width;
        const y = (event.clientY - bounds.top) * canvas.height / bounds.height;
        const panel = this.getMemoriesPanelLayout();
        const headerY = panel.y + panel.hintHeight;
        if (x < panel.x || x > panel.x + panel.width || y < headerY || y > panel.y + panel.height) return;
        if (y < headerY + panel.headerHeight) {
            this.isMemoriesListOpen = !this.isMemoriesListOpen;
            event.preventDefault();
            return;
        }
        if (!this.isMemoriesListOpen) return;

        const index = Math.floor((y - headerY - panel.headerHeight) / panel.rowHeight);
        const key = this.getSortedCollectedMemories()[index];
        if (!key) return;
        this.memoryVisibility.set(key, this.memoryVisibility.get(key) === false);
        event.preventDefault();
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
        const frame = firstFrame + Math.floor(this.markerAnimationTime * 7) % frameCount;
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
