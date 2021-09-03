import { resourceModel, numbersModel } from "./js/tf_models.js";

async function run() {
    // load model
    // const image = await Jimp.read('/test_images/ore_2.png');
    const model = await resourceModel();
    // await model.infer(image);
    const number_model = await numbersModel();
    // await number_model.infer(image);

    const button = document.getElementById('start_btn');
    const uploader = document.getElementById('uploader');
    uploader.addEventListener('change', () => {
        button.disabled = false;
    });
    button.addEventListener('click', () => {
        const image_path = URL.createObjectURL(uploader.files[0]);
        run_model(model, number_model, image_path);
    });
    uploader.disabled = false;
}

async function run_model(model, number_model, image_path) {
    // const image_path = '/test_images/ore_2.png';
    const image = await Jimp.read(image_path);

    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    
    model.scaleImage(image);
    model.drawImage(ctx, image);

    const detectedObjects = await model.infer(image);

    for (const obj of detectedObjects) {
        obj.draw(ctx);
        const clone = image.clone();
        clone.crop(obj.bbox.point.x, obj.bbox.point.y, obj.bbox.w, obj.bbox.h);
        number_model.scaleImage(clone);
        const numbers = await number_model.infer(clone);
        for (const number of numbers) {
            number.bbox.scale(obj.bbox.w/clone.bitmap.width, obj.bbox.h/clone.bitmap.height);
            number.bbox.draw(ctx, number.label, obj.bbox.point.x, obj.bbox.point.y);
        }
    }

    console.log("Done drawing boxes");
  }
  
  run();