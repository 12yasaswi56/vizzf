import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Avatar, Button, TextField, Typography, Box, CircularProgress, Alert } from '@mui/material';
import '../pagesCss/EditProfile.css';
const API_BASE_URL = "http://localhost:5000/api";

const EditProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: '',
    bio: '',
    profilePic: '',
    designation: '',
    role: '',
    linkedinUrl: ''
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authStatus, setAuthStatus] = useState({ valid: null, message: '' });

  useEffect(() => {
    // Verify token is valid before attempting to fetch data
    const checkAuth = async () => {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setAuthStatus({ valid: false, message: 'No authentication token found. Please log in again.' });
        return false;
      }
      
      console.log("Token from localStorage:", token);
      return true;
    };

    const fetchUserData = async () => {
      if (!(await checkAuth())) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const token = localStorage.getItem('auth-token');
        const response = await axios.get(`${API_BASE_URL}/profile/${userId}`, {
          headers: { 'x-auth-token': token }
        });
        setUserData(response.data);
        setError(null);
        setAuthStatus({ valid: true, message: 'Authentication successful' });
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response && error.response.status === 401) {
          setAuthStatus({ valid: false, message: 'Authentication failed. Please log in again.' });
          localStorage.removeItem('token'); // Clear invalid token
        } else {
          setError("Failed to load user data");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('profilePic', file);
    
    try {
      setUploading(true);
      const token = localStorage.getItem('auth-token');
      
      // Log the token for debugging
      console.log("Token before upload:", token ? "Token exists" : "No token found");
      
      // Important: For file uploads, don't set Content-Type
      // Let the browser set it with the correct boundary for multipart/form-data
      const response = await axios.post(`${API_BASE_URL}/profile/upload`, formData, {
        headers: {
          'x-auth-token': token
          // Don't set Content-Type here, axios will set it correctly with boundary
        }
      });
      
      // Update the profile pic in the state
      setUserData({ ...userData, profilePic: response.data.profilePic });
      console.log("Profile picture uploaded successfully:", response.data.profilePic);
      setError(null);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      if (error.response) {
        console.log("Error response:", error.response.status, error.response.data);
        
        if (error.response.status === 401) {
          setAuthStatus({ valid: false, message: 'Authentication failed. Please log in again.' });
          localStorage.removeItem('auth-token'); // Clear invalid token
        } else {
          setError(`Failed to upload: ${error.response.data.error || "Unknown error"}`);
        }
      } else {
        setError("Network error while uploading");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setAuthStatus({ valid: false, message: 'No authentication token found. Please log in again.' });
        return;
      }
      
      // Send the updated profile data including the new fields
      await axios.put(`${API_BASE_URL}/profile/${userId}/update`, {
        username: userData.username,
        bio: userData.bio,
        profilePic: userData.profilePic,
        designation: userData.designation,
        role: userData.role,
        linkedinUrl: userData.linkedinUrl
      }, {
        headers: { 'x-auth-token': token }
      });
      
      navigate(`/profile/${userId}`);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response && error.response.status === 401) {
        setAuthStatus({ valid: false, message: 'Authentication failed. Please log in again.' });
        localStorage.removeItem('auth-token'); // Clear invalid token
      } else {
        setError("Failed to update profile");
      }
    }
  };

  const handleLogin = () => {
    // Redirect to login page
    navigate('/login', { state: { returnUrl: `/edit-profile/${userId}` } });
  };

  if (authStatus.valid === false) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {authStatus.message}
        </Alert>
        <Button variant="contained" onClick={handleLogin}>
          Go to Login
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="edit-profile-container" sx={{ padding: 2, maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Edit Profile</Typography>
      
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Avatar
          src={userData.profilePic ? `http://localhost:5000${userData.profilePic}` : ''}
          alt="Profile Picture"
          sx={{ width: 100, height: 100, margin: '0 auto', mb: 2 }}
        />
        
        <label htmlFor="profile-pic-upload">
          <input
            id="profile-pic-upload"
            type="file"
            accept="image/*"
            onChange={handleProfilePicChange}
            style={{ display: 'none' }}
          />
          <Button
            variant="outlined"
            component="span"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Change Profile Picture'}
          </Button>
        </label>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Username"
          name="username"
          value={userData.username || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
      </Box>
      
      {/* New fields for designation and role */}
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Designation"
          name="designation"
          value={userData.designation || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          placeholder="e.g., Software Engineer, Product Manager"
        />
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Role"
          name="role"
          value={userData.role || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          placeholder="e.g., Team Lead, Frontend Developer"
        />
      </Box>
      
      {/* LinkedIn URL field */}
      <Box sx={{ mb: 2 }}>
        <TextField
          label="LinkedIn Profile URL"
          name="linkedinUrl"
          value={userData.linkedinUrl || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Bio"
          name="bio"
          value={userData.bio || ''}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Button 
        variant="contained" 
        onClick={handleSave} 
        fullWidth
      >
        Save Profile
      </Button>
    </Box>
  );
};

export default EditProfile;