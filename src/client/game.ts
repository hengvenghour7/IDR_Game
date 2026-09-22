const apple = 10;
let x = 20;

const canvas = document.getElementById("game_canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
window.addEventListener("keydown", (e) => {
    if (e.key == "d") {
        x++;
    };
})
const animate = () => {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.fillRect(x, 100, 20, 20);
    requestAnimationFrame(animate);
}
export {
    apple,
    animate
}