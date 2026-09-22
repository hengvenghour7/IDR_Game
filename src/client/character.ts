import { inputKeys } from "./utilities";

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
    tick = () => {
        if (inputKeys.has("d")) {
            this.x++;
        }
        if (inputKeys.has("a")) {
            this.x--;
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