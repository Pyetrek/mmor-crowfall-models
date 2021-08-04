`pip install labelImg` and use that to label the images.

Following tutorial here: https://tensorflow-object-detection-api-tutorial.readthedocs.io/en/latest/training.html

Create venv with `python3 -m venv .venv`
```
chmod +x .venv/bin/activate
source .venv/bin/activate
```

Setup project
```
pip install tensorflow==2.5.0
```

Test
`python3 -c "import tensorflow as tf;print(tf.reduce_sum(tf.random.normal([1000, 1000])))"`
`
sudo apt upgrade
