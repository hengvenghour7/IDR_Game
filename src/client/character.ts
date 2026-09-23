import { inputKeys, Rectangle, Vector2 } from "./utilities";
import { checkIsCollisionTile, getFutureCollisionBox } from "./helpers";
import { TILE_SIZE } from "./globalVar";

class Character {
    characterImage: HTMLImageElement;
    x: number;
    y: number;
    currentFrame: number;
    updateAnimationTime: number;
    collisionBox: Rectangle;

    constructor(textureSrc: string) {
        this.characterImage = new Image();
        this.characterImage.src = textureSrc
        this.x = 0;
        this.y = 0;
        this.currentFrame = 0;
        this.updateAnimationTime = 0;
        this.collisionBox = {x: this.x, y: this.y, width: TILE_SIZE, height: TILE_SIZE};
    }
    tick = (deltaTime: number, worldCollisionData: Array<Array<number>>) => {
        this.collisionBox.x = this.x;
        this.collisionBox.y = this.y;
        let direction: Vector2 = {x:0, y:0};
        if (inputKeys.has("d")) {
            const collisionBox: Rectangle = {x: this.x+1, y:this.y, width: 32, height:32};
            direction.x = 1;
        }
        if (inputKeys.has("a")) {
            direction.x = -1;
        }
        if (inputKeys.has("s")) {
            direction.y = 1;
        }
        if (inputKeys.has("w")) {
            direction.y = -1;
        }
        if (!checkIsCollisionTile(
                worldCollisionData, 
                getFutureCollisionBox(this.collisionBox, direction)
                )
            )
            {
                this.x += direction.x;
                this.y += direction.y;
            };
    }
    draw = (ctx: CanvasRenderingContext2D, deltaTime: number) => {
        ctx.drawImage(this.characterImage, this.currentFrame * 32, 32, 32, 32 , this.x, this.y, 32, 32);
        this.updateAnimationTime += deltaTime;
        if (this.updateAnimationTime > 0.1)
        {
            this.currentFrame++;
            if (this.currentFrame > 7)
            {
                this.currentFrame = 0;
            }
            this.updateAnimationTime = 0;
        }
    }
}
class Animal {
    constructor() {

    }
}

export {
    Character
}