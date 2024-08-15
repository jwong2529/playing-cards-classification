import React, { useRef, useState } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import './PlayingCardsClassifier.css'

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
  const [result, setResult] = useState("");
  const [serverStatus, setServerStatus] = useState("");

  const handleImageSubmit = (image) => {
    setFile(image);
    sendToBackend(image);
  };

  // const sendToBackend = async (image) => {
  //   try {
  //     // convert image data URL to a Blob
  //     const response = await fetch(image);
  //     if (!response.ok) {
  //       throw new Error("Failed to convert image")
  //     }
  //     const blob = await response.blob();
      
  //     // create FormData object
  //     const formData = new FormData();
  //     formData.append('file', blob, 'image.jpg'); // append the file to FormData
  
  //     const res = await fetch('https://playing-cards-classifier.onrender.com/predict', {
  //       method: 'POST',
  //       body: formData // send the FormData object
  //     });
      
  //     if (!res.ok) {
  //       const errorText = await res.text()
  //       throw new Error(`HTTP error! status: ${res.status}, response: ${errorText}`)
  //     }
  //     const data = await res.json();
  //     setResult(data.prediction);
  //     setServerStatus("");
  //   } catch (error) {
  //     console.error("Detailed error:", error.message);
  //     setServerStatus("Server offline. Please try again later.");
  //   }
  // };

  const sendToBackend = async (image) => {
    try {
      
      // Create FormData object
      const formData = new FormData();
      formData.append('file', file); // Append the file to FormData

      // Make POST request using axios
      const res = await axios.post('https://playing-cards-classifier.onrender.com/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(res.data.prediction);
      setServerStatus("");
    } catch (error) {
      console.error("Detailed error:", error.message);
      setServerStatus("Server offline. Please try again later.");
    }
  };

  const dataURLToBlob = (dataURL) => {
    return fetch(dataURL)
      .then(res => res.blob());
  };

  return (
    <div className="app-container">
      <h1>Playing Cards Classifier</h1>
      <PhotoUploadOrCapture onImageSubmit={handleImageSubmit} />
      {result && <h2>{result}</h2>}
      {serverStatus && <p style={{ color: 'red' }}>{serverStatus}</p>}
    </div>
  );
};



export default PlayingCardsClassifier;