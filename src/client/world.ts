
class World {
    worldTexture: HTMLImageElement;

    constructor(imgSrc: string)
    {
        this.worldTexture = new Image();
        this.worldTexture.src = imgSrc;
    }
    draw = (ctx: CanvasRenderingContext2D) => {
        ctx.drawImage(this.worldTexture, 0, 0, 480 * 2, 320 * 2)
    }
}

export {
    World
}