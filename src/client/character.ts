class Character {
    playerImage: HTMLImageElement;
    x: number;
    y: number;
    currentFrame: number;
    updateAnimationTime: number;

    constructor(textureSrc: string) {
        this.playerImage = new Image();
        this.playerImage.src = textureSrc
        this.x = 0;
        this.y = 0;
        this.currentFrame = 0;
        this.updateAnimationTime = 0;
    }
    draw = (ctx: CanvasRenderingContext2D, deltaTime: number) => {
        ctx.drawImage(this.playerImage, this.currentFrame * 32, 32, 32, 32 , this.x, this.y, 32, 32);
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