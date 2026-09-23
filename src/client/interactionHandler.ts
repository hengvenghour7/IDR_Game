import { World } from "./world";
import { Character } from "./character";
import { checkRectangleCollision } from "./helpers";

class InteractionHandler {
    world: World;
    character: Character;

    constructor (world: World, character: Character) {
        this.world = world;
        this.character = character;
    }
    tick = () => {
        this.world.viewPoints.forEach((p) => {
            
        })
    }
}