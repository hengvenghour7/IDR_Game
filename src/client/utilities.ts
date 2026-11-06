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
interface PropertyType {
    name: string;
    type: string;
    value: string | number;
}
interface AnimatedSpriteType {
    height: number;
    id: number;
    name: string;
    rotation: number;
    type: string;
    visible: boolean;
    width: number;
    x: number;
    y: number;
    properties: PropertyType[];
}
interface ViewPointType {
    height: number;
    id: number;
    name: string;
    rotation: number;
    type: string;
    visible: boolean;
    width: number;
    x: number;
    y: number;
    properties: PropertyType[]
}
interface MapSwitcherType extends ViewPointType {}
interface InfoLocationType extends ViewPointType {}
interface GlobeType extends ViewPointType {}
type MapName = "world" | "world_2" | "port_world" | "reflection_world" | "world_4" | "world_5";

export {
    inputKeys,
    Vector2,
    Rectangle,
    Layer,
    ViewPointType,
    MapSwitcherType,
    InfoLocationType,
    GlobeType,
    MapName,
    AnimatedSpriteType
}
