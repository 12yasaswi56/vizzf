import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import axios from 'axios';
import '../pagesCss/StoryViewer.css';

const StoryViewer = ({ story, onClose, stories, setActiveStory }) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressInterval = useRef(null);
  const storyDuration = 5000; // 5 seconds per story
  const progressStep = 100 / (storyDuration / 100); // Progress increment per 100ms

  // Current story index in the stories array
  const currentStoryIndex = stories.findIndex(s => s._id === story._id);
  
  // Mark story as viewed when opened
  useEffect(() => {
    const markAsViewed = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (token) {
          await axios.post(`https://social-backend-1-qi8q.onrender.com/api/stories/${story._id}/view`, {}, {
            headers: { 'x-auth-token': token }
          });
        }
      } catch (error) {
        console.error('Error marking story as viewed:', error);
      }
    };
    
    markAsViewed();
  }, [story._id]);
  
  useEffect(() => {
    // Reset progress when story changes
    setProgress(0);
    
    // Clear any existing interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    // Start progress timer
    progressInterval.current = setInterval(() => {
      if (!isPaused) {
        setProgress(prevProgress => {
          const newProgress = prevProgress + progressStep;
          
          // If story completed
          if (newProgress >= 100) {
            clearInterval(progressInterval.current);
            
            // Move to next story if available
            if (currentStoryIndex < stories.length - 1) {
              setActiveStory(stories[currentStoryIndex + 1]);
            } else {
              // Close story viewer if it was the last story
              onClose();
            }
            return 0;
          }
          
          return newProgress;
        });
      }
    }, 100);
    
    // Cleanup on unmount
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [story, isPaused, stories, currentStoryIndex, setActiveStory, onClose]);
  
  const handlePause = () => {
    setIsPaused(true);
  };
  
  const handleResume = () => {
    setIsPaused(false);
  };
  
  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setActiveStory(stories[currentStoryIndex - 1]);
    }
  };
  
  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setActiveStory(stories[currentStoryIndex + 1]);
    } else {
      onClose();
    }
  };
  
  // Get the full URL for the story media
  const getFullMediaUrl = (path) => {
    // If the path is already a full URL, return it
    if (path.startsWith('http')) {
      return path;
    }
    
    // Otherwise, construct the full URL
    return `https://social-backend-1-qi8q.onrender.com${path}`;
  };
  
  return (
    <div className="story-viewer">
      <div className="story-header">
        <div className="progress-container">
          {stories.map((s, index) => (
            <div 
              key={s._id} 
              className="progress-bar-container"
            >
              <div 
                className="progress-bar" 
                style={{ 
                  width: index === currentStoryIndex ? `${progress}%` : 
                         index < currentStoryIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>
        
        <div className="story-user-info">
          <Avatar src={story.user?.profilePic || "/default-avatar.png"} alt={story.user?.username || "User"} />
          <span className="username">{story.user?.username || "User"}</span>
          <span className="timestamp">{new Date(story.createdAt).toLocaleString()}</span>
        </div>
        
        <div className="close-button" onClick={onClose}>
          <CloseIcon />
        </div>
      </div>
      
      <div 
        className="story-content" 
        onMouseDown={handlePause}
        onMouseUp={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
      >
        <img src={getFullMediaUrl(story.media)} alt="Story" className="story-image" />
        {story.caption && <div className="story-caption">{story.caption}</div>}
        
        {currentStoryIndex > 0 && (
          <div className="nav-button prev" onClick={handlePrevStory}>
            <ArrowBackIosIcon />
          </div>
        )}
        
        {currentStoryIndex < stories.length - 1 && (
          <div className="nav-button next" onClick={handleNextStory}>
            <ArrowForwardIosIcon />
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;