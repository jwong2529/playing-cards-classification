# model_manager.py
import tensorflow as tf
from tensorflow.keras.models import model_from_json
import numpy as np
from PIL import Image
from io import BytesIO

class ModelManager:
    _instance = None

    @staticmethod
    def get_instance():
        if ModelManager._instance is None:
            ModelManager()
        return ModelManager._instance

    def __init__(self):
        if ModelManager._instance is not None:
            raise Exception("This class is a singleton!")
        else:
            ModelManager._instance = self
            self.load_model()
            self.graph = tf.compat.v1.get_default_graph()

    def load_model(self):
        print("Loading model...")
        with open('playing-cards-model.json', 'r') as json_file:
            model_json = json_file.read()
        self.model = model_from_json(model_json)
        self.model.load_weights('playing-cards-model_weights.h5')

    def preprocess_image(self, image_data):
        """Preprocess the image to the required size and format for the model."""
        image = Image.open(BytesIO(image_data)).convert('RGB')
        image = image.resize((128, 128))
        image_array = np.array(image) / 255.0  # normalize pixel values to [0, 1]
        image_array = np.expand_dims(image_array, axis=0)  # add batch dimension
        return image_array

    def predict(self, image_data):
        with self.graph.as_default():
            processed_image = self.preprocess_image(image_data)
            predictions = self.model.predict(processed_image)
            predicted_class = np.argmax(predictions, axis=1)
            confidence = np.max(predictions)

            # display class if model has at least 40% confidence in its prediction
            confidence_threshold = 0.40
            if confidence < confidence_threshold:
                predicted_label = "no prediction"
            else:
                class_labels = [
                    "ace of clubs", "ace of diamonds", "ace of hearts", "ace of spades",
                    "eight of clubs", "eight of diamonds", "eight of hearts", "eight of spades",
                    "five of clubs", "five of diamonds", "five of hearts", "five of spades",
                    "four of clubs", "four of diamonds", "four of hearts", "four of spades",
                    "jack of clubs", "jack of diamonds", "jack of hearts", "jack of spades",
                    "joker", "king of clubs", "king of diamonds", "king of hearts",
                    "king of spades", "nine of clubs", "nine of diamonds", "nine of hearts",
                    "nine of spades", "queen of clubs", "queen of diamonds", "queen of hearts",
                    "queen of spades", "seven of clubs", "seven of diamonds", "seven of hearts",
                    "seven of spades", "six of clubs", "six of diamonds", "six of hearts",
                    "six of spades", "ten of clubs", "ten of diamonds", "ten of hearts",
                    "ten of spades", "three of clubs", "three of diamonds", "three of hearts",
                    "three of spades", "two of clubs", "two of diamonds", "two of hearts",
                    "two of spades"
                ]
                predicted_label = class_labels[predicted_class[0]]  # map index to label

            return {'prediction': predicted_label, 'confidence': float(confidence)}
