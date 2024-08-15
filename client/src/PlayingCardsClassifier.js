import React, { useRef, useState } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import './PlayingCardsClassifier.css'

const dataURLToFile = (dataURL, filename) => {
  return fetch(dataURL)
    .then(res => res.blob())
    .then(blob => new File([blob], filename, { type: blob.type }));
};

const PhotoUploadOrCapture = ({ onImageSubmit }) => {
  const webcamRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [fileInputLabel, setFileInputLabel] = useState("No file chosen");

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setSelectedImage(imageSrc);
    setFileInputLabel("Image Captured");
    onImageSubmit(imageSrc);
    setIsWebcamOpen(false); // close the webcam after capturing the image
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      setFileInputLabel(file.name);
      onImageSubmit(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenWebcam = () => {
    setIsWebcamOpen(true);
  };

  const handleCancelWebcam = () => {
    setIsWebcamOpen(false);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Capture or Upload an Image</h3>

      <button onClick={handleOpenWebcam} style={{ marginRight: '10px' }}>Open Camera to Capture Image</button>
      <button onClick={() => document.getElementById('file-upload').click()}>
        Upload Photo
      </button>

      <div style={{ marginTop: '10px', marginBottom: '10px' }}>
        <label htmlFor="file-upload" className="custom-file-upload">
          {fileInputLabel}
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>

      {isWebcamOpen && (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={{ marginBottom: '10px' }}
          />
          <div>
            <button onClick={capture} style={{ marginRight: '10px' }}>Capture photo</button>
            <button onClick={handleCancelWebcam}>Cancel</button>
          </div>
        </>
      )}

      {selectedImage && (
        <div style={{ marginTop: '20px' }}>
          <img
            src={selectedImage}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '5px',
            }}
          />
        </div>
      )}
    </div>
  );
};

const PlayingCardsClassifier = () => {
  const [file, setFile] = useState(null);
  // const [result, setResult] = useState("");
  const [response, setResponse] = useState('');
  const [serverStatus, setServerStatus] = useState("");

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://playing-cards-classifier.onrender.com/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResponse(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="app-container">
      <h1>Playing Cards Classifier</h1>
      <PhotoUploadOrCapture onImageSubmit={handleImageSubmit} />
      {response && <h2>{response}</h2>}
      {serverStatus && <p style={{ color: 'red' }}>{serverStatus}</p>}
    </div>
  );
};



export default PlayingCardsClassifier;