import React, { useRef, useState } from 'react';
import axios from 'axios';
import {Camera} from "react-camera-pro";
import {BrowserView, MobileView} from 'react-device-detect';
import './PlayingCardsClassifier.css'
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

const PhotoUploadOrCapture = ({ onImageSubmit, onOpenCamera }) => {
  const cameraRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [fileInputLabel, setFileInputLabel] = useState("No file chosen");

  const capture = async () => {
    if (cameraRef.current) {
      const imageSrc = await cameraRef.current.takePhoto();
      setSelectedImage(imageSrc);
      setFileInputLabel("Image Captured");
      onImageSubmit(imageSrc);
      setIsCameraOpen(false); //close camera after capturing image
    }
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

  const handleOpenCamera = () => {
    setIsCameraOpen(true);
    setSelectedImage(null);
    setFileInputLabel("No file chosen");
    onOpenCamera();
  };

  const handleCancelCamera = () => {
    setIsCameraOpen(false);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <BrowserView>
        <Typography variant="subtitle2" gutterBottom>
            Capture or Upload an Image
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button onClick={handleOpenCamera} variant="outlined">Open Camera to Capture Image</Button>
          <Button onClick={() => document.getElementById('file-upload').click()} variant="outlined">
            Upload Photo
          </Button>
          <label htmlFor="file-upload" className="custom-file-upload">
            <Typography variant="overline" display="block" gutterBottom>
            {fileInputLabel}
            </Typography>
          </label>
        </Stack>

        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>

        {isCameraOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '350px', height: '210px', position: 'relative', marginBottom: '10px'}}>
              <Camera
                ref={cameraRef}
                aspectRatio={5 / 3}  // Adjust aspect ratio if needed
                facingMode='environment'
                style={{ width: '100%', height: '100%'}}
              />
            </div>
            <Stack direction="row" spacing={2}>
              <Button onClick={capture} variant="outlined" color="success">Capture photo</Button>
              <Button onClick={handleCancelCamera} variant="outlined" color="error">Cancel</Button>
            </Stack>
          </div>
        )}
      </BrowserView>

      <MobileView>
        <Stack direction="row" spacing={2}>
          <Button onClick={() => document.getElementById('file-upload').click()} variant="outlined">
            Take Or Upload Photo
          </Button>
          <label htmlFor="file-upload" className="custom-file-upload">
            <Typography variant="overline" display="block" gutterBottom>
            {fileInputLabel}
            </Typography>
          </label>
        </Stack>

        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </MobileView>

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

const dataURLToFile = (dataURL, filename) => {
  return fetch(dataURL)
    .then(res => res.blob())
    .then(blob => new File([blob], filename, { type: blob.type }));
};

const PlayingCardsClassifier = () => {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState('');
  const [serverStatus, setServerStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageSubmit = async (imageDataURL) => {
    setLoading(true);
    const file = await dataURLToFile(imageDataURL, 'image.jpg');
    const formData = new FormData();
    formData.append('file', file);

  try {
    const response = await axios.post('https://playing-cards-classifier.onrender.com/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const { prediction, confidence } = response.data;
    const roundedConfidence = confidence.toFixed(2);
    setResponse({ prediction, confidence: roundedConfidence });
    setServerStatus("");
    } catch (error) {
      console.error('Error uploading file:', error);
      setServerStatus("Server is offline. Please try again later.")
      setResponse('');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCamera = () => {
    setResponse('');
    setServerStatus('');
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'green'; //high confidence
    if (confidence >= 0.4) return 'orange'; //medium confidence
    return 'red'; //low confidence
  }

  return (
    <div className="app-container">
      <Typography variant="button" fontWeight={'fontWeightBold'} fontSize={28} gutterBottom>
         Playing Cards Classifier 
      </Typography>
      <PhotoUploadOrCapture onImageSubmit={handleImageSubmit} onOpenCamera={handleOpenCamera} />

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </div>
      )}

      {response && typeof response === 'object' && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Typography variant="h6" style={{ color: 'blue' }}>
            Prediction: {response.prediction}
          </Typography>
          <Typography variant="h6" style={{ color: getConfidenceColor(response.confidence) }}>
            Confidence: {response.confidence}
          </Typography>
        </div>
      )}

      {serverStatus && (
        <Typography variant="h6" style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>
          {serverStatus}
        </Typography>
      )}
    </div>
  );
};

export default PlayingCardsClassifier;