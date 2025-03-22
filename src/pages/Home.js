import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../pagesCss/Home.css";
import { Avatar, Button } from "@mui/material"; // Import Button here
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SendIcon from "@mui/icons-material/Send";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChatIcon from "@mui/icons-material/Chat";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import ExploreIcon from "@mui/icons-material/Explore";
import StoryViewer from "../components/StoryViewer";
import StoryUpload from "../components/StoryUpload";

import socket from '../services/socket';
// Define API base URL
const API_BASE_URL = "https://social-backend-1-qi8q.onrender.com/api";

const Home = () => {
    // ... (your existing state)
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [stories, setStories] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [showUpload, setShowUpload] = useState(false);
    const [showStoryUpload, setShowStoryUpload] = useState(false);
    const [activeStory, setActiveStory] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [viewingStories, setViewingStories] = useState(null);
    const [showStoryViewer, setShowStoryViewer] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    
    // State for new post
    const [newPost, setNewPost] = useState({
        caption: "",
        imageType: "url",
    });

    // Fetch user details from localStorage when component mounts
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser._id) {
            console.error("User ID not found in localStorage. Please log in again.");
            alert("User session expired. Please log in again.");
            return;
        }
        console.log("Current user profile pic:", storedUser.profilePic);
        setCurrentUser(storedUser);
        setNewPost((prev) => ({ ...prev, userId: storedUser._id }));
    }, []);

    // Fetch posts and stories when component mounts
    useEffect(() => {
        fetchPosts();
        fetchStories();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/posts`);
            const updatedPosts = response.data.map(post => ({
                ...post,
                // Fix the image URL - make sure it's fully qualified
                image: post.image ?
                    (post.image.startsWith('http') ? post.image : `https://social-backend-1-qi8q.onrender.com${post.image}`)
                    : null,
            }));
            setPosts(updatedPosts);
            setError(null);
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError("Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    const fetchStories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/stories`);
            // Group stories by user
            const groupedStories = {};
            response.data.forEach(story => {
                const userId = story.user?._id;
                if (!userId) return;

                if (!groupedStories[userId]) {
                    groupedStories[userId] = [];
                }
                groupedStories[userId].push(story);
            });

            // Convert to array format
            const storyArray = Object.values(groupedStories);
            setStories(storyArray);
        } catch (err) {
            console.error("Error fetching stories:", err);
        }
    };

    const handleUpload = async () => {
        try {
            setLoading(true);
            setError(null);

            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (!storedUser || !storedUser._id) {
                alert("User session expired. Please log in again.");
                return;
            }

            const formData = new FormData();
            formData.append("caption", newPost.caption);
            formData.append("userId", storedUser._id);

            if (newPost.imageType === "file" && imageFile) {
                formData.append("file", imageFile);
            } else if (newPost.imageType === "url" && imageUrl) {
                formData.append("image", imageUrl);
            } else {
                throw new Error("Please provide either an image file or URL.");
            }

            const response = await axios.post(`${API_BASE_URL}/posts/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("Upload Response:", response.data);

            setShowUpload(false);
            setNewPost({ caption: "", userId: storedUser._id, imageType: "url" });
            setImageFile(null);
            setImageUrl("");

            await fetchPosts();
        } catch (err) {
            console.error("Upload failed", err);
            setError(err.response?.data?.error || err.message);
            alert("Upload failed: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleViewStory = (userStories, index = 0) => {
        console.log("Opening stories:", userStories);
        setViewingStories(userStories);
        setActiveStory(userStories[index]);
        setShowStoryViewer(true);
    };

    const handleCloseStoryViewer = () => {
        setViewingStories(null);
        setActiveStory(null);
        setShowStoryViewer(false);
    };

    const handleAddStory = () => {
        setShowStoryUpload(true);
    };

    const handleStoryUploaded = (newStory) => {
        fetchStories(); // Refresh stories after upload
        setShowStoryUpload(false);
    };

    const handleImageTypeChange = (type) => {
        setNewPost({ ...newPost, imageType: type });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };
 // Fix the handleSearch function
const handleSearch = async () => {
  try {
      if (!searchQuery.trim()) return;
      
      const token = localStorage.getItem('auth-token');
      const response = await axios.get(
          `${API_BASE_URL}/profile/search/${searchQuery}`, 
          {
              headers: { 'x-auth-token': token },
              params: { userId: currentUser?._id } // Send userId as a query parameter as backup
          }
      );
      setSearchResults(response.data);
      setShowSearchResults(true);
  } catch (err) {
      console.error("Search failed", err);
      alert("Search failed: " + (err.response?.data?.error || err.message));
  }
};

// Fix the handleFollow function
const handleFollow = async (userIdToFollow) => {
    try {
        console.log("Current User:", currentUser?._id, "Trying to Follow:", userIdToFollow); // Debug log
  
        const token = localStorage.getItem('auth-token');
        await axios.post(
            `${API_BASE_URL}/profile/${userIdToFollow}/follow`, 
            {}, 
            {
                headers: { 'x-auth-token': token }
            }
        );
        // Update search results to reflect the follow
        setSearchResults(prevResults =>
            prevResults.map(user =>
                user._id === userIdToFollow ? { ...user, isFollowing: true } : user
            )
        );
    } catch (err) {
        console.error("Follow failed", err);
        alert("Follow failed: " + (err.response?.data?.error || err.message));
    }
  };
  

// Fix the handleUnfollow function
const handleUnfollow = async (userIdToUnfollow) => {
  try {
      const token = localStorage.getItem('auth-token');
      await axios.post(
          `${API_BASE_URL}/profile/${userIdToUnfollow}/unfollow`, 
          {}, 
          {
              headers: { 'x-auth-token': token }
          }
      );
      // Update search results to reflect the unfollow
      setSearchResults(prevResults =>
          prevResults.map(user =>
              user._id === userIdToUnfollow ? { ...user, isFollowing: false } : user
          )
      );
  } catch (err) {
      console.error("Unfollow failed", err);
      alert("Unfollow failed: " + (err.response?.data?.error || err.message));
  }
};

// Socket connection
useEffect(() => {
  socket.connect();

  return () => {
      socket.disconnect();
  };
}, []);

// Join post rooms when posts are loaded
useEffect(() => {
  if (posts.length > 0) {
      posts.forEach(post => {
          socket.emit('joinPost', post._id);
          socket.emit('joinUser', currentUser?._id);
      });
  }

  // Listen for real-time updates
  socket.on('postLikeUpdate', handlePostLikeUpdate);
  socket.on('newComment', handleNewComment);
  socket.on('postShared', handlePostShare);
  socket.on('newStory', handleNewStory);
  socket.on('userPostShared', handleUserPostShared);
  socket.on('newSharedPost', handleNewSharedPost);

  return () => {
      // Clean up listeners when component unmounts
      socket.off('postLikeUpdate', handlePostLikeUpdate);
      socket.off('newComment', handleNewComment);
      socket.off('postShared', handlePostShare);
      socket.off('newStory', handleNewStory);
      socket.off('userPostShared', handleUserPostShared);
      socket.off('newSharedPost', handleNewSharedPost);

      // Leave all post rooms
      if (posts.length > 0) {
          posts.forEach(post => {
              socket.emit('leavePost', post._id);
              socket.emit('leaveUser', currentUser?._id);
          });
      }
  };
}, [posts]);

// Handle user post share updates
const handleUserPostShared = (data) => {
  fetchPosts();
};

const handleNewSharedPost = (data) => {
  fetchPosts();
};

// Handle post like updates
const handlePostLikeUpdate = (data) => {
  setPosts(prevPosts =>
      prevPosts.map(post =>
          post._id === data.postId ? { ...post, likes: data.likes } : post
      )
  );
};

// Handle new comments
const handleNewComment = (data) => {
  setPosts(prevPosts =>
      prevPosts.map(post => {
          if (post._id === data.postId) {
              // Create a new post object with the updated comments
              const updatedPost = { ...post };
              updatedPost.comments = updatedPost.comments || [];
              updatedPost.comments.push(data.comment);
              return updatedPost;
          }
          return post;
      })
  );
};

// Handle post shares
const handlePostShare = (data) => {
  // You can show a notification or update UI when a post is shared
  console.log(`Post ${data.postId} was shared by ${data.shareInfo.user.username}`);
};

// Handle new story
const handleNewStory = (story) => {
  fetchStories(); // Refresh all stories to ensure grouping
};

// Add functions to handle likes, comments, and shares
// Fix the handleLike function
const handleLike = async (postId) => {
    try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser._id) {
            alert("User session expired. Please log in again.");
            return;
        }
  
        await axios.post(`${API_BASE_URL}/posts/${postId}/like`, {
            userId: currentUser._id
        });
  
        // No need to update state here as it will happen via socket
    } catch (err) {
        console.error("Like action failed", err);
    }
  };
  const [commentText, setCommentText] = useState('');
  // Fix the handleComment function
  const handleComment = async (postId) => {
    try {
        if (!currentUser || !currentUser._id) {
            alert("User session expired. Please log in again.");
            return;
        }
  
        if (!commentText.trim()) return;
  
        await axios.post(`${API_BASE_URL}/posts/${postId}/comment`, {
            userId: currentUser._id,
            content: commentText
        });
  
        // Clear comment input
        setCommentText('');
  
        // No need to update state here as it will happen via socket
    } catch (err) {
        console.error("Comment action failed", err);
    }
  };
  
  // Fix the handleShare function
  const handleShare = async (postId) => {
    try {
        if (!currentUser || !currentUser._id) {
            alert("User session expired. Please log in again.");
            return;
        }
  
        await axios.post(`${API_BASE_URL}/posts/${postId}/share`, {
            userId: currentUser._id,
            shareType: 'internal' // or whatever type you want
        });
  
        alert("Post shared successfully!");
    } catch (err) {
        console.error("Share action failed", err);
    }
  };
  const getProfilePicUrl = (profilePic) => {
    if (!profilePic) return "/default-avatar.png";
    if (profilePic.startsWith('http')) return profilePic;
    return `https://social-backend-1-qi8q.onrender.com${profilePic}`;
};
return (
  <div className="home-container">
      {/* Top Navbar */}
      <div className="top-navbar">
          <h2 className="logo">Vizz</h2>
          
      </div>

      {/* Main Content */}
      <div className="main-content">
          {/* Left Sidebar */}
          <div className="sidebar">
              <div className="sidebar-header">
                  <Avatar
                    src={getProfilePicUrl(currentUser?.profilePic)}
                    className="user-avatar"
                    onClick={() => navigate(`/profile/${currentUser?._id}`)}
                  />
                  <h3 className="username">{currentUser?.username || "User"}</h3>
              </div>

              <div className="sidebar-menu">
                  <div className="menu-item active">
                      <HomeIcon />
                      <span>Home</span>
                  </div>
                  <div className="menu-item search-item">
                      <SearchIcon />
                      <input
                          type="text"
                          placeholder="Search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                  </div>
              </div>
              {/* Search Results Modal */}
              {showSearchResults && (
                  <div className="modal-overlay">
                      <div className="search-results-modal">
                          <h3>Search Results</h3>
                          {searchResults.map((user) => (
                              <div key={user._id} className="search-result-item">
                                  <Avatar src={`https://social-backend-1-qi8q.onrender.com${user.profilePic}`} />
                                  <p>{user.username}</p>
                                  {currentUser && currentUser._id !== user._id && (
                                      <Button
                                          variant={user.isFollowing ? "outlined" : "contained"}
                                          color="primary"
                                          onClick={() => user.isFollowing ? handleUnfollow(user._id) : handleFollow(user._id)}
                                      >
                                          {user.isFollowing ? 'Unfollow' : 'Follow'}
                                      </Button>
                                  )}
                              </div>
                          ))}
                          <button onClick={() => setShowSearchResults(false)}>Close</button>
                      </div>
                  </div>
              )}
              <div className="menu-item">
                  <ExploreIcon />
                  <span>Explore</span>
              </div>
              <div className="menu-item" onClick={() => navigate("/chat")}>
                  <ChatIcon />
                  <span>Messages</span>
              </div>
              <div className="menu-item" onClick={() => setShowUpload(true)}>
                  <AddCircleOutlineIcon />
                  <span>Create</span>
              </div>
              <div className="menu-item" onClick={() => navigate("/notifications")}>
    <NotificationsIcon />
    <span>Notifications</span>
</div>

          </div>

          {/* Main Feed */}
          <div className="feed-container">
              {/* Stories Section */}
              <div className="stories-container">
                  {/* Add Story Button */}
                  <div className="story-item add-story" onClick={() => setShowStoryUpload(true)}>
                      <div className="story-avatar-container">
                      <Avatar
                        src={getProfilePicUrl(currentUser?.profilePic)}
                        className="story-avatar"
                    />
                          <div className="add-story-icon">+</div>
                      </div>
                      <p>Add Story</p></div>

{/* Story Items */}
{stories.map((userStories, index) => {
    // Only display if there are stories and user info
    if (!userStories || !userStories.length || !userStories[0].user) return null;

    const story = userStories[0]; // Use first story to get user info
    return (
        <div
            key={index}
            className="story-item"
            onClick={() => handleViewStory(userStories)}
        >
            <div className="story-avatar-container has-story">
                <Avatar
                    src={story.user?.profilePic ? `https://social-backend-1-qi8q.onrender.com${story.user.profilePic}` : "/default-avatar.png"}
                    className="story-avatar"
                />
            </div>
            <p>{story.user?.username || "User"}</p>
        </div>
    );
})}
</div>

{/* Posts Feed */}
<div className="posts-container">
{loading && <p className="loading">Loading posts...</p>}
{!loading && posts.length === 0 && <p className="no-posts">No posts yet. Be the first to share!</p>}

{posts.map((post) => (
    <div key={post._id} className="post">
        <div className="post-header">
            <Avatar
                src={post.user?.profilePic ? `https://social-backend-1-qi8q.onrender.com${post.user.profilePic}` : "/default-avatar.png"}
            />
            <p>{post.user?.username || "Anonymous"}</p>
        </div>

        {/* Display title and description if it's a PDF file */}
        {post.fileType === 'pdf' && post.title && (
            <div className="post-paper-info">
                <h3 className="post-title">{post.title}</h3>
                {post.description && <p className="post-description">{post.description}</p>}
            </div>
        )}

        {/* Display caption if present */}
        {post.caption && (
            <p className="post-caption">{post.caption}</p>
        )}

        {/* Display based on fileType */}
        {post.fileType === 'pdf' ? (
            <div className="pdf-container">
                <div className="pdf-preview">
                    <img src="/pdf-icon.png" alt="PDF Document" className="pdf-icon" />
                    <span className="pdf-filename">{post.title || "Research Paper"}</span>
                </div>
                <a 
                    href={`${post.image}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="pdf-download-btn"
                >
                    View PDF
                </a>
            </div>
        ) : (
            post.image ? (
                <img
                    src={post.image}
                    alt="Post"
                    className="post-image"
                    onError={(e) => {
                        console.error(`Failed to load image: ${post.image}`);
                        e.target.style.display = "none";
                    }}
                />
            ) : (
                <p>No Image Available</p>
            )
        )}

        <div className="post-stats">
            <span>{post.likes?.length || 0} likes</span>
            <span>{post.comments?.length || 0} comments</span>
        </div>

        <div className="post-actions">
            <button
                className={`action-button ${post.likes?.includes(currentUser?._id) ? 'liked' : ''}`}
                onClick={() => handleLike(post._id)}
            >
                <FavoriteBorderIcon className="action-icon" />
                Like
            </button>

            <button className="action-button">
                <ChatBubbleOutlineIcon className="action-icon" />
                Comment
            </button>

            <button className="action-button" onClick={() => handleShare(post._id)}>
                <SendIcon className="action-icon" />
                Share
            </button>
        </div>

        {/* Comment input */}
        <div className="comment-input">
            <Avatar
                src={currentUser?.profilePic ? `https://social-backend-1-qi8q.onrender.com${currentUser.profilePic}` : "/default-avatar.png"}
                className="comment-avatar"
            />
            <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
            />
            <button onClick={() => handleComment(post._id)}>Post</button>
        </div>

        {/* Comments section */}
        <div className="comments-section">
            {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment, index) => (
                    <div key={index} className="comment">
                        <Avatar
                            src={comment.user?.profilePic ? `https://social-backend-1-qi8q.onrender.com${comment.user.profilePic}` : "/default-avatar.png"}
                            className="comment-avatar"
                        />
                        <div className="comment-content">
                            <p className="comment-username">{comment.user?.username || "Anonymous"}</p>
                            <p className="comment-text">{comment.content}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="no-comments">No comments yet. Be the first to comment!</p>
            )}
        </div>
    </div>
))}
</div>
</div>
</div>

{/* Post Upload Modal */}
{showUpload && (
<div className="modal-overlay">
<div className="upload-modal">
<h3>Create Post</h3>
<textarea
    placeholder="Caption"
    value={newPost.caption}
    onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
    rows="3"
    className="upload-caption"
/>
<div className="image-type-selector">
    <button
        className={newPost.imageType === "url" ? "active" : ""}
        onClick={() => handleImageTypeChange("url")}
    >
        Image URL
    </button>
    <button
        className={newPost.imageType === "file" ? "active" : ""}
        onClick={() => handleImageTypeChange("file")}
    >
        Upload File
    </button>
</div>
{newPost.imageType === "url" ? (
    <input
        type="text"
        placeholder="Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="image-url-input"
    />
) : (
    <div className="file-input-container">
        <label htmlFor="file-upload" className="file-upload-label">
            Choose File
        </label>
        <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
        />
        <span className="file-name">
            {imageFile ? imageFile.name : "No file chosen"}
        </span>
    </div>
)}
{error && <p className="error-message">{error}</p>}
<div className="button-group">
    <button onClick={handleUpload} disabled={loading} className="upload-button">
        {loading ? "Uploading..." : "Share"}
    </button>
    <button onClick={() => setShowUpload(false)} className="cancel-button">
        Cancel
    </button>
</div>
</div>
</div>
)}

{/* Story Upload Modal */}
{showStoryUpload && (
<StoryUpload
onClose={() => setShowStoryUpload(false)}
onSuccess={handleStoryUploaded}
currentUser={currentUser}
/>
)}

{/* Story Viewer */}
{showStoryViewer && viewingStories && activeStory && (
<StoryViewer
story={activeStory}
stories={viewingStories}
onClose={handleCloseStoryViewer}
setActiveStory={setActiveStory}
/>
)}
</div>
);
};

export default Home;
