import { Layer } from "./utilities";

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
    arrayToArray2D,
    readJsonFile,
    getElementFromJsonByNameField
}