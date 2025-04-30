import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Avatar, Skeleton, Typography } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const API_BASE_URL = "https://back-nipj.onrender.comapi";

const StoriesRow = ({ userId, currentUserId, isFeed = false, onAddStory, onViewStory }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        
        // If we're on the feed page, get combined stories from current user + following
        if (isFeed) {
          const response = await axios.get(`${API_BASE_URL}/stories/feed`, {
            headers: {
              'x-auth-token': localStorage.getItem('auth-token')
            }
          });
          setStories(response.data);
        }
        // If we're on a user profile page, get only that user's stories
        else if (userId) {
          const response = await axios.get(`${API_BASE_URL}/stories/${userId}`);
          setStories(response.data);
        }
        
        setError(null);
      } catch (error) {
        console.error("Error fetching stories:", error);
        setError("Failed to load stories");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStories();
  }, [userId, isFeed]);

  if (loading) {
    return (
      <Box display="flex" gap={2} overflow="auto" padding={2}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="circular" width={60} height={60} />
        ))}
      </Box>
    );
  }

  if (error) {
    return <Typography color="error" variant="body2">{error}</Typography>;
  }

  // This function correctly groups stories by user
const userStories = {};
stories.forEach(story => {
  if (story.user && story.user._id) {
    const userId = story.user._id.toString();
    if (!userStories[userId]) {
      userStories[userId] = [];
    }
    userStories[userId].push(story);
  }
});

  const handleStoryClick = (userId) => {
    // Find all stories from this user
    const userStoryList = userStories[userId];
    if (userStoryList && userStoryList.length > 0 && onViewStory) {
      onViewStory(userStoryList);
    }
  };

  return (
    <Box display="flex" gap={2} overflow="auto" padding={2}>
      {/* Show "Add Story" button only for the current logged-in user */}
      {currentUserId && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          onClick={onAddStory}
          sx={{ cursor: 'pointer' }}
        >
          <Box position="relative">
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: '#f0f0f0'
              }}
            >
              <AddCircleIcon color="primary" />
            </Avatar>
          </Box>
          <Typography variant="caption" mt={1}>Add Story</Typography>
        </Box>
      )}
      
      {/* Show stories grouped by user */}
      {Object.entries(userStories).map(([userId, userStoryList]) => {
        const story = userStoryList[0]; // Get first story from this user
        if (!story.user) return null;
        
        return (
          <Box
            key={userId}
            display="flex"
            flexDirection="column"
            alignItems="center"
            onClick={() => handleStoryClick(userId)}
          >
            <Avatar
              src={story.user.profilePic || "/default-avatar.png"}
              alt={story.user.username || "User"}
              sx={{
                width: 60,
                height: 60,
                border: `2px solid ${userStoryList.some(s => !s.viewers?.includes(currentUserId)) ? "#ff5722" : "#e0e0e0"}`,
                cursor: 'pointer'
              }}
            />
            <Typography variant="caption" mt={1}>{story.user.username}</Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default StoriesRow;