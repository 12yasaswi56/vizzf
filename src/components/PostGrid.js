// import React from 'react';
// import { Grid, Card, CardMedia } from '@mui/material';
// import { useNavigate } from 'react-router-dom';

// const PostGrid = ({ posts }) => {
//   const navigate = useNavigate();

//   if (!posts || posts.length === 0) {
//     return <p>No posts yet.</p>;
//   }

//   return (
//     <Grid container spacing={2} justifyContent="center">
//       {posts.map((post) => (
//         <Grid item key={post._id} xs={12} sm={6} md={4} lg={3}>
//           <Card 
//             onClick={() => navigate(`/post/${post._id}`)} 
//             style={{ cursor: 'pointer' }} // Makes it clickable
//           >
//             <CardMedia
//               component="img"
//               height="200"
//               image={`http://localhost:5000${post.image}`} // Ensure full URL
//               alt="User Post"
//             />
//           </Card>
//         </Grid>
//       ))}
//     </Grid>
//   );
// };

// export default PostGrid;


import React from 'react';
import { Grid, Card, CardMedia } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PostGrid = ({ posts }) => {
  const navigate = useNavigate();

  if (!posts || posts.length === 0) {
    return <p>No posts yet.</p>;
  }

  // Helper function to determine if URL is already a full URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      // Return a placeholder image if no image is available
      return 'https://via.placeholder.com/200';
    }
    
    // Check if the URL is already a full URL (like Cloudinary URLs)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Fall back to local URL if needed
    return `http://localhost:5000${imageUrl}`;
  };

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
              image={getImageUrl(post.image)}
              alt="User Post"
            />
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default PostGrid;
