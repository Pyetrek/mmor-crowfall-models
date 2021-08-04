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
