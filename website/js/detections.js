class Detection {
    constructor(cls, label, score, bbox) {
        this.cls = cls;
        this.label = label;
        this.score = score;
        this.bbox = bbox;

        //So we can pass this directory into Tesseract
        this.rectangle = bbox;
    }
    draw(ctx) {
        this.bbox.draw(ctx, this.label);
    }
}

function dedupe(detections) {
    return detections.map(x => {
        const isDupe = detections
            .map(y => x.bbox.overlaps(y.bbox) && x.score < y.score)
            .reduce((x, y) => x || y);
        return [x, isDupe];
    }).filter(x => !x[1])
    .map(x => x[0]);
}

export { Detection, dedupe };