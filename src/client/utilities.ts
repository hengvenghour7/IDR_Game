let inputKeys = new Set<string>();
class Vector2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    add(v: Vector2) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }
    substract(v: Vector2) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }
    mutliply(scale: number) {
        return new Vector2(this.x * scale, this.y * scale);
    }
    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    normalize() {
        const len = this.length();
        if (len === 0) return new Vector2(0, 0);
        return new Vector2(this.x / len, this.y / len);
    } 
}

export {
    inputKeys,
    Vector2
}