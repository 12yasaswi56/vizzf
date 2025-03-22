import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Typography, Card, CardMedia, Button, CircularProgress, Box } from '@mui/material';

const API_BASE_URL = "https://social-backend-1-qi8q.onrender.com/api";

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/posts/${postId}`);
        setPost(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Card sx={{ maxWidth: 500 }}>
        <CardMedia component="img" height="300" image={`https://social-backend-1-qi8q.onrender.com${post.image}`} alt="Post" />
        <Typography variant="h6" sx={{ padding: 2 }}>{post.caption}</Typography>
        <Typography variant="body2" sx={{ padding: 2 }}>Likes: {post.likes.length}</Typography>

{/* Show Comments */}
<Typography variant="body1" sx={{ padding: 2 }}>Comments:</Typography>
{post.comments.length > 0 ? (
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
