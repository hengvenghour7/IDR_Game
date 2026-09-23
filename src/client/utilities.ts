let inputKeys = new Set<string>();
interface Vector2 {
    x: number;
    y: number;
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
    Layer
}