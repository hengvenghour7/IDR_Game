import { inputKeys, Rectangle, Vector2 } from "./utilities";
import { checkIsCollisionTile, getFutureCollisionBox, vector2Add, vector2Normalize, vector2Scale, vector2Substract, vector2Length } from "./helpers";
import { TILE_SIZE, canvas, GLOBAL_SCALE } from "./globalVar";
import { Direction, PlayerState } from "./characterEnums";

class BaseCharacter {
    directionState: Direction;
    playerState: PlayerState;

    constructor() {
        this.directionState = Direction.Right;
        this.playerState = PlayerState.Walking;
    }
    updateCharacterState (direction: Vector2, state: PlayerState) {
        if (direction.x > 0) {
            this.directionState = Direction.Right;
        }
        if (direction.x <= 0) {
            this.directionState = Direction.Left;
        }
        if (direction.y >= 0 && direction.x === 0) {
            this.directionState = Direction.Down;
        }
        if (direction.y < 0 && direction.x === 0) {
            this.directionState = Direction.Up;
        }
        if (direction.x === 0 && direction.y === 0) {
            this.playerState = PlayerState.Idle;
            return;
        }
        if (this.playerState !== state) {
            this.playerState = state;
        }
    }
}
class Character extends BaseCharacter {
    characterImage: HTMLImageElement;
    x: number;
    y: number;
    currentFrame: number;
    updateAnimationTime: number;
    collisionBox: Rectangle;
    speed: number;
    row: number;
    maxCol: number;

    constructor(textureSrc: string) {
        super();
        this.characterImage = new Image();
        this.characterImage.src = textureSrc
        this.x = 0;
        this.y = 0;
        this.currentFrame = 0;
        this.updateAnimationTime = 0;
        this.speed = 70;
        this.collisionBox = {x: this.x, y: this.y, width: TILE_SIZE, height: TILE_SIZE};
        this.row = 2;
        this.maxCol = 7;
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
            this.updateCharacterState(direction, PlayerState.Walking);
            this.updateAnimation();
            this.x += direction.x;
            this.y += direction.y;
        };
    }
    updateAnimation () {
        if (this.playerState === PlayerState.Walking && this.directionState === Direction.Right) {
            this.row = 1;
            this.maxCol = 7;
            return;
        }
        if (this.playerState === PlayerState.Walking && this.directionState === Direction.Left) {
            this.row = 2;
            this.maxCol = 7;
            return;
        }
        if (this.playerState === PlayerState.Walking && this.directionState === Direction.Up) {
            this.row = 3;
            this.maxCol = 3;
            return;
        }
        if (this.playerState === PlayerState.Walking && this.directionState === Direction.Down) {
            this.row = 3;
            this.maxCol = 3;
            return;
        }
        if (this.playerState === PlayerState.Idle) {
            this.row = 0;
            this.maxCol = 4;
        }
    }
    draw = (ctx: CanvasRenderingContext2D, deltaTime: number) => {
        if (this.directionState === Direction.Right) {
            this.row = 1
        }
        if (this.directionState === Direction.Left) {
            this.row = 2
        }
        ctx.drawImage(this.characterImage, this.currentFrame * 64, this.row * 32, 32, 32 , this.x * GLOBAL_SCALE, this.y * GLOBAL_SCALE, 32 * GLOBAL_SCALE, 32 * GLOBAL_SCALE);
        this.updateAnimationTime += deltaTime;
        if (this.updateAnimationTime > 0.1)
        {
            this.currentFrame++;
            if (this.currentFrame > this.maxCol)
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
        this.worldPos = {x:200, y:600};
    }
    override tick = (deltaTime: number, worldCollisionData: Array<Array<number>>) => {
        this.collisionBox.x = this.worldPos.x + canvas.width / (2 * GLOBAL_SCALE);
        this.collisionBox.y = this.worldPos.y + canvas.height / (2 * GLOBAL_SCALE);
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
            this.updateCharacterState(direction, PlayerState.Walking);
            this.updateAnimation();
            direction = vector2Scale(vector2Normalize(direction), deltaTime * this.speed) 
            this.worldPos.x += direction.x;
            this.worldPos.y += direction.y;
            this.collisionBox.x = this.worldPos.x + canvas.width / (2 * GLOBAL_SCALE);
            this.collisionBox.y = this.worldPos.y + canvas.height / (2 * GLOBAL_SCALE);
        };
    };
    override draw = (ctx: CanvasRenderingContext2D, deltaTime: number) => {
        console.log(this.row);
        
        ctx.drawImage(this.characterImage, this.currentFrame * 32, this.row * 32, 32, 32 , canvas.width / 2, canvas.height / 2, 32 * GLOBAL_SCALE, 32 * GLOBAL_SCALE);
        this.updateAnimationTime += deltaTime;
        if (this.updateAnimationTime > 0.1)
        {
            this.currentFrame++;
            if (this.currentFrame > this.maxCol)
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
            x: this.collisionBox.x,
            y: this.collisionBox.y,
            width: this.collisionBox.width,
            height: this.collisionBox.height
        }
    }
}
class Animal extends BaseCharacter {
    characterImage: HTMLImageElement;
    x: number;
    y: number;
    currentFrame: number;
    updateAnimationTime: number;
    collisionBox: Rectangle;
    worldPos: Vector2;
    speed: number;
    row: number;
    maxCol: number;

    constructor(textureSrc: string) {
        super();
        this.characterImage = new Image();
        this.characterImage.src = textureSrc
        this.x = 0;
        this.y = 0;
        this.worldPos = {x:0, y:0};
        this.currentFrame = 0;
        this.updateAnimationTime = 0;
        this.speed = 60;
        this.collisionBox = {x: this.x, y: this.y, width: TILE_SIZE, height: TILE_SIZE};
        this.row = 1;
        this.maxCol = 5;
    }
    updateAnimation () {
        if (this.playerState === PlayerState.Walking && this.directionState === Direction.Right) {
            this.row = 1;
            this.maxCol = 5;
            return;
        }
        if (this.playerState === PlayerState.Walking && this.directionState === Direction.Left) {
            this.row = 2;
            this.maxCol = 5;
            return;
        }
        if (this.playerState === PlayerState.Idle) {
            this.row = 0;
            this.maxCol = 4;
        }
    }
    draw = (ctx: CanvasRenderingContext2D, deltaTime: number, worldPos: Vector2, playerWorldPos: Vector2) => {
        let screenPos: Vector2 = vector2Add(this.worldPos, worldPos);
        ctx.drawImage(this.characterImage, this.currentFrame * 32, this.row * 32, 32, 32 , screenPos.x * GLOBAL_SCALE, screenPos.y * GLOBAL_SCALE, 32 * GLOBAL_SCALE, 32 * GLOBAL_SCALE);
        this.updateAnimationTime += deltaTime;
        if (this.updateAnimationTime > 0.1)
        {
            this.currentFrame++;
            if (this.currentFrame > this.maxCol)
            {
                this.currentFrame = 0;
            }
            this.updateAnimationTime = 0;
        }
    }
    approachTarget = (target: Player, deltaTime: number) => {
        let targetPos = vector2Add(target.worldPos, {x:canvas.width / (2 * GLOBAL_SCALE), y: canvas.height / (2 * GLOBAL_SCALE)});
        let betweenDistance: Vector2 = vector2Substract(targetPos, this.worldPos)
        let directionNormalize = vector2Normalize(betweenDistance);

        if (vector2Length(betweenDistance) < 30) {
            this.updateCharacterState(directionNormalize, PlayerState.Idle);
            this.updateAnimation()
            return;
        };

        this.updateCharacterState(directionNormalize, PlayerState.Walking);
        this.updateAnimation();
        console.log(this.directionState);
        
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
