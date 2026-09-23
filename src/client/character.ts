import { inputKeys, Rectangle } from "./utilities";
import { checkIsCollisionTile } from "./helpers";

class Character {
    characterImage: HTMLImageElement;
    x: number;
    y: number;
    currentFrame: number;
    updateAnimationTime: number;

    constructor(textureSrc: string) {
        this.characterImage = new Image();
        this.characterImage.src = textureSrc
        this.x = 0;
        this.y = 0;
        this.currentFrame = 0;
        this.updateAnimationTime = 0;
    }
    tick = (deltaTime: number, worldCollisionData: Array<Array<number>>) => {
        if (inputKeys.has("d")) {
            const collisionBox: Rectangle = {x: this.x+1, y:this.y, width: 32, height:32};
            if (checkIsCollisionTile(worldCollisionData, collisionBox)) return;
            this.x++;
        }
        if (inputKeys.has("a")) {
            this.x--;
        }
        if (inputKeys.has("s")) {
            this.y++;
        }
        if (inputKeys.has("w")) {
            this.y--;
        }
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