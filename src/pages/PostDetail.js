import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Typography, Card, CardMedia, Button, CircularProgress, Box, Alert } from '@mui/material';

const API_BASE_URL = "http://localhost:5000/api";

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Validate postId format
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

  if (loading) return <CircularProgress />;
  
  if (error) return (
    <Alert severity="error">
      {error}
      <Typography variant="body2">
        Please check the post ID or try again later.
      </Typography>
    </Alert>
  );

  // Handle case where post might be null even after loading
  if (!post) return <Typography>No post found</Typography>;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Card sx={{ maxWidth: 500 }}>
        {/* Add checks for image existence */}
        {post.image && (
          <CardMedia 
            component="img" 
            height="300" 
            image={`http://localhost:5000${post.image}`} 
            alt="Post" 
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = '/path/to/default/image.png';
            }}
          />
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