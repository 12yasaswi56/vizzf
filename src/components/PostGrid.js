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
//               image={`https://back-nipj.onrender.com/${post.image}`} // Ensure full URL
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
import { Grid, Card, CardMedia, Box, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CollectionsIcon from '@mui/icons-material/Collections';

const PostGrid = ({ posts }) => {
  const navigate = useNavigate();

  if (!posts || posts.length === 0) {
    return <p>No posts yet.</p>;
  }

  // Helper function to get all images for a post
  const getPostImages = (post) => {
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

  // Helper function to format image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/200';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `https://back-nipj.onrender.com/${imageUrl}`;
  };

  return (
    <Grid container spacing={2} justifyContent="center">
      {posts.map((post) => {
        const images = getPostImages(post);
        const firstImage = images[0];
        
        return (
          <Grid item key={post._id} xs={12} sm={6} md={4} lg={3}>
            <Card 
              onClick={() => navigate(`/post/${post._id}`)} 
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              {firstImage && (
                <CardMedia
                  component="img"
                  height="200"
                  image={getImageUrl(firstImage)}
                  alt="User Post"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/200';
                  }}
                />
              )}
              
              {/* Show multiple images indicator */}
              {images.length > 1 && (
                <Box style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: '50%',
                  padding: '4px'
                }}>
                  <CollectionsIcon style={{ color: 'white' }} />
                </Box>
              )}
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default PostGrid;
