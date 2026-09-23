import { inputKeys, Rectangle, Vector2 } from "./utilities";
import { checkIsCollisionTile, getFutureCollisionBox, vector2Add, vector2Normalize, vector2Scale, vector2Substract } from "./helpers";
import { TILE_SIZE, canvas } from "./globalVar";

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
class Player extends Character {
    worldPos: Vector2;

    constructor(textureSrc: string) {
        super(textureSrc);
        this.worldPos = {x:this.x, y:this.y};
    }
    override tick = (deltaTime: number, worldCollisionData: Array<Array<number>>) => {
        this.collisionBox.x = this.worldPos.x + canvas.clientWidth/2;
        this.collisionBox.y = this.worldPos.y +  canvas.clientHeight/2;
        // console.log("world pos ", this.collisionBox)
        let direction: Vector2 = {x:0, y:0};
        if (inputKeys.has("d")) {
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
            this.worldPos.x += direction.x;
            this.worldPos.y += direction.y;
        };
    };
    override draw = (ctx: CanvasRenderingContext2D, deltaTime: number) => {
        ctx.drawImage(this.characterImage, this.currentFrame * 32, 32, 32, 32 , canvas.clientWidth/2, canvas.clientHeight/2, 32, 32);
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
    };
    getWorldPos = () => {
        return vector2Scale(this.worldPos, -1);
    }
}
class Animal {
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
    draw = (ctx: CanvasRenderingContext2D, deltaTime: number) => {
        ctx.drawImage(this.characterImage, this.currentFrame * 32, 0, 32, 32 , this.x, this.y, 32, 32);
        this.updateAnimationTime += deltaTime;
        if (this.updateAnimationTime > 0.1)
        {
            this.currentFrame++;
            if (this.currentFrame > 5)
            {
                this.currentFrame = 0;
            }
            this.updateAnimationTime = 0;
        }
    }
    approachTarget = (target: Player) => {
        let targetPos = vector2Add(target.worldPos, {x:canvas.clientWidth, y: canvas.clientHeight});
        let direction = vector2Normalize(vector2Substract(targetPos, {x:this.x, y:this.y}));
        if (this.x < target.x && this.y < target.y) {
            this.y+= direction.y;
            this.x+= direction.x;
        }
    }
}

export {
    Character,
    Player,
    Animal
}