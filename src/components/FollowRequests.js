import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Button, 
  Divider,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = "https://back-nipj.onrender.com/api";

const FollowRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        const response = await axios.get(`${API_BASE_URL}/profile/follow-requests`, {
          headers: { 'x-auth-token': token }
        });
        setRequests(response.data);
      } catch (err) {
        console.error("Error fetching follow requests:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, []);

  const handleAccept = async (userId) => {
    try {
      const token = localStorage.getItem('auth-token');
      await axios.post(`${API_BASE_URL}/profile/${userId}/accept-follow`, {}, {
        headers: { 'x-auth-token': token }
      });
      setRequests(requests.filter(req => req._id !== userId));
    } catch (err) {
      console.error("Error accepting follow request:", err);
    }
  };

  const handleDecline = async (userId) => {
    try {
      const token = localStorage.getItem('auth-token');
      await axios.post(`${API_BASE_URL}/profile/${userId}/decline-follow`, {}, {
        headers: { 'x-auth-token': token }
      });
      setRequests(requests.filter(req => req._id !== userId));
    } catch (err) {
      console.error("Error declining follow request:", err);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6">Follow Requests</Typography>
      <List>
        {requests.length === 0 ? (
          <Typography variant="body2">No pending requests</Typography>
        ) : (
          requests.map(request => (
            <React.Fragment key={request._id}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar src={request.profilePic} />
                </ListItemAvatar>
                <ListItemText primary={request.username} />
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={() => handleAccept(request._id)}
                  sx={{ mr: 1 }}
                >
                  Accept
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => handleDecline(request._id)}
                >
                  Decline
                </Button>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>
    </Box>
  );
};

export default FollowRequests;