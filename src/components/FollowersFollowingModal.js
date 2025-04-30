import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Button, 
  Typography,
  IconButton,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const API_BASE_URL = "https://back-nipj.onrender.com/api";

const FollowersFollowingModal = ({ 
  open, 
  onClose, 
  userId, 
  type, // 'followers' or 'following'
  currentUserId
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && userId) {
      fetchUsers();
    }
  }, [open, type, userId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Make sure we have a valid token
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      const endpoint = type === 'followers' 
        ? `${API_BASE_URL}/profile/${userId}/followers` 
        : `${API_BASE_URL}/profile/${userId}/following`;
      
      const response = await axios.get(endpoint, {
        headers: { 'x-auth-token': token }
      });
      
      setUsers(response.data);
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      const errorMessage = err.response?.data?.error || 
                         `Failed to load ${type}. ${err.response?.status === 401 ? 'Please log in again.' : ''}`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (targetUserId, isCurrentlyFollowing) => {
    try {
      const token = localStorage.getItem('auth-token');
      console.log("Token from localStorage:", localStorage.getItem('token'));

      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const endpoint = isCurrentlyFollowing
        ? `${API_BASE_URL}/profile/${targetUserId}/unfollow`
        : `${API_BASE_URL}/profile/${targetUserId}/follow`;
      
      await axios.post(endpoint, {}, {
        headers: { 'x-auth-token': token }
      });
      
      // Update local state to reflect the change
      setUsers(prevUsers => prevUsers.map(user => {
        if (user._id === targetUserId) {
          return { ...user, isFollowing: !isCurrentlyFollowing };
        }
        return user;
      }));
    } catch (err) {
      console.error('Error toggling follow:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update follow status';
      setError(errorMessage);
    }
  };

  const handleUserClick = (userId) => {
    onClose();
    window.location.href = `/profile/${userId}`;
  };

  const title = type === 'followers' ? 'Followers' : 'Following';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h6" component="h2">{title}</Typography>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress />
          </div>
        ) : error ? (
          <Typography color="error" align="center" sx={{ p: 2 }}>{error}</Typography>
        ) : users.length === 0 ? (
          <Typography align="center" sx={{ p: 2 }}>
            {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
          </Typography>
        ) : (
          <List>
            {users.map(user => (
              <ListItem 
                key={user._id} 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <ListItemAvatar onClick={() => handleUserClick(user._id)}>
                  <Avatar 
                    src={user.profilePic ? `https://localhost:5000${user.profilePic}` : ''} 
                    alt={user.username}
                  />
                </ListItemAvatar>
                <ListItemText 
                  primary={user.username} 
                  secondary={user.fullName}
                  onClick={() => handleUserClick(user._id)}
                  sx={{ flexGrow: 1 }}
                />
                {currentUserId && currentUserId !== user._id && (
                  <Button 
                    variant={user.isFollowing ? "outlined" : "contained"} 
                    color="primary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollowToggle(user._id, user.isFollowing);
                    }}
                  >
                    {user.isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowersFollowingModal;