import { Layer } from "./utilities";

class World {
    worldTexture: HTMLImageElement;
    collisionData: string[] = [];
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
        const data = await fetch("/map_properties/world.tmj");
        data.json().then(
            (data) => {
                console.log(data);
                return data["layers"].find(
                    (layer: Layer) => layer.name == "collision"
                )
            }
        ).then(
            (res) => {
                console.log(res.data);
                console.log("new array ", this.arrayToArray2D(res.data));
                
            }
        )
    }
    draw = (ctx: CanvasRenderingContext2D) => {
        ctx.drawImage(this.worldTexture, 0, 0, 1600 * 2, 1280 * 2)
    }
    arrayToArray2D = (arrayData: number[]) => {
        const array2D: Array<Array<number>> = [];
        let index: number = 0;
        for (let j: number = 0; j < arrayData.length ; j+=this.width) {
            const chunk: number[] = []
            for (let i = 0; i < this.width; i ++) {
                chunk.push(arrayData[index])
                index ++;
            }
            array2D.push(chunk);
        }
        return array2D;
    }
}

export {
    World
}