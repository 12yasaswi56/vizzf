import React from 'react';
import { Grid, Card, CardMedia } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PostGrid = ({ posts }) => {
  const navigate = useNavigate();

  if (!posts || posts.length === 0) {
    return <p>No posts yet.</p>;
  }

  return (
    <Grid container spacing={2} justifyContent="center">
      {posts.map((post) => (
        <Grid item key={post._id} xs={12} sm={6} md={4} lg={3}>
          <Card 
            onClick={() => navigate(`/post/${post._id}`)} 
            style={{ cursor: 'pointer' }} // Makes it clickable
          >
            <CardMedia
              component="img"
              height="200"
              image={`http://localhost:5000${post.image}`} // Ensure full URL
              alt="User Post"
            />
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default PostGrid;
