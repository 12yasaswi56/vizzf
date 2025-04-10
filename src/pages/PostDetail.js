import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Card,
  CardMedia,
  Button,
  CircularProgress,
  Box,
  Alert,
  IconButton,
  MobileStepper
} from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

const API_BASE_URL = "http://localhost:5000/api";

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!postId || postId.length !== 24) {
          throw new Error('Invalid post ID');
        }

        const response = await axios.get(`${API_BASE_URL}/posts/${postId}`);
        setPost(response.data);
      } catch (err) {
        console.error('Fetch Post Error:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  // Get all images from the post
  const getAllImages = (post) => {
    if (!post) return [];
    
    if (post.media && post.media.length > 0) {
      return post.media.filter(item => item.type === 'image').map(item => item.url);
    }
    
    if (post.images && post.images.length > 0) {
      return post.images;
    }
    
    if (post.image) {
      return [post.image];
    }
    
    return [];
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/path/to/default/image.png';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `http://localhost:5000${imageUrl}`;
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  if (loading) return <CircularProgress />;
  
  if (error) return (
    <Alert severity="error">
      {error}
      <Typography variant="body2">
        Please check the post ID or try again later.
      </Typography>
    </Alert>
  );

  if (!post) return <Typography>No post found</Typography>;

  const images = getAllImages(post);
  const maxSteps = images.length;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Card sx={{ maxWidth: 500 }}>
        {/* Image Carousel */}
        {images.length > 0 && (
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="300"
              image={getImageUrl(images[activeStep])}
              alt={`Post image ${activeStep + 1}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/path/to/default/image.png';
              }}
            />
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <IconButton
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  sx={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)',
                    }
                  }}
                >
                  <KeyboardArrowLeft />
                </IconButton>
                
                <IconButton
                  onClick={handleNext}
                  disabled={activeStep === maxSteps - 1}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)',
                    }
                  }}
                >
                  <KeyboardArrowRight />
                </IconButton>
              </>
            )}
            
            {/* Stepper Dots */}
            {images.length > 1 && (
              <MobileStepper
                steps={maxSteps}
                position="static"
                activeStep={activeStep}
                sx={{
                  justifyContent: 'center',
                  bgcolor: 'transparent',
                  position: 'absolute',
                  bottom: 16,
                  left: 0,
                  right: 0
                }}
                nextButton={null}
                backButton={null}
              />
            )}
          </Box>
        )}
        
        <Typography variant="h6" sx={{ padding: 2 }}>
          {post.caption || 'No caption'}
        </Typography>
        
        <Typography variant="body2" sx={{ padding: 2 }}>
          Likes: {post.likes?.length || 0}
        </Typography>

        <Typography variant="body1" sx={{ padding: 2 }}>Comments:</Typography>
        {post.comments && post.comments.length > 0 ? (
          post.comments.map((comment, index) => (
            <Typography key={index} variant="body2" sx={{ paddingLeft: 2 }}>
              <strong>{comment.user?.username || "Unknown"}:</strong> {comment.content || "No text"}
            </Typography>
          ))
        ) : (
          <Typography variant="body2" sx={{ paddingLeft: 2 }}>No comments yet</Typography>
        )}

        <Button variant="contained" sx={{ margin: 2 }}>Like</Button>
      </Card>
    </Box>
  );
};

export default PostDetail;