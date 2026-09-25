import { Layer, Vector2, ViewPointType } from "./utilities";
import { arrayToArray2D, getElementFromJsonByNameField, readJsonFile } from "./helpers";

class World {
    worldTexture: HTMLImageElement;
    collisionData: Array<Array<number>> = [];
    width: number;
    height: number;
    viewPoints: ViewPointType[];

    constructor(imgSrc: string, )
    {
        this.worldTexture = new Image();
        this.worldTexture.src = imgSrc;
        this.loadMapData();
        this.width = 100;
        this.height = 80;
        this.viewPoints = [];
    }
    loadMapData = async () => {
        const j = await readJsonFile("/map_properties/world.tmj");
        const data = getElementFromJsonByNameField(j, "collision");
        const viewPointsData = getElementFromJsonByNameField(j, "view_point");
        this.viewPoints = viewPointsData["objects"]
        console.log(this.viewPoints);
           
        this.collisionData = arrayToArray2D(data["data"], this.width);
    }
    draw = (ctx: CanvasRenderingContext2D, worldPos: Vector2) => {
        ctx.drawImage(this.worldTexture, worldPos.x, worldPos.y, 1600 * 2, 1280 * 2)
        // this.collisionData.forEach((d, j) => {
        //     d.forEach((item, i) => {
        //         if (item !== 0) {
        //             ctx.fillRect(i * 32, j * 32, 32, 32);
        //         }
        //     })
        // })
    }
}

export {
    World
}