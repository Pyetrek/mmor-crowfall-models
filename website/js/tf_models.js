import { Rectangle } from "./shapes.js";
import { Detection, dedupe } from "./detections.js";

class TfModel {
    constructor(path, model_shape, class_map, classesFn, boxesFn, rawScoresFn, postProcessFn) {
        this.model_path = path;
        this.model_shape = model_shape;
        this.class_map = class_map;
        this.classesFn = classesFn;
        this.boxesFn = boxesFn;
        this.rawScoresFn = rawScoresFn;
        this.postProcessFn = postProcessFn;
    }
    async load() {
        this.model = await tf.loadGraphModel(this.model_path);
    }
    scaleImage(image) {
        image.resize(this.model_shape[0], this.model_shape[1]);
    }
    drawImage(ctx, image) {
        const imageData = new ImageData(
            Uint8ClampedArray.from(image.bitmap.data),
            image.bitmap.width,
            image.bitmap.height
        );
        ctx.putImageData(imageData, 0, 0);
    }
    async infer(image, threshold=0.3) {
        let values = new Float32Array(this.model_shape[0] * this.model_shape[1] * this.model_shape[2]);

        let i = 0;
        // image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
        image.scan(0, 0, this.model_shape[0], this.model_shape[1], (x, y, idx) => {
            const pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
            values[i * this.model_shape[2] + 0] = pixel.r;
            values[i * this.model_shape[2] + 1] = pixel.g;
            values[i * this.model_shape[2] + 2] = pixel.b;
            i++;
        });

        const outShape = [this.model_shape[0], this.model_shape[1], this.model_shape[2]];
        let img_tensor = tf.tensor3d(values, outShape, 'int32');
        img_tensor = img_tensor.expandDims(0);

        const predictions = await this.model.executeAsync(img_tensor);
        const classes = this.classesFn(predictions);
        const boxes = this.boxesFn(predictions);
        const raw_scores = this.rawScoresFn(predictions);

        const detectedObjects = this.buildDetectedObjects(raw_scores, threshold, boxes, classes);
        return this.postProcessFn(detectedObjects);
    }
    buildDetectedObjects(raw_scores, threshold, boxes, classes) {
        const detectionObjects = [];
        const number_of_classes = Object.keys(this.class_map).length;
        for (const [i, cls] of classes.entries()) {
            const score = raw_scores[i * number_of_classes + cls];
            if (score > threshold) {
                const minY = boxes[i * 4] * this.model_shape[1];
                const minX = boxes[i * 4 + 1] * this.model_shape[0];
                const maxY = boxes[i * 4 + 2] * this.model_shape[1];
                const maxX = boxes[i * 4 + 3] * this.model_shape[0];
                const bbox = new Rectangle(minX, minY, maxX - minX, maxY - minY);
                const detectedObject = new Detection(cls, this.class_map[classes[i]], score.toFixed(4), bbox);
                detectionObjects.push(detectedObject);
            }
        }
    
        return detectionObjects
    }
}

async function resourceModel() {
    const labelMap = {
        "0": "background", "1": "iron ore", "2": "copper ore", "3": "aurelium ore", "4": "tin ore", "5": "silver ore", "6": "diamond gem", "7": "sapphire gem", "8": "emerald gem", "9": "ruby gem", "10": "topaz gem", "11": "oak log", "12": "spruce log", "13": "birch log", "14": "ash log", "15": "yew log", "16": "oak heartwood", "17": "spruce heartwood", "18": "birch heartwood", "19": "ash heartwood", "20": "yew heartwood", "21": "granite stone", "22": "limestone stone", "23": "travertine stone", "24": "slate stone", "25": "marble stone", "26": "cinnabar mineral", "27": "dolomite mineral", "28": "halite mineral", "29": "nitre mineral", "30": "sulphur mineral", "31": "flexible hide", "32": "strong hide", "33": "tough hide", "34": "soft hide", "35": "durable hide", "36": "blood", "37": "bone", "38": "ethereal dust", "39": "chaos ember", "40": "gold"
    };
    const model = new TfModel('/models/resources/model.json', [640, 640, 3], labelMap,
        predictions => predictions[0].dataSync(), //classesFn
        predictions => predictions[1].dataSync(), //boxesFn
        predictions => predictions[2].dataSync(), //rawScoresFn
        detectedObjects => dedupe(detectedObjects), //postProcessFn
    );
    await model.load();

    model.scaleImage = (image) => {
        const newWidth = Math.min(model.model_shape[0], 5 * image.bitmap.width);
        const newHeight = Math.min(model.model_shape[1], 5 * image.bitmap.height);
        image.resize(newWidth, newHeight);
    };
    return model;
}

async function numbersModel() {
    const numberLabelMap = {
        "0": "background", "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 0
    };
    const model = new TfModel('/models/numbers/model.json', [320, 320, 3], numberLabelMap,
        predictions => predictions[6].dataSync(), //classesFn
        predictions => predictions[5].dataSync(), //boxesFn
        predictions => predictions[0].dataSync(), //rawScoresFn
        detectedObjects => detectedObjects, //postProcessFn
    );
    await model.load();
    return model;
}

export { TfModel, resourceModel, numbersModel };
