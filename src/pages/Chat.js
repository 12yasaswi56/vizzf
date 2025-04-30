import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Avatar } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import MicIcon from "@mui/icons-material/Mic";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DescriptionIcon from "@mui/icons-material/Description";
import socket from '../services/socket';
import "../pagesCss/chat.css";
import EmojiPicker from 'emoji-picker-react';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import { FaPhone, FaVideo } from 'react-icons/fa';
import Call from '../components/Call';
const API_BASE_URL = "https://back-nipj.onrender.com//api";

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    messageId: null,
    isUnsend: false
  });
const [isRecording, setIsRecording] = useState(false);
const [mediaRecorder, setMediaRecorder] = useState(null);
const [audioChunks, setAudioChunks] = useState([]);
const [audioUrl, setAudioUrl] = useState(null);
const [recordingTime, setRecordingTime] = useState(0);
const timerRef = useRef(null);
const [unreadCounts, setUnreadCounts] = useState({});
const [notification, setNotification] = useState(null);
const notificationTimeoutRef = useRef(null);
const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const emojiPickerRef = useRef(null);
const [forwardMessage, setForwardMessage] = useState(null);
const [forwardRecipients, setForwardRecipients] = useState([]);
const [showForwardDialog, setShowForwardDialog] = useState(false);
const [showReactionPicker, setShowReactionPicker] = useState(null); // messageId or null
const reactionPickerRef = useRef(null);
const [call, setCall] = useState({
  inProgress: false,
  type: null, // 'audio' or 'video'
  otherUser: null
})
const [showMobileChat, setShowMobileChat] = useState(false);
// Add these state variables near the top of your component
const [showGroupCreationDialog, setShowGroupCreationDialog] = useState(false);
const [groupName, setGroupName] = useState('');
const [selectedUsersForGroup, setSelectedUsersForGroup] = useState([]);
const [followers, setFollowers] = useState([]);
// Add to your state
const [showGroupInfo, setShowGroupInfo] = useState(false);
const [selectedConversation, setSelectedConversation] = useState(null);
const [confirmDeleteConversation, setConfirmDeleteConversation] = useState({
  open: false,
  conversationId: null
});
  // Get current user from localStorage when component mounts
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser._id) {
      alert("User session expired. Please log in again.");
      window.location.href = "/login";
      return;
    }
    setCurrentUser(storedUser);
  }, []);

  // Connect to socket and load conversations when component mounts
  useEffect(() => {
    if (!currentUser) return;

    socket.connect();
    fetchConversations();

    // Listen for new messages
    socket.on('newMessage', handleNewMessage);
    
    // Listen for deleted messages
    socket.on('messageDeleted', ({ messageId, conversationId, newLatestMessage }) => {
      // Update messages list
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      
      // Update conversations list if needed
      setConversations(prev => 
        prev.map(conv => {
          if (conv._id === conversationId) {
            return {
              ...conv,
              latestMessage: newLatestMessage || conv.latestMessage
            };
          }
          return conv;
        })
      );
    });
    
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageDeleted');
      socket.disconnect();
    };
  }, [currentUser]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join conversation room when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      socket.emit('joinConversation', activeConversation._id);
      fetchMessages(activeConversation._id);
    }
    
    return () => {
      if (activeConversation) {
        socket.emit('leaveConversation', activeConversation._id);
      }
    };
  }, [activeConversation]);

  // Debug message sender data when messages are loaded
  useEffect(() => {
    if (messages.length > 0) {
      console.log('Message sender data:', messages.map(m => ({
        id: m._id,
        sender: m.senderId.username,
        profilePic: m.senderId.profilePic
      })));
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/conversations`, {
        params: { userId: currentUser._id }
      });
      setConversations(response.data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/messages/${conversationId}`);
      setMessages(response.data);
      console.log("Messages with image data:", response.data.filter(m => m.postReference?.imageUrl).map(m => ({
        id: m._id,
        content: m.content,
        imageUrl: m.postReference?.imageUrl,
        fullPath: m.postReference?.imageUrl.startsWith('http') 
          ? m.postReference.imageUrl 
          : `${API_BASE_URL.replace('/api', '')}${m.postReference.imageUrl}`
      })));
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // const handleNewMessage = (message) => {
  //   if (activeConversation && message.conversationId === activeConversation._id) {
  //     setMessages(prevMessages => [...prevMessages, message]);
  //     scrollToBottom();
  //   }
    
  //   // Update the conversation list to show the latest message
  //   setConversations(prevConversations => 
  //     prevConversations.map(conv => 
  //       conv._id === message.conversationId 
  //         ? { ...conv, latestMessage: message }
  //         : conv
  //     )
  //   );
  // };

  const handleNewMessage = (message) => {
    // If the message is not from current user and not in active conversation
    if (message.senderId._id !== currentUser._id) {
      if (!activeConversation || message.conversationId !== activeConversation._id) {
        // Show notification
        showNotification(message, message.senderId);
        
        // Update unread counts
        updateUnreadCounts();
        
        // Play notification sound
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
      }
    }
  
    // Update messages if in active conversation
    if (activeConversation && message.conversationId === activeConversation._id) {
      setMessages(prevMessages => [...prevMessages, message]);
      scrollToBottom();
      
      // Mark as read if it's not our own message
      if (message.senderId._id !== currentUser._id) {
        markMessagesAsRead(activeConversation._id);
      }
    }
    
    // Update conversation list
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv._id === message.conversationId 
          ? { ...conv, latestMessage: message }
          : conv
      )
    );
  };
  const markMessagesAsRead = async (conversationId) => {
    try {
      await axios.post(`${API_BASE_URL}/messages/mark-read`, {
        conversationId,
        userId: currentUser._id
      });
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.conversationId === conversationId && !msg.read
          ? { ...msg, read: true }
          : msg
      ));
      
      // Update unread counts
      updateUnreadCounts();
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };
  const deleteConversation = async (conversationId) => {
    try {
      await axios.delete(`${API_BASE_URL}/conversations/${conversationId}`, {
        data: { userId: currentUser._id }
      });
      
      // Update local state
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
      
      // If the deleted conversation was active, clear it
      if (activeConversation?._id === conversationId) {
        setActiveConversation(null);
      }
      
      // Show success feedback
      alert('Conversation deleted successfully');
    } catch (err) {
      console.error('Error deleting conversation:', err);
      alert(err.response?.data?.error || 'Failed to delete conversation');
    }
  };
  const DeleteConversationDialog = () => (
    <div className={`confirmation-dialog ${confirmDeleteConversation.open ? 'open' : ''}`}>
      <div className="confirmation-content">
        <p>Are you sure you want to delete this conversation? All messages will be permanently removed.</p>
        <div className="confirmation-buttons">
          <button 
            className="cancel-btn"
            onClick={() => setConfirmDeleteConversation({ open: false, conversationId: null })}
          >
            Cancel
          </button>
          <button 
            className="confirm-btn"
            onClick={() => {
              deleteConversation(confirmDeleteConversation.conversationId);
              setConfirmDeleteConversation({ open: false, conversationId: null });
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
  const deleteMessage = async (messageId) => {
    if (!messageId || !activeConversation?._id || !currentUser?._id) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/messages/${messageId}`, {
        data: { userId: currentUser._id }
      });
      
      // The socket event will handle the UI update
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message. Please try again.');
    }
  };

  const unsendMessage = async (messageId) => {
    if (!messageId || !activeConversation?._id || !currentUser?._id) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/messages/unsend/${messageId}`, {
        data: { userId: currentUser._id }
      });
      
      // The socket event will handle the UI update
    } catch (err) {
      console.error('Error unsending message:', err);
      alert(err.response?.data?.error || 'Failed to unsend message. Please try again.');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check file types before setting state
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'video/webm',
      'audio/mpeg',   // MP3
  'audio/wav',    // WAV
  'audio/ogg',    // OGG
  'audio/webm',   // WebM audio
      'application/pdf'
    ];
    
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert(`These file types are not supported: ${invalidFiles.map(f => f.type).join(', ')}`);
      return;
    }
    
    setMediaFiles(files);
    
    // Create previews
  //   const previews = files.map(file => ({
  //     file,
  //     preview: URL.createObjectURL(file),
  //     type: file.type.split('/')[0] === 'image' ? 'image' : 
  //           file.type.split('/')[0] === 'video' ? 'video' : 'document'
  //   }));
    
  //   setPreviewFiles(previews);
  // };
   // Create previews with better type detection
   const previews = files.map(file => {
    const fileType = file.type.split('/')[0];
    let type;
    
    if (fileType === 'image') type = 'image';
    else if (fileType === 'video') type = 'video';
    else if (fileType === 'audio') type = 'audio';
    else type = 'document'; // This will catch PDFs and other documents
    
    return {
      file,
      preview: URL.createObjectURL(file),
      type,
      filename: file.name
    };
  });
  
  setPreviewFiles(previews);
};

  const removePreview = (index) => {
    const newPreviews = [...previewFiles];
    URL.revokeObjectURL(newPreviews[index].preview);
    newPreviews.splice(index, 1);
    setPreviewFiles(newPreviews);
    
    const newFiles = [...mediaFiles];
    newFiles.splice(index, 1);
    setMediaFiles(newFiles);
  };

  const uploadFiles = async () => {
    if (mediaFiles.length === 0) return [];
    
    try {
      const formData = new FormData();
      mediaFiles.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await axios.post(`${API_BASE_URL}/uploads`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      return response.data.files;
    } catch (err) {
      console.error('Error uploading files:', err);
      if (err.response?.data?.error?.includes('Invalid file type')) {
        alert('The file type you tried to upload is not supported. Please use images (JPEG, PNG, GIF), videos (MP4, MOV), or PDFs.');
      } else {
        alert('Failed to upload files. Please try again.');
      }
      return [];
    }
  };

  const sendMessage = async () => {
   
    if (!activeConversation) {
      alert('No active conversation selected');
      return;
    }
    
    if (!newMessage.trim() && mediaFiles.length === 0) {
      alert('Please enter a message or attach a file');
      return;
    }
    try {
      // Upload files first if there are any
      let uploadedMedia = [];
      if (mediaFiles.length > 0) {
        uploadedMedia = await uploadFiles();
        console.log('Uploaded media:', uploadedMedia);
      }

      // Create the message payload
      const messageData = {
        conversationId: activeConversation._id,
        senderId: currentUser._id,
        content: newMessage,
        media: uploadedMedia
      };

      console.log('Sending message data:', messageData);

      // Create temp message for UI
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        ...messageData,
        senderId: {
          _id: currentUser._id,
          username: currentUser.username,
          profilePic: currentUser.profilePic
        },
        createdAt: new Date(),
        isTemp: true
      };

      // Update UI
      setMessages(prev => [...prev, tempMessage]);
      setConversations(prev => 
        prev.map(conv => 
          conv._id === activeConversation._id 
            ? { ...conv, latestMessage: tempMessage }
            : conv
        )
      );
      
      // Clear inputs
      setNewMessage("");
      setMediaFiles([]);
      setPreviewFiles([]);

       // Send to server
    const response = await axios.post(`${API_BASE_URL}/messages`, messageData, {
      validateStatus: (status) => status >= 200 && status < 300 // Accept 204 as success
    });
    if (!response.data) {
      // If we get 204 No Content, manually fetch the latest messages
      const updatedMessages = await axios.get(`${API_BASE_URL}/messages/${activeConversation._id}`);
      setMessages(updatedMessages.data);
    } else {
      // Replace temp message with server response
      setMessages(prev => 
        prev.map(msg => 
          msg.isTemp && msg._id === tempMessage._id 
            ? response.data 
            : msg
        )
      );
    }
      // Replace temp message with server response
      // setMessages(prev => 
      //   prev.map(msg => 
      //     msg.isTemp && msg._id === tempMessage._id 
      //       ? response.data 
      //       : msg
      //   )
      // );
      
      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err.response?.data || err.message);
      setMessages(prev => 
        prev.filter(msg => msg._id !== `temp-${Date.now()}`)
      );
      // More specific error message
    const errorMsg = err.response?.data?.error || 
    'Failed to send message. Please try again.';
alert(errorMsg);
}
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/users/search`, {
        params: { query: searchQuery }
      });
      setUsers(response.data.filter(user => user._id !== currentUser._id));
    } catch (err) {
      console.error("Error searching users:", err);
    }
  };

  const startNewConversation = async (userId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/conversations`, {
        participants: [currentUser._id, userId]
      });
      
      setConversations(prev => [response.data, ...prev]);
      setActiveConversation(response.data);
      setUsers([]);
      setSearchQuery("");
    } catch (err) {
      console.error("Error starting conversation:", err);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

// Update getConversationName to handle groups better
const getConversationName = (conversation) => {
  if (!conversation) return "Chat";
  
  if (conversation.isGroup) {
    return conversation.groupName || 
           conversation.participants?.map(p => p.username).join(', ') || 
           "Group Chat";
  }
  
  const otherParticipant = conversation.participants?.find(
    p => p._id !== currentUser?._id
  );
  return otherParticipant?.username || "Unknown User";
};

// Update getConversationImage to handle groups
const getConversationImage = (conversation) => {
  if (!conversation) return "/default-avatar.png";
  
  if (conversation.isGroup) {
    return conversation.groupImage || "/default-group.png";
  }
  
  const otherParticipant = conversation.participants?.find(
    p => p._id !== currentUser?._id
  );
  return otherParticipant?.profilePic || "/default-avatar.png";
};

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentUserMessage = (message) => {
    return message.senderId._id === currentUser?._id;
  };

  const shouldShowAvatar = (message, index) => {
    if (isCurrentUserMessage(message)) return false;
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    return prevMessage.senderId._id !== message.senderId._id;
  };
// Add these functions to your component
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    
    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
      setAudioChunks(chunks);
    };
    
    recorder.onstop = () => {
      const audioBlob = new Blob(chunks, { type: 'audio/wav' });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Create a file object from the blob
      const audioFile = new File([audioBlob], `voice-note-${Date.now()}.wav`, {
        type: 'audio/wav'
      });
      
      // Add to media files
      setMediaFiles([...mediaFiles, audioFile]);
      
      // Add to preview files
      setPreviewFiles([...previewFiles, {
        file: audioFile,
        preview: url,
        type: 'audio',
        duration: recordingTime
      }]);
      
      // Clean up
      setRecordingTime(0);
      clearInterval(timerRef.current);
    };
    
    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
  } catch (err) {
    console.error('Error starting recording:', err);
    alert('Could not access microphone. Please check permissions.');
  }
};

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    setIsRecording(false);
  }
};

const cancelRecording = () => {
  if (mediaRecorder) {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    setIsRecording(false);
    setAudioChunks([]);
    setRecordingTime(0);
    clearInterval(timerRef.current);
  }
};
  const renderMessageMedia = (media) => {
    return media.map((item, index) => {
      const mediaUrl = item.url.startsWith('http') 
      ? item.url 
      : `${API_BASE_URL.replace('/api', '')}${item.url}`;
      switch(item.type) {
        case 'image':
          return (
            <div key={index} className="media-container">
              <img 
                src={mediaUrl}
                alt="Shared media"
                className="message-media"
                onError={(e) => {
                  console.error(`Failed to load image: ${mediaUrl}`);
                  e.target.src = "/default-image.png";
                }}
              />
            </div>
          );
        case 'video':
          return (
            <div key={index} className="media-container">
            <video 
              controls 
              className="message-media"
              style={{ maxWidth: '100%', maxHeight: '300px' }}
            >
              <source 
                src={mediaUrl}
                type={`video/${item.url.split('.').pop()}` || 'video/mp4'}
              />
              Your browser does not support the video tag.
            </video>
          </div>
          );
        case 'document':
          return (
            <div key={index} className="document-container">
            <a 
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={item.filename || 'document'}
            >
              <div className="document-icon">
                <DescriptionIcon />
              </div>
              <span>{item.filename || 'Document'}</span>
            </a>
          </div>
          );
          case 'audio':
            return (
              <div key={index} className="audio-container">
                <audio controls className="message-audio">
                  <source src={mediaUrl} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
                <span className="audio-duration">
                  {item.duration ? `${item.duration}s` : ''}
                </span>
              </div>
            );
            case 'document':
              return (
                <div key={index} className="document-container">
                  <a 
                    href={mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={item.filename || 'document'}
                  >
                    <div className="document-icon">
                      <DescriptionIcon />
                    </div>
                    <span>{item.filename || 'Document'}</span>
                  </a>
                </div>
              );
        default:
          return null;
      }
    });
  };

const ConfirmationDialog = () => (
  <div className={`confirmation-dialog ${confirmDelete.open ? 'open' : ''}`}>
    <div className="confirmation-content">
      <p>{confirmDelete.isUnsend 
        ? "Are you sure you want to unsend this message?" 
        : "Are you sure you want to delete this message?"}</p>
      <div className="confirmation-buttons">
        <button 
          className="cancel-btn"
          onClick={() => setConfirmDelete({ open: false, messageId: null })}
        >
          Cancel
        </button>
        <button 
          className="confirm-btn"
          onClick={() => {
            if (confirmDelete.isUnsend) {
              unsendMessage(confirmDelete.messageId);
            } else {
              deleteMessage(confirmDelete.messageId);
            }
            setConfirmDelete({ open: false, messageId: null });
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);
  
// Add this useEffect hook to your component
useEffect(() => {
  if (!currentUser) return;

  // Listen for notification events
  socket.on('newNotification', (notification) => {
    if (notification.type === 'message') {
      // Only show if not in the active conversation
      if (!activeConversation || 
          activeConversation._id !== notification.conversationId) {
        showNotification({
          content: notification.message,
          senderId: notification.sender
        }, notification.sender);
      }
    }
  });

  // Load initial unread counts
  updateUnreadCounts();

  return () => {
    socket.off('newNotification');
  };
}, [currentUser, activeConversation]);

  // Function to show a notification
  const showNotification = (message, sender) => {
    // Clear any existing notification timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
  
    // Set the new notification
    setNotification({
      sender,
      message: message.content || 'Sent a media message',
      avatar: sender.profilePic 
        ? `${API_BASE_URL.replace('/api', '')}${sender.profilePic}` 
        : "/default-avatar.png"
    });
  
    // Play notification sound
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(e => console.log('Audio play failed:', e));
  
    // Auto-hide after 5 seconds
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

// Function to update unread counts
const updateUnreadCounts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/conversations/unread`, {
      params: { userId: currentUser._id }
    });
    setUnreadCounts(response.data);
  } catch (err) {
    console.error('Error fetching unread counts:', err);
  }
};

// Modify the conversation item click handler
const handleConversationClick = (conversation) => {
  setActiveConversation(conversation);
  if (window.innerWidth <= 768) {
    setShowMobileChat(true);
  }
};

// Update the back button handler
const handleBackClick = () => {
  if (window.innerWidth <= 768) {
    setShowMobileChat(false);
  } else {
    setActiveConversation(null);
  }
};
useEffect(() => {
  const handleClickOutside = (event) => {
    if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
      setShowEmojiPicker(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);

const ForwardDialog = () => (
  <div className={`forward-dialog ${showForwardDialog ? 'open' : ''}`}>
    <div className="forward-content">
      <h3>Forward Message</h3>
      <p>{forwardMessage?.content || "Media message"}</p>
      
      <div className="conversation-list">
        {conversations.map(conv => (
          <div 
            key={conv._id} 
            className={`conversation-item ${forwardRecipients.includes(conv._id) ? 'selected' : ''}`}
            onClick={() => {
              if (forwardRecipients.includes(conv._id)) {
                setForwardRecipients(prev => prev.filter(id => id !== conv._id));
              } else {
                setForwardRecipients(prev => [...prev, conv._id]);
              }
            }}
          >
            <Avatar src={getConversationImage(conv)} />
            <p>{getConversationName(conv)}</p>
          </div>
        ))}
      </div>
      
      <div className="forward-buttons">
        <button onClick={() => setShowForwardDialog(false)}>Cancel</button>
        <button 
          onClick={handleForwardMessage} 
          disabled={forwardRecipients.length === 0}
        >
          Forward
        </button>
      </div>
    </div>
  </div>
);
const handleForwardMessage = async () => {
  try {
    for (const convId of forwardRecipients) {
      const messageData = {
        conversationId: convId,
        senderId: currentUser._id,
        content: forwardMessage.content || "Forwarded message",
        media: forwardMessage.media || [],
        forwardedFrom: forwardMessage.senderId.username || "Unknown"
      };

      await axios.post(`${API_BASE_URL}/messages`, messageData);
    }

    // Reset states
    setShowForwardDialog(false);
    setForwardMessage(null);
    setForwardRecipients([]);
    
    // Show success feedback
    alert('Message forwarded successfully');
  } catch (err) {
    console.error('Error forwarding message:', err);
    alert('Failed to forward message. Please try again.');
  }
};

const ReactionPicker = ({ messageId, position }) => {
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  return (
    <div 
      className="reaction-picker"
      ref={reactionPickerRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '8px',
        borderRadius: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}
    >
      {reactions.map(reaction => (
        <span 
          key={reaction}
          className="reaction-option"
          onClick={() => handleReactionSelect(messageId, reaction)}
          style={{
            fontSize: '24px',
            margin: '0 4px',
            cursor: 'pointer',
            display: 'inline-block'
          }}
        >
          {reaction}
        </span>
      ))}
    </div>
  );
};

const handleReactionSelect = async (messageId, reaction) => {
  try {
    await axios.post(`${API_BASE_URL}/messages/react`, {
      messageId,
      userId: currentUser._id,
      reaction
    });
    
    // Update local state
    setMessages(prev => prev.map(msg => 
      msg._id === messageId
        ? {
            ...msg,
            reactions: {
              ...msg.reactions,
              [currentUser._id]: reaction
            }
          }
        : msg
    ));
    
    setShowReactionPicker(null);
  } catch (err) {
    console.error('Error adding reaction:', err);
  }
};

const handleLongPressForReaction = (messageId, e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  setShowReactionPicker({
    messageId,
    position: {
      x: rect.left + rect.width / 2,
      y: rect.top
    }
  });
};

// Add this function to your Chat component
const formatMessageDate = (timestamp) => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Format as "Today", "Yesterday", or specific date
  if (messageDate.toDateString() === today.toDateString()) {
    return "Today";
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    // Format as "April 5" or similar
    return messageDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    });
  }
};

// Add these functions
const startCall = (type) => {
  const otherParticipant = activeConversation.participants.find(
    p => p._id !== currentUser._id
  );
  
  setCall({
    inProgress: true,
    type,
    otherUser: otherParticipant
  });
  
  // Emit call event to socket
  socket.emit('startCall', {
    conversationId: activeConversation._id,
    caller: currentUser,
    type
  });
};

const endCall = () => {
  setCall({ inProgress: false, type: null, otherUser: null });
  // Emit end call event to socket
  socket.emit('endCall', { conversationId: activeConversation._id });
};

// Add socket listeners for calls
useEffect(() => {
  if (!currentUser) return;

  socket.on('incomingCall', ({ caller, type }) => {
    const shouldAccept = window.confirm(
      `${caller.username} is calling you with ${type} call. Accept?`
    );
    
    if (shouldAccept) {
      const otherParticipant = activeConversation.participants.find(
        p => p._id === caller._id
      );
      
      setCall({
        inProgress: true,
        type,
        otherUser: otherParticipant
      });
      
      socket.emit('acceptCall', { conversationId: activeConversation._id });
    } else {
      socket.emit('rejectCall', { conversationId: activeConversation._id });
    }
  });

  return () => {
    socket.off('incomingCall');
  };
}, [currentUser, activeConversation]);

// Add this useEffect to fetch followers when component mounts
useEffect(() => {
  if (!currentUser) return;
  
  const fetchFollowers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/conversations/followers/${currentUser._id}`);
      setFollowers(response.data);
    } catch (err) {
      console.error('Error fetching followers:', err);
    }
  };
  
  fetchFollowers();
}, [currentUser]);

// Add this function to create a group
const createGroup = async () => {
  console.log('Creating group with:', {
    name: groupName,
    participants: selectedUsersForGroup,
    currentUser: currentUser._id
  });
  if (!groupName.trim() || selectedUsersForGroup.length < 1) {
    alert('Please enter a group name and select at least one participant');
    return;
  }

  try {
    // Include current user + selected followers
    const participants = [currentUser._id, ...selectedUsersForGroup];
    
    const response = await axios.post(`${API_BASE_URL}/conversations`, {
      participants,
      isGroup: true,
      groupName,
      groupAdmin: currentUser._id
    });
    
    // Update conversations list with the new group
    setConversations(prev => [response.data, ...prev]);
    setActiveConversation(response.data);
    setShowGroupCreationDialog(false);
    setGroupName('');
    setSelectedUsersForGroup([]);
    
    // Fetch the full conversation details with populated participants
    const fullConversation = await axios.get(`${API_BASE_URL}/conversations/${response.data._id}`);
    setActiveConversation(fullConversation.data);
  } catch (err) {
    console.error('Error creating group:', err);
    alert(err.response?.data?.error || 'Failed to create group. Please try again.');
  }
};
// Add this component to your render method
const GroupCreationDialog = () => (
  <div className={`group-dialog ${showGroupCreationDialog ? 'open' : ''}`}>
    <div className="group-dialog-content">
      <h3>Create New Group</h3>
      <input
        type="text"
        placeholder="Group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className="group-name-input"
      />
      
      <h4>Select Participants (Your Followers)</h4>
      <div className="followers-list">
        {followers.map(user => (
          <div 
            key={user._id} 
            className={`follower-item ${selectedUsersForGroup.includes(user._id) ? 'selected' : ''}`}
            onClick={() => {
              if (selectedUsersForGroup.includes(user._id)) {
                setSelectedUsersForGroup(prev => prev.filter(id => id !== user._id));
              } else {
                setSelectedUsersForGroup(prev => [...prev, user._id]);
              }
            }}
          >
            <Avatar src={user.profilePic || "/default-avatar.png"} />
            <span>{user.username}</span>
          </div>
        ))}
      </div>
      
      <div className="group-dialog-buttons">
        <button 
          onClick={() => setShowGroupCreationDialog(false)}
          className="cancel-btn"
        >
          Cancel
        </button>
        <button 
          onClick={createGroup}
          disabled={!groupName.trim() || selectedUsersForGroup.length < 1}
          className="create-btn"
        >
          Create Group
        </button>
      </div>
    </div>
  </div>
);
// Add to your Chat.js
const GroupInfoModal = ({ conversation, onClose, currentUser }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const [editing, setEditing] = useState(false);
  const [groupName, setGroupName] = useState(conversation.groupName);
  const [description, setDescription] = useState(conversation.groupDescription);
  const [themeColor, setThemeColor] = useState(conversation.groupTheme);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [uploading, setUploading] = useState(false);
 
   // Add this useEffect to set initial image preview
   useEffect(() => {
    if (conversation.groupImage) {
      setImagePreview(
        conversation.groupImage.startsWith('http') 
          ? conversation.groupImage 
          : `${API_BASE_URL.replace('/api', '')}${conversation.groupImage}`
      );
    }
  }, [conversation.groupImage]);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadGroupImage = async () => {
    if (!imageFile) {
      alert('Please select an image first');
      return;
    }
  
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('image', imageFile); // Make sure the field name is 'image'
      
      const response = await axios.post(
        `${API_BASE_URL}/conversations/${conversation._id}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      console.log('Upload successful:', response.data);
      onClose(true);
    } catch (err) {
      console.error('Upload error:', err);
      alert(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

   // Fetch users that can be added (followers not in group)
   const fetchAvailableUsers = async () => {
    const res = await axios.get(`${API_BASE_URL}/users/followers/${currentUser._id}`);
    const currentMembers = conversation.participants.map(p => p._id.toString());
    setAvailableUsers(res.data.filter(user => 
      !currentMembers.includes(user._id.toString())
    ));
  };

  const updateGroupInfo = async () => {
    try {
      await axios.put(`${API_BASE_URL}/conversations/${conversation._id}`, {
        groupName,
        groupDescription: description,
        groupTheme: themeColor
      });
      setEditing(false);
      onClose(true); // Refresh data
    } catch (err) {
      console.error('Error updating group:', err);
    }
  };

  const addMembers = async () => {
    try {
      await Promise.all(selectedUsers.map(userId => 
        axios.post(`${API_BASE_URL}/conversations/${conversation._id}/members`, { userId })
      ));
      setShowAddMembers(false);
      onClose(true); // Refresh data
    } catch (err) {
      console.error('Error adding members:', err);
    }
  };

  const removeMember = async (userId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/conversations/${conversation._id}/members/${userId}`
      );
      onClose(true); // Refresh data
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  const changeAdmin = async (userId) => {
    try {
      await axios.patch(`${API_BASE_URL}/conversations/${conversation._id}/admin`, {
        newAdminId: userId
      });
      onClose(true); // Refresh data
    } catch (err) {
      console.error('Error changing admin:', err);
    }
  };
  return (
    <div className="group-info-modal">
      <div className="modal-content" style={{ borderTop: `5px solid ${themeColor}` }}>
        <button className="close-btn" onClick={() => onClose(false)}>×</button>
        
        {editing ? (
          <>
            <input 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="edit-input"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Group description"
              className="edit-textarea"
            />
            <div className="theme-picker">
              <label>Theme Color:</label>
              <input 
                type="color" 
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button onClick={updateGroupInfo}>Save</button>
              <button onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <h3>{conversation.groupName}</h3>
            {conversation.groupDescription && (
              <p className="group-description">{conversation.groupDescription}</p>
            )}
            
            {/* Group image upload UI */}
            <div className="group-image-container">
            <img 
          src={imagePreview || conversation.groupImage || "/default-group.png"} 
          alt="Group" 
          onClick={() => fileInputRef.current.click()}
          className={!conversation.groupImage ? 'default-group-img' : ''}
        />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              {imagePreview && (
                <button onClick={uploadGroupImage} className="save-image-btn">
                  Save Image
                </button>
              )}
            </div>
            
            {currentUser._id === conversation.groupAdmin._id && (
              <button 
                onClick={() => setEditing(true)}
                className="edit-btn"
              >
                Edit Group
              </button>
            )}
            
            <div className="members-section">
              <div className="section-header">
                <h4>Members ({conversation.participants.length})</h4>
                {currentUser._id === conversation.groupAdmin._id && (
                  <button 
                    onClick={() => {
                      fetchAvailableUsers();
                      setShowAddMembers(true);
                    }}
                    className="add-members-btn"
                  >
                    + Add Members
                  </button>
                )}
              </div>
              
              {showAddMembers && (
                <div className="add-members-dialog">
                  <h5>Select Members to Add</h5>
                  <div className="available-users">
                    {availableUsers.map(user => (
                      <div key={user._id} className="user-select">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => setSelectedUsers(prev => 
                            prev.includes(user._id)
                              ? prev.filter(id => id !== user._id)
                              : [...prev, user._id]
                          )}
                        />
                        <Avatar src={user.profilePic || "/default-avatar.png"} />
                        <span>{user.username}</span>
                      </div>
                    ))}
                  </div>
                  <div className="dialog-actions">
                    <button onClick={addMembers}>Add Selected</button>
                    <button onClick={() => setShowAddMembers(false)}>Cancel</button>
                  </div>
                </div>
              )}
              
              <div className="members-list">
                {conversation.participants.map(user => (
                  <div key={user._id} className="member-item">
                    <Avatar src={user.profilePic || "/default-avatar.png"} />
                    <span className="member-name">
                      {user.username}
                      {user._id === conversation.groupAdmin._id && (
                        <span className="admin-badge">Admin</span>
                      )}
                    </span>
                    
                    {currentUser._id === conversation.groupAdmin._id && (
                      <div className="member-actions">
                        {user._id !== conversation.groupAdmin._id && (
                          <>
                            <button 
                              onClick={() => changeAdmin(user._id)}
                              className="make-admin-btn"
                            >
                              Make Admin
                            </button>
                            <button 
                              onClick={() => removeMember(user._id)}
                              className="remove-btn"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
   };
  return (
    <div className="chat-container">
     {/* Notification component */}
    {notification && (
      <div className="message-notification" onClick={() => {
        // Find the conversation for this message
        const conv = conversations.find(c => 
          c.participants.some(p => p._id === currentUser._id) && 
          c.participants.some(p => p._id === notification.sender._id)
        );
        if (conv) {
          setActiveConversation(conv);
          setNotification(null);
        }
      }}>
        <img 
  src={notification.avatar || "/default-avatar.png"} 
  alt={notification.sender.username} 
  className="notification-avatar"
/>
        <div className="notification-content">
          <strong>{notification.sender.username}</strong>
          <p>{notification.message}</p>
        </div>
      </div>
    )}
    
      {activeConversation && (
  <>
    <ForwardDialog />
    {showReactionPicker && (
  <ReactionPicker 
    messageId={showReactionPicker.messageId} 
    position={showReactionPicker.position} 
  />
)}
    <ConfirmationDialog />
  </>
)}
<GroupCreationDialog />
<DeleteConversationDialog />.
      {/* Left Panel - Conversations List */}
      <div className={`conversations-panel ${showMobileChat ? 'hidden' : ''}`}>
        <div className="search-container">
          <div className="search-input-container">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              className="search-input"
            />
          </div>
          <button onClick={searchUsers} className="search-button">Search</button>
        </div>
        <div className="panel-header">
        <h3>Messages</h3>
        <button 
          className="create-group-btn"
          onClick={() => setShowGroupCreationDialog(true)}
        >
          Create Group
        </button>
      </div>

        {/* Search Results */}
        {users.length > 0 && (
          <div className="search-results">
            <h3>Users</h3>
            {users.map(user => (
              <div 
                key={user._id} 
                className="user-item"
                onClick={() => startNewConversation(user._id)}
              >
                <Avatar 
  src={user.profilePic || "/default-avatar.png"} 
/>
                <div className="user-info">
                  <p className="username">{user.username}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <h3>Messages</h3>
        
        {loading && conversations.length === 0 ? (
          <p className="loading">Loading conversations...</p>
        ) : (
          <div className="conversations-list">
            {conversations.length === 0 ? (
              <p className="no-conversations">No conversations yet. Search for users to start chatting!</p>
            ) : (
              conversations.map(conversation => (
                <div 
                  key={conversation._id} 
                  className={`conversation-item ${activeConversation?._id === conversation._id ? 'active' : ''}`}
                  onClick={() => handleConversationClick(conversation)}
                >
                  <Avatar src={getConversationImage(conversation)} />
                  <div className="conversation-info">
                    <p className="conversation-name">{getConversationName(conversation)}</p>
                    <p className="last-message">
                      {conversation.latestMessage?.content || "Start chatting!"}
                    </p>
                  </div>
                  {conversation.latestMessage && (
                    <span className="timestamp">{formatTime(conversation.latestMessage.createdAt)}</span>
                  )}
                </div>
               
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Panel - Active Conversation */}
      <div className={`conversation-panel ${showMobileChat ? 'active' : ''}`}>
        {activeConversation ? (
          <>
            <div className="conversation-header">
              <button 
                className="back-button"
                // onClick={() => setActiveConversation(null)}
                onClick={handleBackClick}
              >
                <ArrowBackIcon />
              </button>
              <Avatar 
  src={getConversationImage(activeConversation)}
  className={activeConversation?.isGroup ? "group-avatar" : ""}
/>
              <h3>{getConversationName(activeConversation)}</h3>
                {/* Add these call buttons here */}
             <div className="call-buttons-container">
               <button 
      className="call-button audio"
      onClick={() => startCall('audio')}
    >
      <FaPhone />
    </button>
    <button 
      className="call-button video"
      onClick={() => startCall('video')}
    >
      <FaVideo />
    </button>
  </div>
   {/* Add the delete conversation button here */}
   <button 
    className="delete-conversation-btn"
    onClick={(e) => {
      e.stopPropagation();
      setConfirmDeleteConversation({
        open: true,
        conversationId: activeConversation._id
      });
    }}
  >
    ×
  </button>
  {activeConversation?.isGroup && (
    <button 
      className="info-button"
      onClick={() => {
        setSelectedConversation(activeConversation);
        setShowGroupInfo(true);
      }}
    >
      ℹ️ Group Info
    </button>
  )}
            </div>

            <div className="messages-container">
              {loading ? (
                <p className="loading">Loading messages...</p>
              ) : (
                <>
                  {messages.length === 0 ? (
                    <p className="no-messages">No messages yet. Say hello!</p>
                  ) : (
                    messages.map((message, index) => {
                      const isSender = isCurrentUserMessage(message);
                      const showAvatar = shouldShowAvatar(message, index);
                      const showSenderName = activeConversation?.isGroup && !isSender && showAvatar;
                      const hasPostReference = message.postReference && message.postReference.postId;
                      const hasMedia = message.media && message.media.length > 0;
                       // Check if we need to show a date separator
      const showDateSeparator = index === 0 || 
      new Date(message.createdAt).toDateString() !== 
      new Date(messages[index - 1].createdAt).toDateString();
                      return (
                        <>
                          {/* Date separator */}
          {showDateSeparator && (
            <div className="date-separator">
              <span>{formatMessageDate(message.createdAt)}</span>
            </div>
          )}
                        <div 
                        key={message._id || index} 
                        className={`message-row ${isSender ? 'sender-row' : 'receiver-row'}`}
                      >
                        {!isSender && showAvatar && (
                         <Avatar
                         src={message.senderId?.profilePic || "/default-avatar.png"}
                         className="message-avatar"
                         sx={{ width: 28, height: 28 }}
                         onError={(e) => {
                           console.error('Avatar load error:', e);
                           e.target.src = "/default-avatar.png";
                         }}
                       />
                        )}
                        {!isSender && !showAvatar && <div className="avatar-placeholder"></div>}
                        
                        {/* This is the message container with the event handlers */}
                        <div 
                          className={`message ${isSender ? 'sent' : 'received'} ${message.isTemp ? 'temp-message' : ''}`}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleLongPressForReaction(message._id, e);
                          }}
                          onTouchStart={(e) => {
                            this.touchTimer = setTimeout(() => {
                              handleLongPressForReaction(message._id, e);
                            }, 500);
                          }}
                          onTouchEnd={() => clearTimeout(this.touchTimer)}
                        >
                     {activeConversation?.isGroup && !isSender && (
            <span className="message-sender">
              {message.senderId.username}
            </span>
          )}
                          {isSender && (
                            <div className="message-actions">
                              <button 
                                className="message-action-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setForwardMessage(message);
                                  setShowForwardDialog(true);
                                }}
                              >
                                Forward
                              </button>
                              <button 
                                className="message-action-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDelete({
                                    open: true,
                                    messageId: message._id,
                                    isUnsend: false
                                  });
                                }}
                              >
                                Delete
                              </button>
                              {Date.now() - new Date(message.createdAt).getTime() < 5 * 60 * 1000 && (
                                <button 
                                  className="message-action-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDelete({
                                      open: true,
                                      messageId: message._id,
                                      isUnsend: true
                                    });
                                  }}
                                >
                                  Unsend
                                </button>
                              )}
                            </div>
                          )}
                          
                          <p className="message-content">
                            {message.content.split(' ').map((word, i) => {
                              const isEmoji = /\p{Emoji}/u.test(word);
                              return isEmoji ? (
                                <span key={i} className="emoji">{word}</span>
                              ) : (
                                <span key={i}>{word} </span>
                              );
                            })}
                          </p>
                          
                          {hasMedia && (
                            <div className="message-media-container">
                              {renderMessageMedia(message.media)}
                            </div>
                          )}
                          
                          <div className="message-reactions">
  {message.reactions && Object.entries(message.reactions).map(([userId, reaction]) => (
    <span key={userId} className="reaction">
      {reaction}
    </span>
  ))}
</div>
                          
                          {hasPostReference && (
                            <div 
                              className="shared-post-preview" 
                              onClick={() => window.location.href = `/post/${message.postReference.postId}`}
                            >
                              {message.postReference.imageUrl && (
                                <img
                                  src={message.postReference.imageUrl.startsWith('http') 
                                    ? message.postReference.imageUrl 
                                    : `${API_BASE_URL.replace('/api', '')}${message.postReference.imageUrl}`}
                                  alt="Shared post"
                                  className="shared-post-image"
                                  onError={(e) => {
                                    console.error(`Failed to load image: ${message.postReference.imageUrl}`);
                                    e.target.src = "/default-post.png";
                                  }}
                                />
                              )}
                              <div className="shared-post-info">
                                <p className="shared-post-caption">
                                  {message.postReference.caption || "No caption"}
                                </p>
                                <p className="shared-post-hint">Click to view post</p>
                              </div>
                            </div>
                          )}
                          
                          <span className="message-time">{formatTime(message.createdAt)}</span>
                        </div>
                      </div>
                      </>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Preview area */}
            {previewFiles.length > 0 && (
              <div className="media-preview-container">
                {previewFiles.map((file, index) => (
                  <div key={index} className="media-preview-item">
                    {file.type === 'audio' ? (
          <div className="preview-audio">
            <audio controls src={file.preview} />
            <span>{file.duration}s</span>
          </div>
        ) : null}
                    {file.type === 'image' ? (
                      <img 
                        src={file.preview} 
                        alt="Preview" 
                        className="preview-image"
                      />
                    ) : file.type === 'video' ? (
                      <video 
                        src={file.preview} 
                        className="preview-video"
                        controls
                      />
                    ) : (
                      <div className="preview-document">
                      <DescriptionIcon />
                      <span>{file.filename || 'Document'}</span>
                    </div>
                    )}
                    <button 
                      className="remove-preview"
                      onClick={() => removePreview(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="message-input-container">
       
              <button 
                className="attach-button"
                onClick={() => fileInputRef.current.click()}
              >
                <AttachFileIcon />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.webm,.pdf"
                  style={{ display: 'none' }}
                />
              </button>
              <button 
  className="emoji-button"
  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
>
  <InsertEmoticonIcon />
</button>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="message-input"
              />
              
              <button 
                onClick={sendMessage} 
                className="send-button"
                disabled={!newMessage.trim() && mediaFiles.length === 0}
              >
                <SendIcon />
              </button>

              <button 
    className={`voice-button ${isRecording ? 'recording' : ''}`}
    onMouseDown={startRecording}
    onMouseUp={stopRecording}
    onTouchStart={startRecording}
    onTouchEnd={stopRecording}
    onMouseLeave={cancelRecording}
  >
    {isRecording ? (
      <>
        <span className="recording-dot"></span>
        <span>{recordingTime}s</span>
      </>
    ) : (
      <MicIcon />
    )}
  </button>
  {showEmojiPicker && (
  <div className="emoji-picker-container" ref={emojiPickerRef}>
    <EmojiPicker 
      onEmojiClick={(emojiObject) => {
        setNewMessage(prev => prev + emojiObject.emoji);
      }}
      width={300}
      height={350}
      previewConfig={{ showPreview: false }}
    />
  </div>
)}
            </div>
          {/* // Add the modal to your render */}
{showGroupInfo && selectedConversation && (
  <GroupInfoModal
    conversation={selectedConversation}
    currentUser={currentUser}
    onClose={(shouldRefresh) => {
      setShowGroupInfo(false);
      if (shouldRefresh) {
        fetchConversations();
      }
    }}
  />
)}
         
      {call.inProgress && (
        <Call
          callType={call.type}
          conversationId={activeConversation._id}
          currentUser={currentUser}
          otherUser={call.otherUser}
          onEndCall={endCall}
        />
      )}
    </>
        ) : (
          <div className="no-conversation-selected">
            <h3>Welcome to Vizz Chat</h3>
            <p>Select a conversation or search for users to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;














