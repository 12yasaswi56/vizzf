import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Reel from '../components/Reel';

import { IconButton, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import '../pagesCss/Reels.css';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const reelsContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser._id) {
      navigate('/login');
      return;
    }
    setCurrentUser(storedUser);
    fetchReels();
  }, [navigate]);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      const response = await axios.get('http://localhost:5000/api/reels', {
        headers: {
          'x-auth-token': token
        }
      });
      console.log("Reels fetched:", response.data);
      setReels(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching reels:', err);
      setError(err.response?.data?.error || 'Failed to load reels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (reelId, isLiked) => {
    setReels(prevReels =>
      prevReels.map(reel =>
        reel._id === reelId
          ? {
              ...reel,
              likes: isLiked
                ? [...reel.likes, currentUser._id]
                : reel.likes.filter(id => id !== currentUser._id)
            }
          : reel
      )
    );
  };

  const handleComment = (reelId, newComment) => {
    setReels(prevReels =>
      prevReels.map(reel =>
        reel._id === reelId
          ? {
              ...reel,
              comments: [...reel.comments, newComment]
            }
          : reel
      )
    );
  };

  const scrollToReel = (index) => {
    setCurrentReelIndex(index);
    // Add auto-play for the current reel and pause others
    document.querySelectorAll('.reel-video').forEach((video, i) => {
      if (i === index) {
        video.play().catch(e => console.log('Auto-play prevented:', e));
      } else {
        video.pause();
      }
    });
  };

  const handleScroll = (direction) => {
    let newIndex;
    if (direction === 'up') {
      newIndex = Math.max(0, currentReelIndex - 1);
    } else {
      newIndex = Math.min(reels.length - 1, currentReelIndex + 1);
    }
    
    if (newIndex !== currentReelIndex) {
      scrollToReel(newIndex);
    }
  };

  const handleCreateReel = () => {
    navigate('/reels/create');
  };

  useEffect(() => {
    // Auto-play first reel when reels are loaded
    if (reels.length > 0 && !loading) {
      const timer = setTimeout(() => {
        const firstVideo = document.querySelector('.reel-video');
        if (firstVideo) {
          firstVideo.play().catch(e => console.log('Auto-play prevented:', e));
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [reels, loading]);

  if (loading) {
    return <div className="reels-loading">Loading reels...</div>;
  }

  if (error) {
    return <div className="reels-error">{error}</div>;
  }

  if (reels.length === 0) {
    return (
      <div className="reels-empty">
        <Typography variant="h6">No reels available</Typography>
        <button onClick={handleCreateReel}>Create your first reel</button>
      </div>
    );
  }

  return (
    <div className="reels-page">
      <div className="reels-header">
        <Typography variant="h5">Reels</Typography>
        <IconButton onClick={handleCreateReel}>
          <AddCircleOutlineIcon />
        </IconButton>
      </div>

      <div className="reels-navigation top">
        <IconButton
          onClick={() => handleScroll('up')}
          disabled={currentReelIndex === 0}
        >
          <KeyboardArrowUpIcon />
        </IconButton>
      </div>

      <div className="reels-container" ref={reelsContainerRef}>
        {reels.map((reel, index) => (
          <div 
            key={reel._id} 
            className={`reel-wrapper ${index === currentReelIndex ? 'active' : 'inactive'}`}
          >
            <Reel
              reel={reel}
              currentUser={currentUser}
              onLike={handleLike}
              onComment={handleComment}
            />
          </div>
        ))}
      </div>

      <div className="reels-navigation bottom">
        <IconButton
          onClick={() => handleScroll('down')}
          disabled={currentReelIndex === reels.length - 1}
        >
          <KeyboardArrowDownIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default Reels;