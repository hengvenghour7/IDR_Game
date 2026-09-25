import { World } from "./world";
import { Character, Player } from "./character";
import { checkRectangleCollision } from "./helpers";
import { Rectangle, Vector2 } from "./utilities";
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
    tick = (ctx: CanvasRenderingContext2D, worldPos: Vector2) => {
        // console.log(" fds", this.world.viewPoints);
        this.world.viewPoints.forEach((p) => {
            // console.log(" uuiiiinterat");
            
            const pRect: Rectangle = {
                x:p.x * 2 + worldPos.x, 
                y: p.y * 2 + worldPos.y, 
                width: p.width, 
                height: p.height
            };
            // ctx.fillRect(pRect.x, pRect.y, 32, 32);
            // ctx.fillRect(this.character.getCollisionBox().x, this.character.getCollisionBox().y, 32, 32);
            if (checkRectangleCollision(pRect, this.character.getCollisionBox())) {
                if (!this.isViewAvailable) {
                    this.isViewAvailable = true;
                }
                if (inputKeys.has("i") && this.isViewOpen == false) {
                    this.isViewOpen = true;
                    const imgSrc = p.properties.find((item) => item.name === "imgSrc")?.value;
                    if (typeof imgSrc === "string") {
                        this.viewImage.src = imgSrc;
                    }
                }
            }
            if (this.isViewAvailable) {
                ctx.fillStyle = "white";
                ctx.font = "20px Arial";
                ctx.fillText("press I to open view", 10, 50);
                ctx.fillStyle = "black";
            }
            this.isViewAvailable = false;
        })
        if (this.isViewOpen) {
            ctx.drawImage(this.viewImage, 0, 0, canvas.width, canvas.height);

        }
        if (inputKeys.has("iu") && this.isViewOpen == true) {
            console.log("view close");
            this.isViewOpen = false;
        }
    }
}

export {
    InteractionHandler
}