import { Rectangle } from "./js/shapes.js";
import { Detection, dedupe } from "./js/detections.js";

const labelMap = {
    "1": "iron ore",
    "2": "copper ore",
    "3": "aurelium ore",
    "4": "tin ore",
    "5": "silver ore",
    "6": "diamond gem",
    "7": "sapphire gem",
    "8": "emerald gem",
    "9": "ruby gem",
    "10": "topaz gem",
    "11": "oak log",
    "12": "spruce log",
    "13": "birch log",
    "14": "ash log",
    "15": "yew log",
    "16": "oak heartwood",
    "17": "spruce heartwood",
    "18": "birch heartwood",
    "19": "ash heartwood",
    "20": "yew heartwood",
    "21": "granite stone",
    "22": "limestone stone",
    "23": "travertine stone",
    "24": "slate stone",
    "25": "marble stone",
    "26": "cinnabar mineral",
    "27": "dolomite mineral",
    "28": "halite mineral",
    "29": "nitre mineral",
    "30": "sulphur mineral",
    "31": "flexible hide",
    "32": "strong hide",
    "33": "tough hide",
    "34": "soft hide",
    "35": "durable hide",
    "36": "blood",
    "37": "bone",
    "38": "ethereal dust",
    "39": "chaos ember",
    "40": "gold"
}
function buildDetectedObjects(raw_scores, threshold, imageWidth, imageHeight, boxes, classes, classesDir) {
    const detectionObjects = []
    classes.forEach((cls, i) => {
        //TODO 41 is how many classes there are
        //Each bounding box gets a score for all classes, so the first 41 entries are for bounding box 1 (0 -> 40), from (41 -> 81) bounding box 2 etc.
        //We already know wht class is the highest, so we just grab that score out of the list.
        const score = raw_scores[i * 41 + cls]
        if (score > threshold) {
            const minY = boxes[i * 4] * imageHeight;
            const minX = boxes[i * 4 + 1] * imageWidth;
            const maxY = boxes[i * 4 + 2] * imageHeight;
            const maxX = boxes[i * 4 + 3] * imageWidth;
            const bbox = new Rectangle(minX, minY, maxX - minX, maxY - minY);
            detectionObjects.push(new Detection(cls, labelMap[classes[i]], score.toFixed(4), bbox));
        }
    })

    return detectionObjects
}

function exportToFile(url, filename){
    var hiddenElement = document.createElement('a');
    hiddenElement.href = url;
    hiddenElement.target = '_blank';
    hiddenElement.download = filename;
    hiddenElement.click();
}

async function run() {
    // load model
    const model = await tf.loadGraphModel('/model/model.json');

    const image_path = '/test_images/ore_2.png'
    const image = await Jimp.read(image_path);
    const model_shape = [640, 640, 3]
    // image.cover(model_shape[0], model_shape[1], Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE); //This works
    image.resize(model_shape[0], model_shape[1]);

    let values = new Float32Array(model_shape[0] * model_shape[1] * model_shape[2]);

    let i = 0;
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
        const pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
        values[i * model_shape[2] + 0] = pixel.r;
        values[i * model_shape[2] + 1] = pixel.g;
        values[i * model_shape[2] + 2] = pixel.b;
        i++;
    });

    const outShape = [model_shape[0], model_shape[1], model_shape[2]];
    let img_tensor = tf.tensor3d(values, outShape, 'int32');
    img_tensor = img_tensor.expandDims(0);

    const predictions = await model.executeAsync(img_tensor);
    const classes = predictions[0].dataSync();
    const boxes = predictions[1].dataSync();
    const raw_scores = predictions[2].dataSync();

    const detectedObjects = dedupe(buildDetectedObjects(raw_scores, 0.3, image.bitmap.width, image.bitmap.height, boxes, classes, {}));


    detectedObjects.forEach((obj, idx) => {
        const clone = image.clone();
        clone.crop(obj.bbox.point.x, obj.bbox.point.y, obj.bbox.w, obj.bbox.h);
        const imageData = new ImageData(
            Uint8ClampedArray.from(clone.bitmap.data),
            clone.bitmap.width,
            clone.bitmap.height
        );
        const c = document.createElement('canvas');
        c.width = obj.bbox.w;
        c.height = obj.bbox.h
        const ctx = c.getContext("2d");
        ctx.putImageData(imageData, 0, 0);
        c.toBlob(blob => {
            exportToFile(window.URL.createObjectURL(blob), "cropped_" + idx + ".png");
        })
    });
    console.log("Done drawing boxes");

  }
  
  run();