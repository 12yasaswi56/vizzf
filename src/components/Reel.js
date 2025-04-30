import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, IconButton, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import axios from 'axios';

const Reel = ({ reel, currentUser, onLike, onComment }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(reel.comments || []);
  const [likes, setLikes] = useState(reel.likes?.length || 0);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLiked(reel.likes?.includes(currentUser?._id) || false);
    setLikes(reel.likes?.length || 0);
    setComments(reel.comments || []);
  }, [reel, currentUser]);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (isLiked) {
        await axios.post(`https://back-nipj.onrender.comapi/reels/${reel._id}/unlike`, null, {
          headers: {
            'x-auth-token': token
          }
        });
        setLikes(likes - 1);
      } else {
        await axios.post(`https://back-nipj.onrender.comapi/reels/${reel._id}/like`, null, {
          headers: {
            'x-auth-token': token
          }
        });
        setLikes(likes + 1);
      }
      setIsLiked(!isLiked);
      if (onLike) onLike(reel._id, !isLiked);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
  
    try {
      const token = localStorage.getItem('auth-token');
      const response = await axios.post(
        `https://back-nipj.onrender.comapi/reels/${reel._id}/comment`,
        { text: commentText },
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
  
      setComments([...comments, response.data]);
      setCommentText('');
      if (onComment) onComment(reel._id, response.data);
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const navigateToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="reel-container">
      <div className="reel-video-container">
        <video
          ref={videoRef}
          src={reel.videoUrl}
          loop
          muted={isMuted}
          onClick={togglePlay}
          className="reel-video"
          poster={reel.thumbnailUrl}
        />
        
        <div className="reel-controls">
          <IconButton onClick={toggleMute} className="reel-mute-button">
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
        </div>
      </div>
      
      <div className="reel-sidebar">
        <div className="reel-user-info">
          <Avatar
            src={reel.user?.profilePic || '/default-avatar.png'}
            onClick={() => navigateToProfile(reel.user?._id)}
            className="reel-avatar"
          />
          <Typography variant="subtitle2" className="reel-username">
            {reel.user?.username}
          </Typography>
        </div>
        
        <div className="reel-actions">
          <div className="reel-action">
            <IconButton onClick={handleLike}>
              {isLiked ? (
                <FavoriteIcon style={{ color: 'red' }} />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
            <Typography variant="caption">{likes}</Typography>
          </div>
          
          <div className="reel-action">
            <IconButton onClick={() => setShowComments(!showComments)}>
              <ChatBubbleOutlineIcon />
            </IconButton>
            <Typography variant="caption">{comments.length}</Typography>
          </div>
          
          <div className="reel-action">
            <IconButton>
              <SendIcon />
            </IconButton>
          </div>
          
          <div className="reel-action">
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          </div>
        </div>
        
        {reel.music?.title && (
          <div className="reel-music">
            <MusicNoteIcon />
            <Typography variant="caption">{reel.music.title}</Typography>
          </div>
        )}
        
        <div className="reel-caption">
          <Typography variant="body2">{reel.caption}</Typography>
        </div>
      </div>
      
      {showComments && (
        <div className="reel-comments-section">
          <div className="reel-comments-list">
            {comments.map((comment, index) => (
              <div key={index} className="reel-comment">
                <Avatar
                  src={comment.user?.profilePic || '/default-avatar.png'}
                  onClick={() => navigateToProfile(comment.user?._id)}
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <Typography variant="subtitle2" className="comment-username">
                    {comment.user?.username}
                  </Typography>
                  <Typography variant="body2">{comment.text}</Typography>
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleCommentSubmit} className="reel-comment-form">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit">Post</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Reel;