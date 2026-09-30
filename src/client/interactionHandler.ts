import { World } from "./world";
import { Character, Player } from "./character";
import { checkRectangleCollision } from "./helpers";
import { Rectangle } from "./utilities";
import { inputKeys } from "./utilities";
import { canvas } from "./globalVar";

class InteractionHandler {
    world: World;
    character: Player;
    isViewOpen: boolean;
    isViewAvailable: boolean;
    viewImage: HTMLImageElement;

    constructor (world: World, character: Player) {
        this.world = world;
        this.character = character;
        this.isViewOpen = false;
        this.isViewAvailable = false;
        this.viewImage = new Image();
        this.viewImage.src = "images/scenery/view_1.png"
    }
    tick = (ctx: CanvasRenderingContext2D) => {
        this.isViewAvailable = false;
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
        if (this.isViewAvailable) {
            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.fillText("press I to open view", 10, 50);
        }
        if (this.isViewOpen) {
            ctx.drawImage(this.viewImage, 0, 0, canvas.width, canvas.height);

        }
        if (inputKeys.has("iu") && this.isViewOpen) {
            this.isViewOpen = false;
        }
    }
}

export {
    InteractionHandler
}
