import { Layer, MapSwitcherType, Vector2, ViewPointType } from "./utilities";
import { arrayToArray2D, getElementFromJsonByNameField, readJsonFile } from "./helpers";

class World {
    worldTexture: HTMLImageElement;
    collisionData: Array<Array<number>> = [];
    width: number;
    height: number;
    viewPoints: ViewPointType[];
    mapSwitchers: MapSwitcherType[] = [];

    private mapDataPromise: Promise<void>;

    constructor(imgSrc: string, mapDataSrc = "/map_properties/world.tmj")
    {
        this.worldTexture = new Image();
        this.worldTexture.src = imgSrc;
        this.width = 100;
        this.height = 80;
        this.viewPoints = [];
        this.mapDataPromise = this.loadMapData(mapDataSrc);
    }
    loadMapData = async (mapDataSrc = "/map_properties/world.tmj") => {
        const j = await readJsonFile(mapDataSrc);
        const data = getElementFromJsonByNameField(j, "collision");
        const viewPointsData = getElementFromJsonByNameField(j, "view_point");
        const mapSwitchersData = getElementFromJsonByNameField(j, "map_switcher");
        if (!data || !Array.isArray(data.data)) {
            throw new Error(`Map ${mapDataSrc} has no collision layer data`);
        }
        this.width = data.width;
        this.height = data.height;
        this.viewPoints = viewPointsData?.objects ?? [];
        this.mapSwitchers = mapSwitchersData?.objects ?? [];
        this.collisionData = arrayToArray2D(data.data, this.width);
    }
    prepare = () => this.mapDataPromise;
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
