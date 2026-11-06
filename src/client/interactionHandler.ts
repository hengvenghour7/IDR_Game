import { World } from "./world";
import { Character, Player } from "./character";
import { checkRectangleCollision } from "./helpers";
import { MapName, Rectangle } from "./utilities";
import { inputKeys } from "./utilities";
import { assetUrl, canvas } from "./globalVar";

class InteractionHandler {
    world: World;
    character: Player;
    isViewOpen: boolean;
    isViewAvailable: boolean;
    viewImage: HTMLImageElement;
    isGlobeMenuOpen = false;
    selectedDestination = 0;
    onTravel: ((map: MapName) => void) | null = null;
    private readonly isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    private readonly destinations = [
        { map: "world", label: "1. World" },
        { map: "port_world", label: "2. Port" },
        { map: "reflection_world", label: "3. Reflection" },
        { map: "world_4", label: "4. World 4" },
        { map: "world_5", label: "5. World 5" }
    ] as const;

    constructor (world: World, character: Player) {
        this.world = world;
        this.character = character;
        this.isViewOpen = false;
        this.isViewAvailable = false;
        this.viewImage = new Image();
        this.viewImage.src = assetUrl("images/scenery/view_1.png")
        window.addEventListener("keydown", this.handleMenuKey);
        canvas.addEventListener("pointerdown", this.handleMenuPointer);
    }
    tick = (ctx: CanvasRenderingContext2D) => {
        this.isViewAvailable = false;
        let isInfoAvailable = false;
        let nearbyInfoText: string | null = null;
        let isGlobeAvailable = false;
        this.world.globes.forEach((globe) => {
            if (!globe.visible) return;
            const globeRect: Rectangle = { x: globe.x * 2, y: globe.y * 2, width: globe.width * 2, height: globe.height * 2 };
            if (checkRectangleCollision(globeRect, this.character.getCollisionBox())) {
                isGlobeAvailable = true;
                if (inputKeys.has("i")) this.isGlobeMenuOpen = true;
            }
        });
        this.world.infoLocations.forEach((location) => {
            if (!location.visible) return;
            const locationRect: Rectangle = {
                x: location.x * 2,
                y: location.y * 2,
                width: location.width * 2,
                height: location.height * 2
            };
            if (checkRectangleCollision(locationRect, this.character.getCollisionBox())) {
                isInfoAvailable = true;
                const info = location.properties?.find((item) => item.name === "info")?.value;
                if (inputKeys.has("i") && typeof info === "string") nearbyInfoText = info;
            }
        });
        this.world.viewPoints.forEach((p) => {
            const pRect: Rectangle = {
                // Tiled object coordinates are in 16px map units; world space uses 32px units.
                x: p.x * 2,
                y: p.y * 2,
                width: p.width * 2,
                height: p.height * 2
            };
            if (checkRectangleCollision(pRect, this.character.getCollisionBox())) {
                this.isViewAvailable = true;
                if (inputKeys.has("i") && !this.isViewOpen) {
                    this.isViewOpen = true;
                    const imgSrc = p.properties.find((item) => item.name === "imgSrc")?.value;
                    if (typeof imgSrc === "string") {
                        this.viewImage.src = imgSrc;
                    }
                }
            }
        })
        if (this.isGlobeMenuOpen) {
            this.drawGlobeMenu(ctx);
            return;
        }
        if (isGlobeAvailable || this.isViewAvailable || isInfoAvailable) {
            this.drawInteractionTooltip(
                ctx,
                isGlobeAvailable ? "Press I to travel" : isInfoAvailable ? "Hold I to read" : "Hold I to open view"
            );
        }
        if (nearbyInfoText !== null) {
            this.drawInfoText(ctx, nearbyInfoText);
        }
        if (this.isViewOpen) {
            if (this.viewImage.complete && this.viewImage.naturalWidth > 0) {
                const scale = Math.min(
                    canvas.width / this.viewImage.naturalWidth,
                    canvas.height / this.viewImage.naturalHeight
                );
                const width = this.viewImage.naturalWidth * scale;
                const height = this.viewImage.naturalHeight * scale;
                ctx.fillStyle = "BLACK";
                ctx.fillRect(0,0, canvas.clientWidth, canvas.clientHeight);
                ctx.drawImage(
                    this.viewImage,
                    (canvas.width - width) / 2,
                    (canvas.height - height) / 2,
                    width,
                    height
                );
                ctx.restore();
            }

        }
        if (inputKeys.has("iu") && this.isViewOpen) {
            this.isViewOpen = false;
        }
    }

    private handleMenuKey = (event: KeyboardEvent) => {
        if (!this.isGlobeMenuOpen) return;
        if (event.key === "Escape") {
            this.isGlobeMenuOpen = false;
            return;
        }
        if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
            event.preventDefault();
            this.selectedDestination = (this.selectedDestination + 1) % this.destinations.length;
        } else if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
            event.preventDefault();
            this.selectedDestination = (this.selectedDestination + this.destinations.length - 1) % this.destinations.length;
        } else if (event.key === "Enter") {
            event.preventDefault();
            this.chooseDestination(this.selectedDestination);
        }
    };

    private handleMenuPointer = (event: PointerEvent) => {
        if (!this.isGlobeMenuOpen) return;
        const bounds = canvas.getBoundingClientRect();
        const x = (event.clientX - bounds.left) * canvas.width / bounds.width;
        const y = (event.clientY - bounds.top) * canvas.height / bounds.height;
        const panel = this.getMenuPanel();
        for (let index = 0; index < this.destinations.length; index++) {
            const rowY = panel.y + 74 + index * 48;
            if (x >= panel.x + 24 && x <= panel.x + panel.width - 24 && y >= rowY && y <= rowY + 40) {
                this.chooseDestination(index);
                return;
            }
        }
    };

    private chooseDestination(index: number) {
        const destination = this.destinations[index];
        if (!destination) return;
        this.isGlobeMenuOpen = false;
        this.onTravel?.(destination.map);
    }

    private getMenuPanel = () => {
        const width = Math.min(440, canvas.width - 32);
        const height = Math.min(canvas.height - 32, 98 + this.destinations.length * 48);
        return { x: (canvas.width - width) / 2, y: (canvas.height - height) / 2, width, height };
    };

    private drawGlobeMenu(ctx: CanvasRenderingContext2D) {
        const panel = this.getMenuPanel();
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#18211f";
        ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
        ctx.strokeStyle = "#ffbd75";
        ctx.lineWidth = 2;
        ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff4df";
        ctx.font = "bold 24px Arial";
        ctx.fillText("Choose a destination", canvas.width / 2, panel.y + 34);
        this.destinations.forEach((destination, index) => {
            const rowY = panel.y + 74 + index * 48;
            ctx.fillStyle = index === this.selectedDestination ? "#6b4930" : "#293431";
            ctx.fillRect(panel.x + 24, rowY, panel.width - 48, 40);
            ctx.fillStyle = "#fff4df";
            ctx.font = "18px Arial";
            ctx.fillText(destination.label, canvas.width / 2, rowY + 20);
        });
        ctx.fillStyle = "#d8d1c4";
        ctx.font = "13px Arial";
        ctx.fillText(
            this.isTouchDevice
                ? "Tap a destination to travel · Esc to close"
                : "W / S or ↑ / ↓ to choose · Enter to travel · Esc to close",
            canvas.width / 2,
            panel.y + panel.height - 18
        );
        ctx.restore();
    }

    private drawInteractionTooltip(ctx: CanvasRenderingContext2D, text: string) {
        ctx.save();
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const paddingX = 12;
        const width = ctx.measureText(text).width + paddingX * 2;
        const height = 30;
        const centerX = canvas.width / 2 + 24;
        const x = Math.max(8, Math.min(canvas.width - width - 8, centerX - width / 2));
        const y = Math.max(8, canvas.height / 2 - 14 - height);
        ctx.fillStyle = "rgba(0, 0, 0, 0.78)";
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 8);
        ctx.fill();
        ctx.strokeStyle = "#ffbd75";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "#fff4df";
        ctx.fillText(text, x + width / 2, y + height / 2);
        ctx.restore();
    }

    private drawInfoText = (ctx: CanvasRenderingContext2D, text: string) => {
        const padding = 20;
        const boxWidth = Math.min(canvas.width - 32, 640);
        const lineHeight = 28;
        ctx.save();
        ctx.font = "20px Arial";
        const words = text.split(/\s+/);
        const lines: string[] = [];
        let line = "";
        words.forEach((word) => {
            const candidate = line ? `${line} ${word}` : word;
            if (line && ctx.measureText(candidate).width > boxWidth - padding * 2) {
                lines.push(line);
                line = word;
            } else {
                line = candidate;
            }
        });
        if (line) lines.push(line);

        const boxHeight = lines.length * lineHeight + padding * 2;
        const x = (canvas.width - boxWidth) / 2;
        const y = canvas.height - boxHeight - 32;
        ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
        ctx.fillRect(x, y, boxWidth, boxHeight);
        ctx.strokeStyle = "#ffbd75";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, boxWidth, boxHeight);
        ctx.fillStyle = "#fff4df";
        lines.forEach((textLine, index) => {
            ctx.fillText(textLine, x + padding, y + padding + (index + 1) * lineHeight - 5);
        });
        ctx.restore();
    }
}

export {
    InteractionHandler
}
