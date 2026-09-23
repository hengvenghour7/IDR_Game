import { Layer, Vector2 } from "./utilities";

const vector2Length = (v: Vector2) => {
    return Math.sqrt(v.x ** 2 + v.y ** 2);
}
const vector2Add = (v1: Vector2, v2: Vector2): Vector2 => {
    return {
        x:v1.x + v2.x,
        y:v1.y + v2.y
    }
}
const vector2Substract = (v1: Vector2, v2: Vector2): Vector2 => {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    }
}
const vector2Scale = (v: Vector2, scaleFactor: number): Vector2 => {
    return {
        x: v.x * scaleFactor,
        y: v.y * scaleFactor
    }
}
const vector2Normalize = (v: Vector2): Vector2 => {
    const len = vector2Length(v);
    if (len === 0) return {x:0, y:0};
    return {
        x: v.x / len, 
        y: v.y / len
    };
}
const arrayToArray2D = (arrayData: number[], width: number) => {
        const array2D: Array<Array<number>> = [];
        let index: number = 0;
        for (let j: number = 0; j < arrayData.length ; j+=width) {
            const chunk: number[] = []
            for (let i = 0; i < width; i ++) {
                chunk.push(arrayData[index])
                index ++;
            }
            array2D.push(chunk);
        }
        return array2D;
    }
const readJsonFile = async (filePath: string) => {
    const data = await fetch(filePath);
    return data.json();
}
const getElementFromJsonByNameField = (j: any, name: string) => {
    return j["layers"].find((layer: Layer) => layer.name == name)
}

export {
    vector2Length,
    vector2Add,
    vector2Substract,
    vector2Normalize,
    vector2Scale,
    arrayToArray2D,
    readJsonFile,
    getElementFromJsonByNameField
}