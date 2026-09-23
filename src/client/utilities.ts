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

export {
    inputKeys,
    Vector2,
    Rectangle,
    Layer
}