import { World } from "./world";
import { Character, Player } from "./character";
import { checkRectangleCollision } from "./helpers";
import { Rectangle, Vector2 } from "./utilities";
import { inputKeys } from "./utilities";

class InteractionHandler {
    world: World;
    character: Player;
    isViewOpen: boolean;
    isViewAvailable: boolean;

    constructor (world: World, character: Player) {
        this.world = world;
        this.character = character;
        this.isViewOpen = false;
        this.isViewAvailable = false;
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
                    console.log("ii detect");
                }
            }
            if (inputKeys.has("iu") && this.isViewOpen == true) {
                console.log("view close");
                this.isViewOpen = false;
            }
            if (this.isViewAvailable) {
                ctx.fillStyle = "white";
                ctx.font = "20px Arial";
                ctx.fillText("press I to open view", 10, 50);
                ctx.fillStyle = "black";
            }
            this.isViewAvailable = false;
        })
        // if (this.isViewOpen && inputKeys.has("i")) {
        //     this.isViewOpen = false;
        // }
    }
}

export {
    InteractionHandler
}