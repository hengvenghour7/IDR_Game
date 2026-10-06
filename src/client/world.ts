import { AnimatedSpriteType, Layer, MapSwitcherType, Vector2, ViewPointType } from "./utilities";
import { arrayToArray2D, getElementFromJsonByNameField, readJsonFile } from "./helpers";
import { assetUrl, GLOBAL_SCALE } from "./globalVar";

class World {
    worldTexture: HTMLImageElement;
    collisionData: Array<Array<number>> = [];
    width: number;
    height: number;
    viewPoints: ViewPointType[];
    mapSwitchers: MapSwitcherType[] = [];
    animatedSprites: Array<{ object: AnimatedSpriteType; image: HTMLImageElement }> = [];
    private animationTime = 0;
    private mapDataPromise: Promise<void>;
    frontTexture: HTMLImageElement;

    constructor(imgSrc: string, frontImageSrc: string = "", mapDataSrc = assetUrl("map_properties/world.tmj"))
    {
        this.worldTexture = new Image();
        this.worldTexture.src = imgSrc;
        this.frontTexture = new Image();
        this.frontTexture.src = frontImageSrc;
        this.width = 100;
        this.height = 80;
        this.viewPoints = [];
        this.mapDataPromise = this.loadMapData(mapDataSrc);
    }
    loadMapData = async (mapDataSrc = assetUrl("map_properties/world.tmj")) => {
        const j = await readJsonFile(mapDataSrc);
        const data = getElementFromJsonByNameField(j, "collision");
        const viewPointsData = getElementFromJsonByNameField(j, "view_point");
        const mapSwitchersData = getElementFromJsonByNameField(j, "map_switcher");
        const animatedSpritesData = j.layers.find((layer: Layer) =>
            layer.name === "animated_sprite" || layer.name === "animate_sprite"
        );
        if (!data || !Array.isArray(data.data) || typeof data.width !== "number") {
            throw new Error(`Map ${mapDataSrc} has no valid collision layer data`);
        }
        this.width = data.width;
        this.height = data.height;
        this.viewPoints = viewPointsData?.objects ?? [];
        this.mapSwitchers = mapSwitchersData?.objects ?? [];
        this.animatedSprites = (animatedSpritesData?.objects ?? []).map((object: AnimatedSpriteType) => {
            const image = new Image();
            const imgSrc = object.properties?.find((property) => property.name === "imgSrc")?.value;
            if (typeof imgSrc === "string") image.src = assetUrl(imgSrc);
            return { object, image };
        });
        this.collisionData = arrayToArray2D(data.data, this.width);
    }
    prepare = () => this.mapDataPromise;
    draw = (ctx: CanvasRenderingContext2D, worldPos: Vector2) => {
        ctx.drawImage(this.worldTexture, worldPos.x * GLOBAL_SCALE, worldPos.y * GLOBAL_SCALE, 1600 * 2 * GLOBAL_SCALE, 1280 * 2 * GLOBAL_SCALE)
        // this.collisionData.forEach((d, j) => {
        //     d.forEach((item, i) => {
        //         if (item !== 0) {
        //             ctx.fillRect(i * 32, j * 32, 32, 32);
        //         }
        //     })
        // })
    }
    drawFront = (ctx: CanvasRenderingContext2D, worldPos: Vector2) => {
        if (!this.frontTexture.src || !this.frontTexture.complete || this.frontTexture.naturalWidth === 0) {
            return;
        }
        ctx.drawImage(this.frontTexture, worldPos.x * GLOBAL_SCALE, worldPos.y * GLOBAL_SCALE, 1600 * 2 * GLOBAL_SCALE, 1280 * 2 * GLOBAL_SCALE)
        // this.collisionData.forEach((d, j) => {
        //     d.forEach((item, i) => {
        //         if (item !== 0) {
        //             ctx.fillRect(i * 32, j * 32, 32, 32);
        //         }
        //     })
        // })
    }
    drawAnimatedSprites = (ctx: CanvasRenderingContext2D, worldPos: Vector2, deltaTime: number) => {
        this.animationTime += Math.max(0, deltaTime);
        this.animatedSprites.forEach(({ object, image }) => {
            if (!object.visible || !image.complete || image.naturalWidth === 0) return;

            const property = (name: string) => object.properties?.find((item) => item.name === name)?.value;
            const totalWidth = Number(property("total_width")) || image.naturalWidth;
            const totalHeight = Number(property("total_height")) || image.naturalHeight;
            const startFrame = Math.max(0, Math.floor(Number(property("startFrame")) || 0));
            const endFrame = Math.floor(Number(property("endFrame")));
            const lastFrame = Number.isFinite(endFrame) && endFrame >= startFrame ? endFrame : startFrame;
            const frameCount = lastFrame;
            const frameWidth = totalWidth / lastFrame;
            const frame = startFrame + Math.floor(this.animationTime * 8) % frameCount;
            const sourceX = frame * frameWidth;
            const sourceHeight = Math.min(totalHeight, image.naturalHeight);

            ctx.drawImage(
                image,
                sourceX, 0, frameWidth, sourceHeight,
                (object.x * 2 + worldPos.x) * GLOBAL_SCALE,
                (object.y * 2 + worldPos.y) * GLOBAL_SCALE,
                object.width * 2 * GLOBAL_SCALE,
                object.height * 2 * GLOBAL_SCALE
            );
        });
    }
}

export {
    World
}
