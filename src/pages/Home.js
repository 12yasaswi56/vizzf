import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../pagesCss/Home.css";
import { Avatar, Button,Drawer, IconButton,
  
  
  
    } from "@mui/material";
    import CloseIcon from "@mui/icons-material/Close"; // Import Button here
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
import MenuIcon from "@mui/icons-material/Menu";
// Add these imports
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteIcon from "@mui/icons-material/Delete";

// const navigate = useNavigate();
import socket from '../services/socket';

import MoreVertIcon from "@mui/icons-material/MoreVert";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

// For MUI components
import { Typography } from '@mui/material';

// For routing
import { Link } from 'react-router-dom';

import ListItemIcon from '@mui/material/ListItemIcon';
import Logout from '@mui/icons-material/Logout';
import Settings from '@mui/icons-material/Settings';
import AccountCircle from '@mui/icons-material/AccountCircle';

import SlideshowIcon from "@mui/icons-material/Slideshow";


// Define API base URL
const API_BASE_URL = "https://back-nipj.onrender.com/api";

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
    const [showShareModal, setShowShareModal] = useState(false);
const [followers, setFollowers] = useState([]);
const [selectedUsers, setSelectedUsers] = useState([]);
const [currentPostToShare, setCurrentPostToShare] = useState(null);

const [taggedUsers, setTaggedUsers] = useState([]);

  const [selectedTaggedUsers, setSelectedTaggedUsers] = useState([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [currentPostToTag, setCurrentPostToTag] = useState(null);

  // 2. Add state for managing post menu
const [menuAnchorEl, setMenuAnchorEl] = useState(null);
const [selectedPostForMenu, setSelectedPostForMenu] = useState(null);
const [savedPosts, setSavedPosts] = useState([]);
const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
const isProfileMenuOpen = Boolean(profileMenuAnchor);


const [showViewersModal, setShowViewersModal] = useState(false);
const [currentStoryViewers, setCurrentStoryViewers] = useState([]);
const [currentStoryViewerCount, setCurrentStoryViewerCount] = useState(0);

// In your Home.js component, add this state and effect
const [profileStats, setProfileStats] = useState({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0
  });
    // State for new post
  // In your state declarations
const [newPost, setNewPost] = useState({
    caption: "",
    imageType: "file", // Default to file upload
    files: [], // Array to hold multiple files
    currentFileIndex: 0, // For tracking which file is being displayed
    location: null // Add location state
});
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    // Fetch user details from localStorage when component mounts
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser._id) {
            console.error("User ID not found in localStorage. Please log in again.");
            alert("User session expired. Please log in again.");
            return;
        }
 // Log all properties of the stored user
 Object.keys(storedUser).forEach(key => {
    console.log(`User ${key}:`, storedUser[key]);
});
        setCurrentUser(storedUser);
        setNewPost((prev) => ({ ...prev, userId: storedUser._id }));
    }, []);

    // Fetch posts and stories when component mounts
    useEffect(() => {
        fetchPosts();
        fetchStories();
        fetchSavedPosts();
    }, []);
// Add this useEffect to fetch profile stats
useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !storedUser?._id) return;
  
        const response = await axios.get(`${API_BASE_URL}/profile/${storedUser._id}`, {
          headers: { 'x-auth-token': token }
        });
        
        setProfileStats({
          postsCount: response.data.postsCount || 0,
          followersCount: response.data.followersCount || 0,
          followingCount: response.data.followingCount || 0
        });
      } catch (error) {
        console.error("Error fetching profile stats:", error);
      }
    };
  
    if (currentUser?._id) {
      fetchProfileStats();
    }
  }, [currentUser]);
 const fetchPosts = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`${API_BASE_URL}/posts`);
            
    const updatedPosts = response.data.map(post => ({
      ...post,
      // Don't modify Cloudinary URLs - use them directly
      image: post.image || null,
      location: post.location || null,
      taggedUsers: post.taggedUsers.map(user => ({
        _id: user._id,
        username: user.username,
        profilePic: user.profilePic || "/default-avatar.png"
      }))
    }));
         
    setPosts(updatedPosts);
    setError(null);
  } catch (err) {
    console.error("Error fetching posts:", err);
    console.error("Detailed Posts Fetch Error:", err.response?.data || err.message);
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

            // Ensure media URL is properly formatted
            // if (story.media) {
            //     // No transformation needed - story.media should already be the full Cloudinary URL
            //     // But you can add this check for safety
            //     if (!story.media.startsWith('http')) {
            //         story.media = `https://res.cloudinary.com/YOUR_CLOUD_NAME/${story.media}`;
            //     }
            // }

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

        if (newPost.files.length === 0) {
            throw new Error("Please select at least one file to upload.");
        }

        const formData = new FormData();
        formData.append("caption", newPost.caption);
        formData.append("userId", storedUser._id);
        
        // Add location data if available
    if (newPost.location) {
        formData.append("locationName", newPost.location.name || "");
        if (newPost.location.coordinates) {
          formData.append("locationCoordinates", JSON.stringify(newPost.location.coordinates));
        }
      }
        
        // Append all files
        newPost.files.forEach((file, index) => {
            formData.append(`files`, file);
        });

        const response = await axios.post(`${API_BASE_URL}/posts/upload-multiple`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("Upload Response:", response.data);

        setShowUpload(false);
        setNewPost({
            caption: "",
            files: [],
            currentFileIndex: 0,
            imageType: "file",
            location: null
        });
        
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
// Add this function inside the Home component
const handleDeleteStory = async (storyId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this story?");
    if (!isConfirmed) return; // Stop if user cancels

    try {
        // Retrieve the authentication token from localStorage
        const token = localStorage.getItem('auth-token');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        // Comprehensive token and user validation
        if (!token) {
            alert('Authentication token is missing. Please log in again.');
            return;
        }

        if (!storedUser || !storedUser._id) {
            alert('User information is missing. Please log in again.');
            return;
        }

        // Make API call to delete the story with proper headers
        const response = await axios.delete(`${API_BASE_URL}/stories/${storyId}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'x-auth-token': token
            },
            data: { userId: storedUser._id } // Include user ID in request body
        });

        // Refresh stories after deletion
        fetchStories();

        // Show success message
        alert('Story deleted successfully');
    } catch (error) {
        console.error('Error deleting story:', error);
        
        // Detailed error handling
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    alert('Unauthorized. Please log in again.');
                    localStorage.removeItem('auth-token');
                    localStorage.removeItem('user');
                    navigate('/login');
                    break;
                case 403:
                    alert('You are not authorized to delete this story.');
                    break;
                case 404:
                    alert('Story not found.');
                    break;
                default:
                    alert(`Delete failed: ${error.response.data.error || 'Unknown server error'}`);
            }
        } else if (error.request) {
            alert('No response from server. Please check your internet connection.');
        } else {
            alert('Error preparing the request. Please try again.');
        }
    }
};

    const handleImageTypeChange = (type) => {
        setNewPost({ ...newPost, imageType: type });
    };

 // Update the handleFileChange function
const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files);
        setNewPost(prev => ({
            ...prev,
            files: [...prev.files, ...newFiles]
        }));
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
  
  const fetchFollowers = async () => {
    try {
        const token = localStorage.getItem("auth-token");
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (!token) {
            console.error("No auth token found");
            alert("Please log in again");
            navigate("/login"); // Redirect to login if no token
            return;
        }

        if (!storedUser || !storedUser._id) {
            console.error("No user information found");
            alert("User session expired. Please log in again.");
            navigate("/login");
            return;
        }

        const response = await axios.get(`${API_BASE_URL}/profile/${storedUser._id}/followers`, {
            headers: { 
                "x-auth-token": token,
                "Authorization": `Bearer ${token}`
            }
        });

        setFollowers(response.data);
    } catch (error) {
        console.error("Error fetching followers:", error.response?.data || error.message);
        
        // More specific error handling
        if (error.response && error.response.status === 401) {
            alert("Session expired. Please log in again.");
            localStorage.removeItem("auth-token");
            localStorage.removeItem("user");
            navigate("/login");
        } else {
            alert("Failed to fetch followers. Please try again.");
        }
    }
};


const handleShare = async (postId) => {
    setCurrentPostToShare(postId);
    setShowShareModal(true);
    fetchFollowers();
    setSelectedUsers([]); // Reset selection
};

// In Home.js, update the confirmShare function:
const confirmShare = async () => {
  try {
    const sharedPost = posts.find(post => post._id === currentPostToShare);
    if (!sharedPost) throw new Error("Post not found");

    // Get the first image if using multiple images, or fall back to single image
    const postImage = sharedPost.images?.[0] || sharedPost.image || null;

    // Format the post reference properly
    const postReference = {
      postId: sharedPost._id,
      imageUrl: postImage, // Use the image directly (Cloudinary URLs are already full URLs)
      caption: sharedPost.caption || '',
      userId: sharedPost.user._id,
      username: sharedPost.user.username,
      userProfilePic: sharedPost.user.profilePic,
      taggedUsers: sharedPost.taggedUsers || []
    };

    // Share the post
    await axios.post(`${API_BASE_URL}/posts/${currentPostToShare}/share`, {
      userId: currentUser._id,
      selectedUserIds: selectedUsers,
      postReference
    });

    // Create messages in conversations
    for (const recipientId of selectedUsers) {
      const conversationResponse = await axios.post(`${API_BASE_URL}/conversations`, {
        participants: [currentUser._id, recipientId]
      });

      await axios.post(`${API_BASE_URL}/messages`, {
        conversationId: conversationResponse.data._id,
        senderId: currentUser._id,
        content: `Shared a post: "${sharedPost.caption || 'No caption'}"`,
        postReference
      });
    }

    setShowShareModal(false);
    alert("Post shared successfully!");
  } catch (error) {
    console.error("Share failed:", error);
    alert("Failed to share post: " + (error.response?.data?.message || error.message));
  }
};

// Update getProfilePicUrl for more robust handling
const getProfilePicUrl = (profilePic) => {
  // If no profile pic provided, return default avatar
  if (!profilePic) return "/default-avatar.png";
  
  // If it's already a full URL (Cloudinary), return as is
  if (profilePic.startsWith('http')) {
    // Ensure Cloudinary URLs use HTTPS
    return profilePic.replace('http://', 'https://');
  }
  
  // Fallback for any legacy local URLs
  if (profilePic.startsWith('/uploads')) {
    return `${API_BASE_URL}${profilePic}`;
  }
  
  return "/default-avatar.png";
};

  // Add these new functions to your existing component
  const handleDeletePost = async (postId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this post?");
    if (!isConfirmed) return;
  
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser || !storedUser._id) {
        alert("User session expired. Please log in again.");
        return;
      }
  
      const response = await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
        data: { userId: storedUser._id }
      });
  
      alert("Post deleted successfully");
      fetchPosts(); // Refresh posts after deletion
    } catch (error) {
      console.error("Delete post failed", error);
      alert("Failed to delete post: " + (error.response?.data?.error || error.message));
    }
  };
  



// Open tag modal function
const openTagModal = (postId) => {
    fetchFollowers();
    setCurrentPostToTag(postId);
    setShowTagModal(true);
    setSelectedTaggedUsers([]); // Reset selected users
};

// Handle tagging users
const handleTagUsers = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/posts/${currentPostToTag}/tag`,
        {
          userId: currentUser._id,
          taggedUserId: selectedTaggedUsers[0] // Assuming single user tagging for simplicity
        }
      );
  
      // Update the posts state with the newly tagged users
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === currentPostToTag
            ? {
                ...post,
                taggedUsers: response.data.taggedUsers.map(user => ({
                  _id: user._id,
                  username: user.username,
                  profilePic: user.profilePic 
                    ? (user.profilePic.startsWith('http') 
                        ? user.profilePic 
                        : `https://back-nipj.onrender.com${user.profilePic}`)
                    : "/default-avatar.png"
                }))
              }
            : post
        )
      );
  
      setShowTagModal(false);
      alert("Users tagged successfully");
    } catch (error) {
      console.error("Tagging error", error);
      alert("Failed to tag users: " + error.message);
    }
  };

  // Update useEffect for socket events
  useEffect(() => {
    // Existing socket listeners...
    socket.on('postDeleted', (data) => {
      setPosts(prevPosts => prevPosts.filter(post => post._id !== data.postId));
    });

    socket.on('newTag', (data) => {
      fetchPosts(); // Refresh to get updated post with tags
    });

    // Clean up listeners in return
    return () => {
      // Other existing cleanup...
      socket.off('postDeleted');
      socket.off('newTag');
    };
  }, []);




// 3. Functions to handle post menu
const handleOpenMenu = (event, postId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedPostForMenu(postId);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedPostForMenu(null);
  };
  
  // 4. Fetch saved posts when component mounts
  useEffect(() => {
    if (currentUser?._id) {
      fetchSavedPosts();
    }
  }, [currentUser]);
  

  
  // 6. Function to save post
  const handleSavePost = async (postId) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token || !currentUser?._id) {
        alert("User session expired. Please log in again.");
        return;
      }
  
      await axios.post(
        `${API_BASE_URL}/posts/${postId}/save`,
        {},
        {
          headers: { "x-auth-token": token }
        }
      );
  
      // Update local state
      setSavedPosts(prev => [...prev, postId]);
      handleCloseMenu();
      
      // Show confirmation
      alert("Post saved successfully");
    } catch (error) {
      console.error("Save post failed", error);
      alert("Failed to save post: " + (error.response?.data?.error || error.message));
    }
  };
  
  // 7. Function to unsave post
  const handleUnsavePost = async (postId) => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token || !currentUser?._id) {
        alert("User session expired. Please log in again.");
        return;
      }
  
      await axios.post(
        `${API_BASE_URL}/posts/${postId}/unsave`,
        {},
        {
          headers: { "x-auth-token": token }
        }
      );
  
      // Update local state
      setSavedPosts(prev => prev.filter(id => id !== postId));
      handleCloseMenu();
      
      // Show confirmation
      alert("Post removed from saved");
    } catch (error) {
      console.error("Unsave post failed", error);
      alert("Failed to remove post from saved: " + (error.response?.data?.error || error.message));
    }
  };
  // Function to fetch saved posts
  const fetchSavedPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts/saved`);
      setSavedPosts(response.data);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    }
  };
  // 8. Check if a post is saved
  const isPostSaved = (postId) => {
    return savedPosts.includes(postId);
  };

  const fetchStoryViewers = async (storyId) => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await axios.get(`${API_BASE_URL}/stories/${storyId}/viewers`, {
        headers: { 'x-auth-token': token }
      });
      
      setCurrentStoryViewers(response.data.viewers);
      setCurrentStoryViewerCount(response.data.count);
      setShowViewersModal(true);
    } catch (error) {
      console.error('Error fetching story viewers:', error);
      alert('Failed to fetch story viewers');
    }
  };

// Add a new function to handle profile navigation
const navigateToProfile = (userId, event) => {
    if (event) {
        event.stopPropagation(); // Prevent triggering other click events
    }
    navigate(`/profile/${userId}`);
};

const handleOpenFollowersModal = () => {
    // Implement logic to open followers modal
    console.log("Open followers modal");
  };
  
  const handleOpenFollowingModal = () => {
    // Implement logic to open following modal
    console.log("Open following modal");
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
};

const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
};

const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    navigate('/login');
    handleProfileMenuClose();
};

const handleViewProfile = () => {
    navigate(`/profile/${currentUser?._id}`);
    handleProfileMenuClose();
};

const handleSettings = () => {
    navigate('/settings');
    handleProfileMenuClose();
};

return (
  <div className="home-container">
      {/* Top Navbar */}
      {/* Top Navbar */}
<div className="top-navbar">
  <div className="navbar-left">
  <IconButton 
            className="mobile-menu-button" 
            onClick={() => setMobileMenuOpen(true)}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
    <img
      src="WhatsApp Image 2025-03-14 at 13.33.08_21efd31a.jpg"
      alt="App Logo"
      className="app-logo"
    />
    <h2 className="logo-text">Vizz</h2>
  </div>
  
  {/* Center: Search bar */}
  <div className="navbar-search">
    <div className="search-wrapper">
      <SearchIcon className="search-icon" />
      <input
        type="text"
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      />
    </div>
  </div>
  
  {/* Right: Avatar and username */}
  <div className="navbar-right">
    <div className="profile-menu-container">
      <div 
        className="profile-menu-trigger" 
        onClick={handleProfileMenuOpen}
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
      >
        <Avatar
          src={getProfilePicUrl(currentUser?.profilePic)}
          alt={`${currentUser?.username || "User"} profile`}
          className="user-avatar"
          onError={(e) => {
            e.target.src = "/default-avatar.png";
          }}
        />
        <h3 className="username">{currentUser?.username || "User"}</h3>
      </div>
      
      {/* Profile Menu Dropdown */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={isProfileMenuOpen}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleViewProfile}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          View Profile
        </MenuItem>
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </div>
  </div>
</div>
 {/* Mobile Drawer Menu */}
 <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        className="mobile-drawer"
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            backgroundColor: '#fff',
          },
        }}
      >
        <div className="mobile-menu-header">
          <IconButton 
            onClick={() => setMobileMenuOpen(false)}
            sx={{ margin: '10px' }}
          >
            <CloseIcon />
          </IconButton>
        </div>
        <div className="mobile-menu-content">
          {/* Profile Section */}
          <div className="sidebar-profile-card mobile-profile-card">
            <Link 
              to={`/profile/${currentUser?._id}`} 
              className="sidebar-profile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Avatar
                src={getProfilePicUrl(currentUser?.profilePic)}
                alt={currentUser?.username}
                sx={{ width: 56, height: 56 }}
                className="sidebar-profile-avatar"
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
              />
              <div className="sidebar-profile-info">
                <Typography variant="subtitle1" className="sidebar-username">
                  {currentUser?.username || "Username"}
                </Typography>
                <Typography variant="body2" className="sidebar-full-name">
                  {currentUser?.fullName || "Full Name"}
                </Typography>
              </div>
            </Link>
            
            <div className="sidebar-profile-stats">
              <div className="sidebar-stat" onClick={handleOpenFollowersModal}>
                <span className="sidebar-stat-value">{profileStats.postsCount}</span>
                <span className="sidebar-stat-label">Posts</span>
              </div>
              <div className="sidebar-stat" onClick={handleOpenFollowersModal}>
                <span className="sidebar-stat-value">{profileStats.followersCount}</span>
                <span className="sidebar-stat-label">Followers</span>
              </div>
              <div className="sidebar-stat" onClick={handleOpenFollowingModal}>
                <span className="sidebar-stat-value">{profileStats.followingCount}</span>
                <span className="sidebar-stat-label">Following</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="mobile-menu-items">
            <div 
              className="menu-item" 
              onClick={() => { 
                navigate("/"); 
                setMobileMenuOpen(false); 
              }}
            >
              <HomeIcon className="menu-icon" />
              <span>Home</span>
            </div>
            <div 
              className="menu-item" 
              onClick={() => { 
                navigate("/chat"); 
                setMobileMenuOpen(false); 
              }}
            >
              <ChatIcon className="menu-icon" />
              <span>Messages</span>
            </div>
            <div 
              className="menu-item" 
              onClick={() => { 
                setShowUpload(true); 
                setMobileMenuOpen(false); 
              }}
            >
              <AddCircleOutlineIcon className="menu-icon" />
              <span>Create Post</span>
            </div>
            <div 
              className="menu-item" 
              onClick={() => { 
                navigate("/notifications"); 
                setMobileMenuOpen(false); 
              }}
            >
              <NotificationsIcon className="menu-icon" />
              <span>Notifications</span>
            </div>
            <div 
              className="menu-item" 
              onClick={() => { 
                navigate("/reels"); 
                setMobileMenuOpen(false); 
              }}
            >
              <SlideshowIcon className="menu-icon" />
              <span>Reels</span>
            </div>
            <div 
              className="menu-item" 
              onClick={() => { 
                navigate("/reels/create"); 
                setMobileMenuOpen(false); 
              }}
            >
              <AddCircleOutlineIcon className="menu-icon" />
              <span>Create Reel</span>
            </div>
          </div>
        </div>
      </Drawer>
      {/* Main Content */}
      <div className="main-content">
          {/* Left Sidebar */}
          <div className="sidebar">
          {/* Profile Section - Add this at the top of the sidebar */}
  {/* Compact Profile Section */}
  <div className="sidebar-profile-card">
    <Link to={`/profile/${currentUser?._id}`} className="sidebar-profile-link">
    <Avatar
  src={getProfilePicUrl(currentUser?.profilePic)}
  alt={currentUser?.username}
  sx={{ width: 56, height: 56 }}
  className="sidebar-profile-avatar"
  onError={(e) => {
    e.target.src = "/default-avatar.png";
  }}
/>
      <div className="sidebar-profile-info">
        <Typography variant="subtitle1" className="sidebar-username">
          {currentUser?.username || "Username"}
        </Typography>
        <Typography variant="body2" className="sidebar-full-name">
          {currentUser?.fullName || "Full Name"}
        </Typography>
      </div>
    </Link>
    
    <div className="sidebar-profile-stats">
      <div className="sidebar-stat">
        <span className="sidebar-stat-value">{profileStats.postsCount}</span>
        <span className="sidebar-stat-label">Posts</span>
      </div>
      <div className="sidebar-stat">
        <span className="sidebar-stat-value">{profileStats.followersCount}</span>
        <span className="sidebar-stat-label">Followers</span>
      </div>
      <div className="sidebar-stat">
        <span className="sidebar-stat-value">{profileStats.followingCount}</span>
        <span className="sidebar-stat-label">Following</span>
      </div>
    </div>
  </div>

              <div className="sidebar-menu">
                  {/* <div className="menu-item active">
                      <HomeIcon />
                      <span>Home</span>
                  </div> */}
                  <div className="menu-item" onClick={() => navigate("/")}>
                  <HomeIcon />
                  <span>Home</span>
              </div>
                  {/* <div className="menu-item search-item">
                      <SearchIcon />
                      <input
                          type="text"
                          placeholder="Search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                  </div> */}
              </div>
              {/* Search Results Modal */}
             {showSearchResults && (
    <div className="modal-overlay">
        <div className="search-results-modal">
            <h3>Search Results</h3>
            {searchResults.map((user) => (
                <div 
                    key={user._id} 
                    className="search-result-item"
                    onClick={() => {
                        // Navigate to user's profile when clicked
                      navigate(`/profile/${user._id}`);


                        // Close search results modal
                        setShowSearchResults(false);
                    }}
                    style={{ cursor: 'pointer' }} // Add pointer cursor to indicate clickability
                >
                    <Avatar 
  src={getProfilePicUrl(user.profilePic)}
  onError={(e) => {
    e.target.src = "/default-avatar.png";
  }}
/>

                    <p>{user.username}</p>
                    {currentUser && currentUser._id !== user._id && (
                        <Button
                            variant={user.isFollowing ? "outlined" : "contained"}
                            color="primary"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent profile navigation when clicking follow/unfollow
                                user.isFollowing ? handleUnfollow(user._id) : handleFollow(user._id);
                            }}
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

<div className="menu-item" onClick={() => navigate("/reels")}>
    <SlideshowIcon />
    <span>Reels</span>
</div>
<div className="menu-item" onClick={() => navigate("/reels/create")}>
    <AddCircleOutlineIcon />
    <span>Create Reel</span>
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
  onError={(e) => {
    e.target.src = "/default-avatar.png";
  }}
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
  src={getProfilePicUrl(story.user?.profilePic)}
  className="story-avatar"
  onError={(e) => {
    e.target.src = "/default-avatar.png";
  }}
/>
                {/* Add delete button only for current user's stories
                {story.user?._id === currentUser?._id && (
                    <button 
                        className="delete-story-btn" 
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent story view when clicking delete
                            handleDeleteStory(story._id);
                        }}
                    >
                        //
                    </button>
                )} */}
            </div>
            <p 
                                        onClick={(e) => navigateToProfile(story.user?._id, e)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {story.user?.username || "User"}
                                    </p>
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
            {/* Post Header */}
            <div className="post-header">
          <Avatar
  src={getProfilePicUrl(post.user?.profilePic)}
  onClick={(e) => navigateToProfile(post.user?._id, e)}
  style={{ cursor: 'pointer' }}
  onError={(e) => {
    e.target.src = "/default-avatar.png";
  }}
/>
                <p 
                                        className="post-username"
                                        onClick={(e) => navigateToProfile(post.user?._id, e)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {post.user?.username || "Anonymous"}
                                    </p>
                                    {post.location && post.location.name && (
  <div className="post-location">
    <span className="location-icon">📍</span>
    <span>{post.location.name}</span>
    {post.location.coordinates && Array.isArray(post.location.coordinates) && (
      <a 
        href={`https://www.google.com/maps?q=${post.location.coordinates[1]},${post.location.coordinates[0]}`}
        target="_blank" 
        rel="noopener noreferrer"
        className="view-on-map"
      >
        View on Map
      </a>
    )}
  </div>
)}
                <div className="post-menu">
        <MoreVertIcon 
            onClick={(e) => handleOpenMenu(e, post._id)} 
            className="menu-icon" 
        />
    </div>
                {/* Delete Post Button (only for post owner) */}
                {/* {post.user?._id === currentUser?._id && (
                    <DeleteIcon 
                        onClick={() => handleDeletePost(post._id)} 
                        className="delete-post-icon" 
                    />
                )} */}
            </div>

            {/* Display title and description for PDFs */}
            {post.fileType === 'pdf' && post.title && (
                <div className="post-paper-info">
                    <h3 className="post-title">{post.title}</h3>
                    {post.description && <p className="post-description">{post.description}</p>}
                </div>
            )}

            {/* Display Caption */}
            {post.caption && <p className="post-caption">{post.caption}</p>}
         
 {/* Post Media - Updated for multiple images */}
<div className="post-media">
    {post.images && post.images.length > 0 ? (
        <div className="post-carousel">
            <div className="carousel-images">
                {post.images.map((image, index) => (
                    <img
                        key={index}
                        src={image}
                        alt={`Post ${index + 1}`}
                        className={`post-image ${index === (post.currentImageIndex || 0) ? 'active' : ''}`}
                        onError={(e) => {
                            console.error(`Failed to load image: ${image}`);
                            e.target.style.display = "none";
                        }}
                    />
                ))}
            </div>
            {post.images.length > 1 && (
                <div className="carousel-dots">
                    {post.images.map((_, index) => (
                        <span 
                            key={index}
                            className={`dot ${index === (post.currentImageIndex || 0) ? 'active' : ''}`}
                            onClick={() => {
                                const updatedPosts = [...posts];
                                const postIndex = updatedPosts.findIndex(p => p._id === post._id);
                                updatedPosts[postIndex] = {
                                    ...updatedPosts[postIndex],
                                    currentImageIndex: index
                                };
                                setPosts(updatedPosts);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    ) : post.fileType === 'pdf' ? (
        <div className="pdf-container">
            {/* Keep your existing PDF display code */}
            <div className="pdf-preview">
                <img src="/pdf.png" alt="PDF Document" className="pdf-icon" />
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
        <p className="no-image">No Image Available</p>
    )}
</div>

            {/* Tagged Users Section */}
            {post.taggedUsers && post.taggedUsers.length > 0 && (
  <div className="tagged-users-section">
    <div className="tagged-users">
      {post.taggedUsers.map(user => (
        <div 
        key={user._id} 
        className="tagged-user"
        onClick={(e) => navigateToProfile(user._id, e)}
        style={{ cursor: 'pointer' }}
    >
          <Avatar 
            src={user.profilePic} 
            alt={`${user.username}'s profile`}
            className="tagged-user-avatar"
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
          <span className="tagged-username">
            @{user.username}
          </span>
        </div>
      ))}
    </div>
  </div>
)}

{/* Post Menu */}
<Menu
    anchorEl={menuAnchorEl}
    open={Boolean(menuAnchorEl)}
    onClose={handleCloseMenu}
>
    {/* Save/Unsave option */}
    {selectedPostForMenu && (
        isPostSaved(selectedPostForMenu) ? (
            <MenuItem onClick={() => handleUnsavePost(selectedPostForMenu)}>
                <BookmarkIcon style={{ marginRight: '8px' }} />
                Unsave
            </MenuItem>
        ) : (
            <MenuItem onClick={() => handleSavePost(selectedPostForMenu)}>
                <BookmarkBorderIcon style={{ marginRight: '8px' }} />
                Save
            </MenuItem>
        )
    )}
     {/* Tag option (only for post owner) */}
     {selectedPostForMenu && posts.find(post => post._id === selectedPostForMenu)?.user?._id === currentUser?._id && (
        <MenuItem onClick={() => {
            openTagModal(selectedPostForMenu);
            handleCloseMenu();
        }}>
            <PersonAddIcon style={{ marginRight: '8px' }} />
            Tag Users
        </MenuItem>
    )}
    {/* Delete option (only for post owner) */}
    {selectedPostForMenu && posts.find(post => post._id === selectedPostForMenu)?.user?._id === currentUser?._id && (
        <MenuItem onClick={() => {
            handleDeletePost(selectedPostForMenu);
            handleCloseMenu();
        }}>
            <DeleteIcon style={{ marginRight: '8px' }} />
            Delete
        </MenuItem>
    )}
</Menu>
            {/* Tag Users Button (Only for post owner) */}
            {/* {post.user?._id === currentUser?._id && (
                <button 
                    onClick={() => openTagModal(post._id)} 
                    className="tag-button"
                >
                    <PersonAddIcon /> Tag Users
                </button>
            )} */}
  

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
                                        src={currentUser?.profilePic ? `https://back-nipj.onrender.com${currentUser.profilePic}` : "/default-avatar.png"}
                                        className="comment-avatar"
                                        onClick={(e) => navigateToProfile(currentUser?._id, e)}
                                        style={{ cursor: 'pointer' }}
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
  src={getProfilePicUrl(comment.user?.profilePic)}
  className="comment-avatar"
  onClick={(e) => navigateToProfile(comment.user?._id, e)}
  style={{ cursor: 'pointer' }}
  onError={(e) => {
    e.target.src = "/default-avatar.png";
  }}
/>
                        <div className="comment-content">
                        <p 
                                                        className="comment-username"
                                                        onClick={(e) => navigateToProfile(comment.user?._id, e)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {comment.user?.username || "Anonymous"}
                                                    </p>
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
 {/* NEW: Right Sidebar - Add this right after main-feed */}

</div>

</div>
</div>

{showTagModal && (
    <div className="modal-overlay">
        <div className="modal">
            <h3>Tag Followers</h3>
            <ul>
                {followers.map(follower => (
                    <li key={follower._id}>
                        <input 
                            type="checkbox" 
                            value={follower._id} 
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setSelectedTaggedUsers(prev =>
                                    checked 
                                        ? [...prev, follower._id] 
                                        : prev.filter(id => id !== follower._id)
                                );
                            }}
                        />
                        {follower.username}
                    </li>
                ))}
            </ul>
            <button onClick={handleTagUsers}>Confirm Tags</button>
            <button onClick={() => setShowTagModal(false)}>Cancel</button>
        </div>
    </div>
)}
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
             {/* Location Input */}
             <div className="location-input">
  <input
    type="text"
    placeholder="Add location"
    value={newPost.location?.name || ''}
    onChange={(e) => {
      // Update both name and clear coordinates when manually typing
      setNewPost(prev => ({
        ...prev,
        location: {
          name: e.target.value,
          coordinates: null // Clear any existing coordinates
        }
      }));
    }}
  />
        <button 
          // Get current location using browser API
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setNewPost(prev => ({
                    ...prev,
                    location: {
                      name: "Current Location",
                      coordinates: [
                        position.coords.longitude,
                        position.coords.latitude
                      ]
                    }
                  }));
                },
              (error) => {
                console.error("Error getting location:", error);
                alert("Could not get your location. Please enter manually.");
              }
            );
          } else {
            alert("Geolocation is not supported by this browser.");
          }
        }}>
          Use Current Location
        </button>
      </div>
            {/* File preview carousel */}
            {newPost.files.length > 0 && (
                <div className="file-preview-carousel">
                    <div className="preview-container">
                        {newPost.files.map((file, index) => (
                            <div 
                                key={index} 
                                className={`preview-item ${index === newPost.currentFileIndex ? 'active' : ''}`}
                                onClick={() => setNewPost({...newPost, currentFileIndex: index})}
                            >
                                {file.type.startsWith('image/') ? (
                                    <img 
                                        src={URL.createObjectURL(file)} 
                                        alt={`Preview ${index + 1}`} 
                                        className="preview-image"
                                    />
                                ) : (
                                    <div className="file-icon">
                                        <span className="file-extension">
                                            {file.name.split('.').pop()}
                                        </span>
                                    </div>
                                )}
                                <button 
                                    className="remove-file-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const updatedFiles = [...newPost.files];
                                        updatedFiles.splice(index, 1);
                                        setNewPost({
                                            ...newPost,
                                            files: updatedFiles,
                                            currentFileIndex: Math.min(newPost.currentFileIndex, updatedFiles.length - 1)
                                        });
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    {/* Navigation arrows if more than one file */}
                    {newPost.files.length > 1 && (
                        <div className="carousel-controls">
                            <button 
                                onClick={() => setNewPost({
                                    ...newPost,
                                    currentFileIndex: (newPost.currentFileIndex - 1 + newPost.files.length) % newPost.files.length
                                })}
                                disabled={newPost.files.length <= 1}
                            >
                                &lt;
                            </button>
                            <span>{newPost.currentFileIndex + 1} / {newPost.files.length}</span>
                            <button 
                                onClick={() => setNewPost({
                                    ...newPost,
                                    currentFileIndex: (newPost.currentFileIndex + 1) % newPost.files.length
                                })}
                                disabled={newPost.files.length <= 1}
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {/* File input */}
            <div className="file-input-container">
                <label htmlFor="file-upload" className="file-upload-label">
                    {newPost.files.length > 0 ? 'Add More Files' : 'Select Files'}
                </label>
                <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/gif,application/pdf,.pdf"
                    onChange={handleFileChange}
                    className="file-input"
                />
                <span className="file-count">
                    {newPost.files.length} file{newPost.files.length !== 1 ? 's' : ''} selected
                </span>
            </div>
            
            {error && <p className="error-message">{error}</p>}
            <div className="button-group">
                <button 
                    onClick={handleUpload} 
                    disabled={loading || newPost.files.length === 0} 
                    className="upload-button"
                >
                    {loading ? "Uploading..." : "Share"}
                </button>
                <button 
                    onClick={() => {
                        setShowUpload(false);
                        setNewPost({
                            caption: "",
                            files: [],
                            currentFileIndex: 0,
                            imageType: "file"
                        });
                    }} 
                    className="cancel-button"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
)}

{/* Share Modal */}
{showShareModal && (
    <div className="modal-overlay">
        <div className="modal">
            <h3>Select Followers to Share With</h3>
            <ul>
                {followers.map(follower => (
                    <li key={follower._id}>
                        <input 
                            type="checkbox" 
                            value={follower._id} 
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setSelectedUsers(prev =>
                                    checked ? [...prev, follower._id] : prev.filter(id => id !== follower._id)
                                );
                            }}
                        />
                        {follower.username}
                    </li>
                ))}
            </ul>
            <button onClick={confirmShare}>Confirm Share</button>
            <button onClick={() => setShowShareModal(false)}>Cancel</button>
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
onDeleteStory={handleDeleteStory}
onViewersClick={() => fetchStoryViewers(activeStory._id)}
/>
)}
 
</div>

);
};

export default Home;









