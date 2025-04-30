import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, CircularProgress, TextField, Typography } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CloseIcon from '@mui/icons-material/Close';
import '../pagesCss/ReelUpload.css';

const ReelUpload = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState([]);
  const [musicTitle, setMusicTitle] = useState('');
  const [musicArtist, setMusicArtist] = useState('');
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid video file (MP4, MOV, AVI, MKV)');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Video file must be less than 50MB');
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleDurationLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Please select a video file');
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth-token');
      if (!token) throw new Error('No authentication token found');
  
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('caption', caption);
      formData.append('duration', duration.toString());
      
      // Add these logs for debugging:
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
  
      const response = await axios.post(
        'https://back-nipj.onrender.comapi/reels', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token
          }
        }
      );
  
      console.log('Upload successful:', response.data);
      navigate('/reels');
      
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/reels');
  };

  return (
    <div className="reel-upload-container">
      <div className="reel-upload-header">
        <Typography variant="h5">Create Reel</Typography>
        <button onClick={handleCancel} className="close-button">
          <CloseIcon />
        </button>
      </div>

      <div className="reel-upload-content">
        <div className="video-preview-container">
          {videoPreview ? (
            <>
              <video
                ref={videoRef}
                src={videoPreview}
                controls
                onLoadedMetadata={handleDurationLoaded}
                className="video-preview"
              />
              <Typography variant="caption">
                Duration: {duration.toFixed(2)} seconds
              </Typography>
            </>
          ) : (
            <div className="upload-prompt">
              <input
                type="file"
                id="reel-upload"
                accept="video/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="reel-upload" className="upload-label">
                <Typography variant="h6">Select Video</Typography>
                <Typography variant="caption">
                  MP4, MOV, AVI or MKV. Max 50MB.
                </Typography>
              </label>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="reel-upload-form">
          <TextField
            label="Caption"
            variant="outlined"
            fullWidth
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            margin="normal"
          />

          <div className="music-section">
            <MusicNoteIcon />
            <TextField
              label="Music Title"
              variant="outlined"
              value={musicTitle}
              onChange={(e) => setMusicTitle(e.target.value)}
              margin="normal"
              fullWidth
            />
            <TextField
              label="Music Artist"
              variant="outlined"
              value={musicArtist}
              onChange={(e) => setMusicArtist(e.target.value)}
              margin="normal"
              fullWidth
            />
          </div>

          {error && (
            <Typography color="error" className="error-message">
              {error}
            </Typography>
          )}

          <div className="action-buttons">
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!videoFile || loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} />
                  <span style={{ marginLeft: '8px' }}>Uploading...</span>
                </>
              ) : (
                'Share Reel'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReelUpload;