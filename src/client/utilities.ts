let inputKeys = new Set<string>();
interface Vector2 {
    x: number;
    y: number;
}
interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}
interface Layer {
    name: string;
    id: number;
    opacity: number;
    visible: boolean;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    data: number[];
}
interface ViewPointType {
    height: number
    id: number
    name: string
    rotation: number
    type: string
    visible: boolean
    width: number
    x: number
    y: number
}

export {
    inputKeys,
    Vector2,
    Rectangle,
    Layer,
    ViewPointType
}