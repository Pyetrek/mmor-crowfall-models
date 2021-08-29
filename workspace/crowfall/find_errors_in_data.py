import os
import pathlib
import tensorflow as tf
import time
from object_detection.utils import label_map_util
from object_detection.utils import visualization_utils as viz_utils
import numpy as np
from PIL import Image
import matplotlib
import matplotlib.pyplot as plt
import warnings
import cv2

#### Inputs
IMAGE_DIR = '/home/mark/src/mmor-crowfall-models/workspace/crowfall/images/test'
IMAGE_PATHS = [f'{IMAGE_DIR}/{i}' for i in os.listdir(IMAGE_DIR) if '.png' in i]
IMAGE_PATHS = [
  '/home/mark/src/mmor-crowfall-models/workspace/crowfall/images/test/wood_2.png',
  '/home/mark/src/mmor-crowfall-models/workspace/crowfall/images/test/minerals_13.png'
]
# IMAGE_PATHS = ['/home/mark/src/mmor-crowfall-models/workspace/crowfall/images/test/donation_8.png']

PATH_TO_MODEL_DIR = '/home/mark/src/mmor-crowfall-models/workspace/crowfall/exported-models/crowfall_all_v2.1'

PATH_TO_LABELS = '/home/mark/src/mmor-crowfall-models/workspace/crowfall/annotations/label_map_all.pbtxt'

#####


os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'    # Suppress TensorFlow logging (1)
tf.get_logger().setLevel('ERROR')           # Suppress TensorFlow logging (2)

# Enable GPU dynamic memory allocation
gpus = tf.config.experimental.list_physical_devices('GPU')
for gpu in gpus:
    tf.config.experimental.set_memory_growth(gpu, True)

# %%
# Load the model
# ~~~~~~~~~~~~~~
# Next we load the downloaded model
PATH_TO_SAVED_MODEL = PATH_TO_MODEL_DIR + '/saved_model'

print('Loading model...', end='')
start_time = time.time()

# Load saved model and build the detection function
detect_fn = tf.saved_model.load(PATH_TO_SAVED_MODEL)

end_time = time.time()
elapsed_time = end_time - start_time
print('Done! Took {} seconds'.format(elapsed_time))

# %%
# Load label map data (for plotting)
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Label maps correspond index numbers to category names, so that when our convolution network
# predicts `5`, we know that this corresponds to `airplane`.  Here we use internal utility
# functions, but anything that returns a dictionary mapping integers to appropriate string labels
# would be fine.

category_index = label_map_util.create_category_index_from_labelmap(PATH_TO_LABELS,
                                                                    use_display_name=True)

for i in category_index:
  category_index[i]['name'] = category_index[i]['name'][0:3]
print(category_index)

# %%
# Putting everything together
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~
# The code shown below loads an image, runs it through the detection model and visualizes the
# detection results, including the keypoints.
#
# Note that this will take a long time (several minutes) the first time you run this code due to
# tf.function's trace-compilation --- on subsequent runs (e.g. on new images), things will be
# faster.
#
# Here are some simple things to try out if you are curious:
#
# * Modify some of the input images and see if detection still works. Some simple things to try out here (just uncomment the relevant portions of code) include flipping the image horizontally, or converting to grayscale (note that we still expect the input image to have 3 channels).
# * Print out `detections['detection_boxes']` and try to match the box locations to the boxes in the image.  Notice that coordinates are given in normalized form (i.e., in the interval [0, 1]).
# * Set ``min_score_thresh`` to other values (between 0 and 1) to allow more detections in or to filter out more detections.

# warnings.filterwarnings('ignore')   # Suppress Matplotlib warnings
matplotlib.use("TkAgg")  # https://www.pyimagesearch.com/2015/08/24/resolved-matplotlib-figures-not-showing-up-or-displaying/

def load_image_into_numpy_array(path):
    """Load an image from file into a numpy array.

    Puts image into numpy array to feed into tensorflow graph.
    Note that by convention we put it into a numpy array with shape
    (height, width, channels), where channels=3 for RGB.

    Args:
      path: the file path to the image

    Returns:
      uint8 numpy array with shape (img_height, img_width, 3)
    """
    img = np.array(Image.open(path))
    return cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)


for image_path in IMAGE_PATHS:

    print('Running inference for {}... '.format(image_path), end='')

    image_np = load_image_into_numpy_array(image_path)

    # Things to try:
    # Flip horizontally
    # image_np = np.fliplr(image_np).copy()

    # Convert image to grayscale
    # image_np = np.tile(
    #     np.mean(image_np, 2, keepdims=True), (1, 1, 3)).astype(np.uint8)

    # The input needs to be a tensor, convert it using `tf.convert_to_tensor`.
    input_tensor = tf.convert_to_tensor(image_np)
    # The model expects a batch of images, so add an axis with `tf.newaxis`.
    input_tensor = input_tensor[tf.newaxis, ...]

    # input_tensor = np.expand_dims(image_np, 0)
    detections = detect_fn(input_tensor)

    # All outputs are batches tensors.
    # Convert to numpy arrays, and take index [0] to remove the batch dimension.
    # We're only interested in the first num_detections.
    num_detections = int(detections.pop('num_detections'))
    detections = {key: value[0, :num_detections].numpy()
                   for key, value in detections.items()}
    detections['num_detections'] = num_detections

    # detection_classes should be ints.
    detections['detection_classes'] = detections['detection_classes'].astype(np.int64)

    print(detections)
    # image_np_with_detections = image_np.copy()

    # viz_utils.visualize_boxes_and_labels_on_image_array(
    #       image_np_with_detections,
    #       detections['detection_boxes'],
    #       detections['detection_classes'],
    #       detections['detection_scores'],
    #       category_index,
    #       use_normalized_coordinates=True,
    #       max_boxes_to_draw=200,
    #       min_score_thresh=.30,
    #       agnostic_mode=False)

    # plt.figure()
    # plt.imshow(image_np_with_detections)
    # print('Done')
plt.show()
print('Done all images.')
# sphinx_gallery_thumbnail_number = 2