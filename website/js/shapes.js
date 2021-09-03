function between(value, v1, v2) {
    const min = Math.min(v1, v2);
    const max = Math.max(v1, v2);
    return value >= min && value <= max;
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Line {
    constructor(points) {
        this.points = points
    }
    intersects(line) {
        return between(this.points[0].x, line.points[0].x, line.points[1].x) && between(line.points[0].y, this.points[0].y, this.points[1].y) ||
            between(this.points[0].y, line.points[0].y, line.points[1].y) && between(line.points[0].x, this.points[0].x, this.points[1].x);
    }
}

class Rectangle {
    constructor(x, y, w, h) {
        this._init(x, y, w, h);
    }

    _init(x, y, w, h) {
        this.w = w;
        this.h = h;
        this.area = w * h;
        this.point = new Point(x, y);
        this.lines = [
          new Line([new Point(x, y), new Point(x + w, y)]),
          new Line([new Point(x + w, y), new Point(x + w, y + h)]),
          new Line([new Point(x + w, y + h), new Point(x, y + h)]),
          new Line([new Point(x, y + h), new Point(x, y)]),
        ];
    }

    overlaps(rect) {
        return rect.lines.map(line1 => {
            return this.lines.map(line2 => line1.intersects(line2)).reduce((x, y) => x || y);
        }).reduce((x, y) => x || y) || this.contains(rect.point) || rect.contains(this.point);
    }
    contains(point) {
        return this.point.x <= point.x && 
            this.point.y <= point.y && 
            (this.point.x + this.w) >= point.x && 
            (this.point.y + this.h) >= point.y;
    }
    draw(ctx, label=null, offsetX=0, offsetY=0) {
        ctx.strokeStyle = "white";
        ctx.fillStyle = "white";
        const point = this.point;
        ctx.strokeRect(point.x + offsetX, point.y + offsetY, this.w, this.h);
        if (label != null) {
            ctx.fillText(label, point.x + offsetX, point.y + offsetY);
        }
    }

    scale(xMult, yMult) {
        this._init(this.point.x * xMult, this.point.y * yMult, this.w * xMult, this.h * yMult);
    }
}

export { Rectangle, Point, Line };
