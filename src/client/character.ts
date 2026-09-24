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
    speed: number;

    constructor(textureSrc: string) {
        this.characterImage = new Image();
        this.characterImage.src = textureSrc
        this.x = 0;
        this.y = 0;
        this.currentFrame = 0;
        this.updateAnimationTime = 0;
        this.speed = 70;
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
            direction = vector2Scale(vector2Normalize(direction), deltaTime * this.speed) 
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
    getCollisionBox = (): Rectangle => {
        return {
            x: canvas.width/2,
            y: canvas.height/2 - 42,
            width: this.collisionBox.width,
            height: this.collisionBox.height
        }
    }
}
class Animal {
    characterImage: HTMLImageElement;
    x: number;
    y: number;
    currentFrame: number;
    updateAnimationTime: number;
    collisionBox: Rectangle;
    worldPos: Vector2;
    speed: number;

    constructor(textureSrc: string) {
        this.characterImage = new Image();
        this.characterImage.src = textureSrc
        this.x = 0;
        this.y = 0;
        this.worldPos = {x:0, y:0};
        this.currentFrame = 0;
        this.updateAnimationTime = 0;
        this.speed = 60;
        this.collisionBox = {x: this.x, y: this.y, width: TILE_SIZE, height: TILE_SIZE};
    }
    draw = (ctx: CanvasRenderingContext2D, deltaTime: number, worldPos: Vector2, playerWorldPos: Vector2) => {
        let screenPos: Vector2 = vector2Add(this.worldPos, worldPos);
        ctx.drawImage(this.characterImage, this.currentFrame * 32, 0, 32, 32 , screenPos.x, screenPos.y, 32, 32);
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
    approachTarget = (target: Player, deltaTime: number) => {
        let targetPos = vector2Add(target.worldPos, {x:canvas.clientWidth/2, y: canvas.clientHeight/2});
        let directionNormalize = vector2Normalize(vector2Substract(targetPos, this.worldPos));
        
        let direction = vector2Scale(directionNormalize, this.speed * deltaTime)
        // if (this.worldPos.x < targetPos.x - 32 && this.worldPos.y < targetPos.y - 32) {
        // }
        this.worldPos.x+= direction.x;
        this.worldPos.y+= direction.y;
    }
}

export {
    Character,
    Player,
    Animal
}