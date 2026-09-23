import { Layer } from "./utilities";
import { arrayToArray2D, getElementFromJsonByNameField, readJsonFile } from "./helpers";

class World {
    worldTexture: HTMLImageElement;
    collisionData: Array<Array<number>> = [];
    width: number;
    height: number;

    constructor(imgSrc: string, )
    {
        this.worldTexture = new Image();
        this.worldTexture.src = imgSrc;
        this.loadMapData();
        this.width = 100;
        this.height = 80;
    }
    loadMapData = async () => {
        const j = await readJsonFile("/map_properties/world.tmj");
        const data = getElementFromJsonByNameField(j, "collision");    
        this.collisionData = arrayToArray2D(data["data"], this.width);
    }
    draw = (ctx: CanvasRenderingContext2D) => {
        ctx.drawImage(this.worldTexture, 0, 0, 1600 * 2, 1280 * 2)
    }
    
}

export {
    World
}