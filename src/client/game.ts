import { Character } from "./character"
import { inputKeys } from "./utilities";

const apple = 10;
let x:number = 20;
let previousTime = 0;
let deltaTime = 0;

const player: Character = new Character("/images/character.png");
const canvas = document.getElementById("game_canvas") as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = 800;
const ctx = canvas.getContext("2d");
window.addEventListener("keypress", (e) => {
    if (e.key == "d") {
        inputKeys.add("d")
    }
})
window.addEventListener("keyup", (e) => {
    if (e.key == "d") {
        inputKeys.delete("d");
    }
})

const animate = (currentTime: number = 0) => {
    deltaTime = (currentTime - previousTime) / 1000;
    previousTime = currentTime;
    // console.log(deltaTime);
    if (inputKeys.has("d")) {
        x++;
    }
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.fillRect(x, 100, 20, 20);
    player.draw(ctx as CanvasRenderingContext2D, deltaTime);
    requestAnimationFrame(animate);
}
export {
    apple,
    animate
}