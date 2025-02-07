import os
from flask import Flask, request, jsonify, render_template, url_for
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import model_from_json
from PIL import Image
from io import BytesIO
import random

app = Flask(__name__)
CORS(app)

IMG_SIZE = (128, 128)
model = None

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

def load_model():
    global model
    if model is not None:
        return  # model already loaded
    print("Loading model...")

    with open('playing-cards-model.json', 'r') as json_file:
        model_json = json_file.read()

    model = model_from_json(model_json)
    model.load_weights('playing-cards-model_weights.h5')
    print("Model loaded successfully.")

def preprocess_image(image_data):
    image = Image.open(BytesIO(image_data)).convert('RGB')
    image = image.resize(IMG_SIZE, Image.LANCZOS)
    image_array = np.array(image) / 255.0  # normalize pixel values to [0, 1]
    image_array = np.expand_dims(image_array, axis=0)  # add batch dimension
    return image_array

@app.route("/")
def connect():
    return render_template("index.html")

@app.route('/predict', methods=['POST'])
def predict():
    print("Received a prediction request...")
    if 'file' not in request.files:
        print("No file provided")
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        print("No file selected")
        return jsonify({'error': 'No file selected'}), 400
    
    # Preprocess the image
    processed_image = preprocess_image(file.read())
    
    # Predict
    load_model()
    print("Making prediction...")
    predictions = model.predict(processed_image)
    predicted_class = np.argmax(predictions, axis=1)
    confidence = np.max(predictions)

    # Display class if model has at least 40% confidence in its prediction
    confidence_threshold = 0.20
    if confidence < confidence_threshold:
        predicted_label = "no prediction"
    else:
        predicted_label = class_labels[predicted_class[0]]  # map index to label
    
    print(f"Prediction: {predicted_label}, Confidence: {float(confidence)}")
    
    return jsonify({'prediction': predicted_label, 'confidence': float(confidence)})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))  # default to 10000 if PORT is not set
    print(f"Server is running on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
