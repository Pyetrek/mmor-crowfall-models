`pip install labelImg` and use that to label the images.

Following tutorial here: https://tensorflow-object-detection-api-tutorial.readthedocs.io/en/latest/training.html


- For installing cuda toolkit I had to install an older kernel https://ubuntuhandbook.org/index.php/2020/12/install-linux-kernel-5-10-ubuntu-linux-mint/
- And then upgrade grub https://askubuntu.com/questions/216398/set-older-kernel-as-default-grub-entry
```
sudo cp /etc/default/grub /etc/default/grub.bak
sudo -H gedit /etc/default/grub
```
- You then combine those two strings with > and set GRUB_DEFAULT to them as: GRUB_DEFAULT="Advanced options for Ubuntu>Ubuntu, with Linux 3.13.0-53-generic"

```
sudo update-grub
```
- Use the deb packages for installing `CUDNN`

```
sudo apt  install protobuf-compiler
sudo apt-get install python3-dev
```

Create venv with `python3 -m venv .venv`
```
chmod +x .venv/bin/activate
source .venv/bin/activate
```

```
cd /tmp
git clone https://github.com/cocodataset/cocoapi.git
cd cocoapi/PythonAPI
make
cp -r pycocotools /home/mark/src/mmor-crowfall-models/models/research
```

Setup project
---

```
pip install tensorflow==2.5.0
```

Test
`python3 -c "import tensorflow as tf;print(tf.reduce_sum(tf.random.normal([1000, 1000])))"`

Setup project, and get model ready to train
```
cd models/research/
protoc object_detection/protos/*.proto --python_out=.
cp object_detection/packages/tf2/setup.py .
python -m pip install .
python object_detection/builders/model_builder_tf2_test.py
```

```
cd scripts/preprocessing/
export IMAGES_PATH=/home/mark/src/mmor-crowfall-models/workspace/crowfall/images
export ANNOTATIONS_PATH=/home/mark/src/mmor-crowfall-models/workspace/crowfall/annotations
python generate_tfrecord.py -x ${IMAGES_PATH}/train -l ${ANNOTATIONS_PATH}/label_map_all.pbtxt -o ${ANNOTATIONS_PATH}/train.record
python generate_tfrecord.py -x ${IMAGES_PATH}/test -l ${ANNOTATIONS_PATH}/label_map_all.pbtxt -o ${ANNOTATIONS_PATH}/test.record
```
Note: Double check that these files generate because training will do nothing (sit there and spin) if the training.record file is empty.

Setup training pipeline
```
mkdir -p workspace/crowfall/pre-trained-models
cd workspace/crowfall/pre-trained-models
wget http://download.tensorflow.org/models/object_detection/tf2/20200711/ssd_resnet50_v1_fpn_640x640_coco17_tpu-8.tar.gz
tar xvf ssd_resnet50_v1_fpn_640x640_coco17_tpu-8.tar.gz
rm ssd_resnet50_v1_fpn_640x640_coco17_tpu-8.tar.gz
```

```
cp models/research/object_detection/model_main_tf2.py workspace/crowfall
```

Do the training
```
cd workspace/crowfall
export PATH=/usr/local/cuda-11.2/bin${PATH:+:${PATH}}
export LD_LIBRARY_PATH=/usr/local/cuda-11.2/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
python model_main_tf2.py --model_dir=models/crowfall_all_v2.1 --pipeline_config_path=models/crowfall_all_v2.1/pipeline.config
```

Export model
```
cp models/research/object_detection/exporter_main_v2.py workspace/crowfall/
cd workspace/crowfall/
mkdir -p ./exported-models
python exporter_main_v2.py --input_type image_tensor --pipeline_config_path ./models/crowfall_all_v2.1/pipeline.config --trained_checkpoint_dir ./models/crowfall_all_v2.1/ --output_directory ./exported-models/crowfall_all_v2.1
```

Run Inference
```
sudo apt-get install tcl-dev tk-dev python-tk python3-tk
cd workspace/crowfall/exported-models
python run_model.py
```
