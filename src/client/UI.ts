import { canvas } from "./globalVar";
import { inputKeys } from "./utilities";

class MobileUI {
    private readonly centerX = 88;
    private readonly radius = 54;
    private readonly deadZone = 0.28;
    private readonly viewButtonRadius = 34;
    private centerY: number;
    private knobX: number;
    private knobY: number;
    private activePointerId: number | null = null;
    private viewButtonPointerId: number | null = null;
    private activeKeys: string[] = [];
    private isViewButtonPressed = false;

    constructor() {
        this.centerY = canvas.height - 88;
        this.knobX = this.centerX;
        this.knobY = this.centerY;
        canvas.style.touchAction = "none";
        canvas.addEventListener("pointerdown", this.handlePointerDown);
        canvas.addEventListener("pointermove", this.handlePointerMove);
        canvas.addEventListener("pointerup", this.handlePointerEnd);
        canvas.addEventListener("pointercancel", this.handlePointerEnd);
        canvas.addEventListener("lostpointercapture", this.handlePointerEnd);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.knobX, this.knobY, 23, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fill();

        const buttonX = canvas.width - 72;
        const buttonY = canvas.height - 72;
        ctx.beginPath();
        ctx.arc(buttonX, buttonY, this.viewButtonRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.isViewButtonPressed
            ? "rgba(80, 190, 255, 0.9)"
            : "rgba(255, 255, 255, 0.45)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = "#222";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("I", buttonX, buttonY);
        ctx.restore();
    }

    resize() {
        this.centerY = canvas.height - 88;
        this.knobX = this.centerX;
        this.knobY = this.centerY;
        if (this.activePointerId !== null) {
            const pointerId = this.activePointerId;
            this.activePointerId = null;
            if (canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
            this.setActiveKeys([]);
        }
        if (this.viewButtonPointerId !== null) {
            const pointerId = this.viewButtonPointerId;
            this.viewButtonPointerId = null;
            if (canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
            this.setViewButtonPressed(false);
        }
    }

    private getCanvasPoint = (event: PointerEvent) => {
        const bounds = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - bounds.left) * canvas.width / bounds.width,
            y: (event.clientY - bounds.top) * canvas.height / bounds.height
        };
    };

    private handlePointerDown = (event: PointerEvent) => {
        const point = this.getCanvasPoint(event);
        const buttonX = canvas.width - 72;
        const buttonY = canvas.height - 72;
        const buttonDistance = Math.hypot(point.x - buttonX, point.y - buttonY);
        if (buttonDistance <= this.viewButtonRadius && this.viewButtonPointerId === null) {
            event.preventDefault();
            this.viewButtonPointerId = event.pointerId;
            canvas.setPointerCapture(event.pointerId);
            this.setViewButtonPressed(true);
            return;
        }

        if (this.activePointerId !== null) return;
        const distance = Math.hypot(point.x - this.centerX, point.y - this.centerY);
        if (distance > this.radius) return;

        event.preventDefault();
        this.activePointerId = event.pointerId;
        canvas.setPointerCapture(event.pointerId);
        this.updateStick(point.x, point.y);
    };

    private handlePointerMove = (event: PointerEvent) => {
        event.preventDefault();
        if (event.pointerId === this.viewButtonPointerId) {
            const point = this.getCanvasPoint(event);
            const buttonX = canvas.width - 72;
            const buttonY = canvas.height - 72;
            this.setViewButtonPressed(
                Math.hypot(point.x - buttonX, point.y - buttonY) <= this.viewButtonRadius
            );
            return;
        }
        if (event.pointerId !== this.activePointerId) return;
        const point = this.getCanvasPoint(event);
        this.updateStick(point.x, point.y);
    };

    private handlePointerEnd = (event: PointerEvent) => {
        if (event.pointerId === this.viewButtonPointerId) {
            this.viewButtonPointerId = null;
            this.setViewButtonPressed(false);
        }
        if (event.pointerId !== this.activePointerId) return;
        this.activePointerId = null;
        this.knobX = this.centerX;
        this.knobY = this.centerY;
        this.setActiveKeys([]);
    };

    private updateStick(x: number, y: number) {
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const distance = Math.hypot(dx, dy);
        const knobDistance = Math.min(distance, this.radius * 0.55);
        const scale = distance === 0 ? 0 : knobDistance / distance;
        this.knobX = this.centerX + dx * scale;
        this.knobY = this.centerY + dy * scale;

        const normalizedX = dx / this.radius;
        const normalizedY = dy / this.radius;
        const keys: string[] = [];
        if (normalizedX <= -this.deadZone) keys.push("a");
        if (normalizedX >= this.deadZone) keys.push("d");
        if (normalizedY <= -this.deadZone) keys.push("w");
        if (normalizedY >= this.deadZone) keys.push("s");
        this.setActiveKeys(keys);
    }

    private setActiveKeys(keys: string[]) {
        this.activeKeys.forEach((key) => inputKeys.delete(key));
        this.activeKeys = keys;
        this.activeKeys.forEach((key) => inputKeys.add(key));
    }

    private setViewButtonPressed(isPressed: boolean) {
        if (this.isViewButtonPressed === isPressed) return;
        this.isViewButtonPressed = isPressed;
        if (isPressed) {
            inputKeys.delete("iu");
            inputKeys.add("i");
        } else {
            inputKeys.delete("i");
            inputKeys.add("iu");
        }
    }
}

export { MobileUI };
