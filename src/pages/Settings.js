import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const API_BASE_URL = "https://back-nipj.onrender.comapi";

const Settings = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setCurrentUser(storedUser);
    fetchProfileVisibility();
  }, [navigate]);

  const fetchProfileVisibility = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await axios.get(`${API_BASE_URL}/profile/visibility`, {
        headers: { 'x-auth-token': token }
      });
      setIsPublic(response.data.isPublic);
    } catch (err) {
      console.error("Error fetching profile visibility:", err);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetPassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('auth-token');
      
      await axios.post(
        `${API_BASE_URL}/auth/reset-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { 'x-auth-token': token }
        }
      );

      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

// Update the handleToggleVisibility function
const handleToggleVisibility = async () => {
  try {
    const newVisibility = !isPublic;
    const token = localStorage.getItem('auth-token');
    
    const response = await axios.put(
      `${API_BASE_URL}/profile/visibility`,
      { isPrivate: !newVisibility }, // Note: We're using isPrivate here
      { headers: { 'x-auth-token': token } }
    );
    
    setIsPublic(newVisibility);
    setSuccess(`Profile is now ${newVisibility ? 'public' : 'private'}`);
    
    // Update local user data
    const updatedUser = { ...currentUser, isPrivate: !newVisibility };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to update profile visibility');
  }
};

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('auth-token');
      
      await axios.delete(`${API_BASE_URL}/profile/delete`, {
        headers: { 'x-auth-token': token },
        data: { password: passwordData.currentPassword }
      });

      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account');
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Password Reset Section */}
      <Box sx={{ mb: 4, p: 3, border: '1px solid #ddd', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockResetIcon /> Change Password
        </Typography>
        
        <TextField
          fullWidth
          margin="normal"
          label="Current Password"
          name="currentPassword"
          type="password"
          value={passwordData.currentPassword}
          onChange={handlePasswordChange}
        />
        
        <TextField
          fullWidth
          margin="normal"
          label="New Password"
          name="newPassword"
          type="password"
          value={passwordData.newPassword}
          onChange={handlePasswordChange}
        />
        
        <TextField
          fullWidth
          margin="normal"
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          value={passwordData.confirmPassword}
          onChange={handlePasswordChange}
        />
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleResetPassword}
          disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Reset Password'}
        </Button>
      </Box>

      {/* Profile Visibility Section */}
      <Box sx={{ mb: 4, p: 3, border: '1px solid #ddd', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isPublic ? <VisibilityIcon /> : <VisibilityOffIcon />} Profile Visibility
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={isPublic}
              onChange={handleToggleVisibility}
              color="primary"
            />
          }
          label={isPublic ? "Public Profile (Visible to everyone)" : "Private Profile (Visible only to followers)"}
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {isPublic 
            ? "Your profile and posts are visible to everyone on Vizz." 
            : "Only approved followers can see your profile and posts."}
        </Typography>
      </Box>

      {/* Delete Account Section */}
      <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, backgroundColor: '#fff8f8' }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <DeleteIcon /> Delete Account
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </Typography>
        
        <Button
          variant="outlined"
          color="error"
          onClick={() => setOpenDeleteDialog(true)}
          disabled={loading}
        >
          Delete My Account
        </Button>
      </Box>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This will permanently remove:
          </DialogContentText>
          <ul>
            <li>Your profile</li>
            <li>All your posts</li>
            <li>Your stories</li>
            <li>All associated data</li>
          </ul>
          <DialogContentText sx={{ mt: 2 }}>
            To confirm, please enter your current password:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            variant="standard"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error"
            disabled={!passwordData.currentPassword || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Permanently Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings;