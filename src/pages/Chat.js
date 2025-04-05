// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { Avatar } from "@mui/material";
// import SendIcon from "@mui/icons-material/Send";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import SearchIcon from "@mui/icons-material/Search";
// import AttachFileIcon from "@mui/icons-material/AttachFile";
// import DescriptionIcon from "@mui/icons-material/Description";
// import socket from '../services/socket';
// import "../pagesCss/chat.css";

// const API_BASE_URL = "http://localhost:5000/api";

// const Chat = () => {
//   const [conversations, setConversations] = useState([]);
//   const [activeConversation, setActiveConversation] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const messagesEndRef = useRef(null);
//   const [mediaFiles, setMediaFiles] = useState([]);
//   const [previewFiles, setPreviewFiles] = useState([]);
//   const fileInputRef = useRef(null);


//   const [confirmDelete, setConfirmDelete] = useState({
//     open: false,
//     messageId: null,
//     isUnsend: false
//   });


//   // Get current user from localStorage when component mounts
//   useEffect(() => {
//     const storedUser = JSON.parse(localStorage.getItem("user"));
//     if (!storedUser || !storedUser._id) {
//       alert("User session expired. Please log in again.");
//       window.location.href = "/login";
//       return;
//     }
//     setCurrentUser(storedUser);
//   }, []);

//   // Connect to socket and load conversations when component mounts
//   useEffect(() => {
//     if (!currentUser) return;

//     socket.connect();
//     fetchConversations();

//     // Listen for new messages
//     socket.on('newMessage', handleNewMessage);
    
//     // Listen for deleted messages
//     socket.on('messageDeleted', ({ messageId, conversationId, newLatestMessage }) => {
//       // Update messages list
//       setMessages(prev => prev.filter(msg => msg._id !== messageId));
      
//       // Update conversations list if needed
//       setConversations(prev => 
//         prev.map(conv => {
//           if (conv._id === conversationId) {
//             return {
//               ...conv,
//               latestMessage: newLatestMessage || conv.latestMessage
//             };
//           }
//           return conv;
//         })
//       );
//     });
    
//     return () => {
//       socket.off('newMessage', handleNewMessage);
//       socket.off('messageDeleted');
//       socket.disconnect();
//     };
//   }, [currentUser]);

//   // Auto-scroll to bottom when messages change
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Join conversation room when active conversation changes
//   useEffect(() => {
//     if (activeConversation) {
//       socket.emit('joinConversation', activeConversation._id);
//       fetchMessages(activeConversation._id);
//     }
    
//     return () => {
//       if (activeConversation) {
//         socket.emit('leaveConversation', activeConversation._id);
//       }
//     };
//   }, [activeConversation]);

//   // Debug message sender data when messages are loaded
//   useEffect(() => {
//     if (messages.length > 0) {
//       console.log('Message sender data:', messages.map(m => ({
//         id: m._id,
//         sender: m.senderId.username,
//         profilePic: m.senderId.profilePic
//       })));
//     }
//   }, [messages]);

//   const fetchConversations = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE_URL}/conversations`, {
//         params: { userId: currentUser._id }
//       });
//       setConversations(response.data);
//     } catch (err) {
//       console.error("Error fetching conversations:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchMessages = async (conversationId) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE_URL}/messages/${conversationId}`);
//       setMessages(response.data);
//       console.log("Messages with image data:", response.data.filter(m => m.postReference?.imageUrl).map(m => ({
//         id: m._id,
//         content: m.content,
//         imageUrl: m.postReference?.imageUrl,
//         fullPath: m.postReference?.imageUrl.startsWith('http') 
//           ? m.postReference.imageUrl 
//           : `${API_BASE_URL.replace('/api', '')}${m.postReference.imageUrl}`
//       })));
//     } catch (err) {
//       console.error("Error fetching messages:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleNewMessage = (message) => {
//     if (activeConversation && message.conversationId === activeConversation._id) {
//       setMessages(prevMessages => [...prevMessages, message]);
//       scrollToBottom();
//     }
    
//     // Update the conversation list to show the latest message
//     setConversations(prevConversations => 
//       prevConversations.map(conv => 
//         conv._id === message.conversationId 
//           ? { ...conv, latestMessage: message }
//           : conv
//       )
//     );
//   };

//   const deleteMessage = async (messageId) => {
//     if (!messageId || !activeConversation?._id || !currentUser?._id) return;
    
//     try {
//       await axios.delete(`${API_BASE_URL}/messages/${messageId}`, {
//         data: { userId: currentUser._id }
//       });
      
//       // The socket event will handle the UI update
//     } catch (err) {
//       console.error('Error deleting message:', err);
//       alert('Failed to delete message. Please try again.');
//     }
//   };

//   const unsendMessage = async (messageId) => {
//     if (!messageId || !activeConversation?._id || !currentUser?._id) return;
    
//     try {
//       await axios.delete(`${API_BASE_URL}/messages/unsend/${messageId}`, {
//         data: { userId: currentUser._id }
//       });
      
//       // The socket event will handle the UI update
//     } catch (err) {
//       console.error('Error unsending message:', err);
//       alert(err.response?.data?.error || 'Failed to unsend message. Please try again.');
//     }
//   };

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
    
//     // Check file types before setting state
//     const allowedTypes = [
//       'image/jpeg',
//       'image/png',
//       'image/gif',
//       'image/webp',
//       'video/mp4',
//       'video/quicktime',
//       'video/webm',
//       'application/pdf'
//     ];
    
//     const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
//     if (invalidFiles.length > 0) {
//       alert(`These file types are not supported: ${invalidFiles.map(f => f.type).join(', ')}`);
//       return;
//     }
    
//     setMediaFiles(files);
    
//     // Create previews
//     const previews = files.map(file => ({
//       file,
//       preview: URL.createObjectURL(file),
//       type: file.type.split('/')[0] === 'image' ? 'image' : 
//             file.type.split('/')[0] === 'video' ? 'video' : 'document'
//     }));
    
//     setPreviewFiles(previews);
//   };

//   const removePreview = (index) => {
//     const newPreviews = [...previewFiles];
//     URL.revokeObjectURL(newPreviews[index].preview);
//     newPreviews.splice(index, 1);
//     setPreviewFiles(newPreviews);
    
//     const newFiles = [...mediaFiles];
//     newFiles.splice(index, 1);
//     setMediaFiles(newFiles);
//   };

//   const uploadFiles = async () => {
//     if (mediaFiles.length === 0) return [];
    
//     try {
//       const formData = new FormData();
//       mediaFiles.forEach(file => {
//         formData.append('files', file);
//       });
      
//       const response = await axios.post(`${API_BASE_URL}/uploads`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         },
//         withCredentials: true
//       });
      
//       return response.data.files;
//     } catch (err) {
//       console.error('Error uploading files:', err);
//       if (err.response?.data?.error?.includes('Invalid file type')) {
//         alert('The file type you tried to upload is not supported. Please use images (JPEG, PNG, GIF), videos (MP4, MOV), or PDFs.');
//       } else {
//         alert('Failed to upload files. Please try again.');
//       }
//       return [];
//     }
//   };

//   const sendMessage = async () => {
//     if (!newMessage.trim() && mediaFiles.length === 0 && !activeConversation) return;
    
//     try {
//       // Upload files first if there are any
//       let uploadedMedia = [];
//       if (mediaFiles.length > 0) {
//         uploadedMedia = await uploadFiles();
//         console.log('Uploaded media:', uploadedMedia);
//       }

//       // Create the message payload
//       const messageData = {
//         conversationId: activeConversation._id,
//         senderId: currentUser._id,
//         content: newMessage,
//         media: uploadedMedia
//       };

//       console.log('Sending message data:', messageData);

//       // Create temp message for UI
//       const tempMessage = {
//         _id: `temp-${Date.now()}`,
//         ...messageData,
//         senderId: {
//           _id: currentUser._id,
//           username: currentUser.username,
//           profilePic: currentUser.profilePic
//         },
//         createdAt: new Date(),
//         isTemp: true
//       };

//       // Update UI
//       setMessages(prev => [...prev, tempMessage]);
//       setConversations(prev => 
//         prev.map(conv => 
//           conv._id === activeConversation._id 
//             ? { ...conv, latestMessage: tempMessage }
//             : conv
//         )
//       );
      
//       // Clear inputs
//       setNewMessage("");
//       setMediaFiles([]);
//       setPreviewFiles([]);

//       // Send to server
//       const response = await axios.post(`${API_BASE_URL}/messages`, messageData);

//       // Replace temp message with server response
//       setMessages(prev => 
//         prev.map(msg => 
//           msg.isTemp && msg._id === tempMessage._id 
//             ? response.data 
//             : msg
//         )
//       );
      
//       scrollToBottom();
//     } catch (err) {
//       console.error("Error sending message:", err.response?.data || err.message);
//       setMessages(prev => 
//         prev.filter(msg => msg._id !== `temp-${Date.now()}`)
//       );
//       alert('Failed to send message. Please try again.');
//     }
//   };

//   const searchUsers = async () => {
//     if (!searchQuery.trim()) return;
    
//     try {
//       const response = await axios.get(`${API_BASE_URL}/users/search`, {
//         params: { query: searchQuery }
//       });
//       setUsers(response.data.filter(user => user._id !== currentUser._id));
//     } catch (err) {
//       console.error("Error searching users:", err);
//     }
//   };

//   const startNewConversation = async (userId) => {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/conversations`, {
//         participants: [currentUser._id, userId]
//       });
      
//       setConversations(prev => [response.data, ...prev]);
//       setActiveConversation(response.data);
//       setUsers([]);
//       setSearchQuery("");
//     } catch (err) {
//       console.error("Error starting conversation:", err);
//     }
//   };

//   const scrollToBottom = () => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   const getConversationName = (conversation) => {
//     if (!conversation?.participants || !currentUser) return "Chat";
//     const otherParticipant = conversation.participants.find(
//       p => p._id !== currentUser._id
//     );
//     return otherParticipant?.username || "Unknown User";
//   };

//   const getConversationImage = (conversation) => {
//     if (!conversation?.participants || !currentUser) return "/default-avatar.png";
    
//     const otherParticipant = conversation.participants.find(
//       p => p._id !== currentUser._id
//     );
    
//     const imageUrl = otherParticipant?.profilePic 
//       ? `${API_BASE_URL.replace('/api', '')}${otherParticipant.profilePic}` 
//       : "/default-avatar.png";
    
//     console.log('Corrected Image URL:', imageUrl);
    
//     return imageUrl;
//   };

//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const isCurrentUserMessage = (message) => {
//     return message.senderId._id === currentUser?._id;
//   };

//   const shouldShowAvatar = (message, index) => {
//     if (isCurrentUserMessage(message)) return false;
//     if (index === 0) return true;
//     const prevMessage = messages[index - 1];
//     return prevMessage.senderId._id !== message.senderId._id;
//   };

//   const renderMessageMedia = (media) => {
//     return media.map((item, index) => {
//       const mediaUrl = item.url.startsWith('http') 
//       ? item.url 
//       : `${API_BASE_URL.replace('/api', '')}${item.url}`;
//       switch(item.type) {
//         case 'image':
//           return (
//             <div key={index} className="media-container">
//               <img 
//                 src={mediaUrl}
//                 alt="Shared media"
//                 className="message-media"
//                 onError={(e) => {
//                   console.error(`Failed to load image: ${mediaUrl}`);
//                   e.target.src = "/default-image.png";
//                 }}
//               />
//             </div>
//           );
//         case 'video':
//           return (
//             <div key={index} className="media-container">
//               <video controls className="message-media">
//                 <source 
//                   src={item.url.startsWith('http') ? item.url : `${API_BASE_URL}${item.url}`}
//                   type="video/mp4"
//                 />
//                 Your browser does not support the video tag.
//               </video>
//             </div>
//           );
//         case 'document':
//           return (
//             <div key={index} className="document-container">
//               <a 
//                 href={item.url.startsWith('http') ? item.url : `${API_BASE_URL}${item.url}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 <div className="document-icon">
//                   <DescriptionIcon />
//                 </div>
//                 <span>{item.filename || 'Document'}</span>
//               </a>
//             </div>
//           );
//         default:
//           return null;
//       }
//     });
//   };

// const ConfirmationDialog = () => (
//   <div className={`confirmation-dialog ${confirmDelete.open ? 'open' : ''}`}>
//     <div className="confirmation-content">
//       <p>{confirmDelete.isUnsend 
//         ? "Are you sure you want to unsend this message?" 
//         : "Are you sure you want to delete this message?"}</p>
//       <div className="confirmation-buttons">
//         <button 
//           className="cancel-btn"
//           onClick={() => setConfirmDelete({ open: false, messageId: null })}
//         >
//           Cancel
//         </button>
//         <button 
//           className="confirm-btn"
//           onClick={() => {
//             if (confirmDelete.isUnsend) {
//               unsendMessage(confirmDelete.messageId);
//             } else {
//               deleteMessage(confirmDelete.messageId);
//             }
//             setConfirmDelete({ open: false, messageId: null });
//           }}
//         >
//           Confirm
//         </button>
//       </div>
//     </div>
//   </div>
// );
  
//   return (
//     <div className="chat-container">
//       {activeConversation && <ConfirmationDialog />}
//       {/* Left Panel - Conversations List */}
//       <div className="conversations-panel">
//         <div className="search-container">
//           <div className="search-input-container">
//             <SearchIcon className="search-icon" />
//             <input
//               type="text"
//               placeholder="Search users..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
//               className="search-input"
//             />
//           </div>
//           <button onClick={searchUsers} className="search-button">Search</button>
//         </div>

//         {/* Search Results */}
//         {users.length > 0 && (
//           <div className="search-results">
//             <h3>Users</h3>
//             {users.map(user => (
//               <div 
//                 key={user._id} 
//                 className="user-item"
//                 onClick={() => startNewConversation(user._id)}
//               >
//                 <Avatar 
//                   src={user.profilePic 
//                     ? `${API_BASE_URL.replace('/api', '')}${user.profilePic}` 
//                     : "/default-avatar.png"
//                   } 
//                 />
//                 <div className="user-info">
//                   <p className="username">{user.username}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         <h3>Messages</h3>
        
//         {loading && conversations.length === 0 ? (
//           <p className="loading">Loading conversations...</p>
//         ) : (
//           <div className="conversations-list">
//             {conversations.length === 0 ? (
//               <p className="no-conversations">No conversations yet. Search for users to start chatting!</p>
//             ) : (
//               conversations.map(conversation => (
//                 <div 
//                   key={conversation._id} 
//                   className={`conversation-item ${activeConversation?._id === conversation._id ? 'active' : ''}`}
//                   onClick={() => setActiveConversation(conversation)}
//                 >
//                   <Avatar src={getConversationImage(conversation)} />
//                   <div className="conversation-info">
//                     <p className="conversation-name">{getConversationName(conversation)}</p>
//                     <p className="last-message">
//                       {conversation.latestMessage?.content || "Start chatting!"}
//                     </p>
//                   </div>
//                   {conversation.latestMessage && (
//                     <span className="timestamp">{formatTime(conversation.latestMessage.createdAt)}</span>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         )}
//       </div>

//       {/* Right Panel - Active Conversation */}
//       <div className="conversation-panel">
//         {activeConversation ? (
//           <>
//             <div className="conversation-header">
//               <button 
//                 className="back-button"
//                 onClick={() => setActiveConversation(null)}
//               >
//                 <ArrowBackIcon />
//               </button>
//               <Avatar src={getConversationImage(activeConversation)} />
//               <h3>{getConversationName(activeConversation)}</h3>
//             </div>

//             <div className="messages-container">
//               {loading ? (
//                 <p className="loading">Loading messages...</p>
//               ) : (
//                 <>
//                   {messages.length === 0 ? (
//                     <p className="no-messages">No messages yet. Say hello!</p>
//                   ) : (
//                     messages.map((message, index) => {
//                       const isSender = isCurrentUserMessage(message);
//                       const showAvatar = shouldShowAvatar(message, index);
//                       const hasPostReference = message.postReference && message.postReference.postId;
//                       const hasMedia = message.media && message.media.length > 0;
                      
//                       return (
//                         <div key={message._id || index} className={`message-row ${isSender ? 'sender-row' : 'receiver-row'}`}>
//                           {!isSender && showAvatar && (
//                             <Avatar
//                               src={message.senderId?.profilePic 
//                                 ? `${API_BASE_URL.replace('/api', '')}${message.senderId.profilePic}` 
//                                 : "/default-avatar.png"}
//                               className="message-avatar"
//                               sx={{ width: 28, height: 28 }}
//                               onError={(e) => {
//                                 console.error('Avatar load error:', e);
//                                 e.target.src = "/default-avatar.png";
//                               }}
//                             />
//                           )}
//                           {!isSender && !showAvatar && <div className="avatar-placeholder"></div>}
//                           <div className={`message ${isSender ? 'sent' : 'received'} ${message.isTemp ? 'temp-message' : ''}`}>
//                           {isSender && (
//   <div className="message-actions">
//     <button 
//       className="message-action-btn"
//       onClick={(e) => {
//         e.stopPropagation();
//         setConfirmDelete({
//           open: true,
//           messageId: message._id,
//           isUnsend: false
//         });
//       }}
//     >
//       Delete
//     </button>
//     {Date.now() - new Date(message.createdAt).getTime() < 5 * 60 * 1000 && (
//       <button 
//         className="message-action-btn"
//         onClick={(e) => {
//           e.stopPropagation();
//           setConfirmDelete({
//             open: true,
//             messageId: message._id,
//             isUnsend: true
//           });
//         }}
//       >
//         Unsend
//       </button>
//     )}
//   </div>
// )}
//                             <p>{message.content}</p>
                            
//                             {hasMedia && (
//                               <div className="message-media-container">
//                                 {renderMessageMedia(message.media)}
//                               </div>
//                             )}
                            
//                             {hasPostReference && (
//                               <div 
//                                 className="shared-post-preview" 
//                                 onClick={() => window.location.href = `/post/${message.postReference.postId}`}
//                               >
//                                 {message.postReference.imageUrl && (
//                                   <img
//                                     src={message.postReference.imageUrl.startsWith('http') 
//                                       ? message.postReference.imageUrl 
//                                       : `${API_BASE_URL.replace('/api', '')}${message.postReference.imageUrl}`}
//                                     alt="Shared post"
//                                     className="shared-post-image"
//                                     onError={(e) => {
//                                       console.error(`Failed to load image: ${message.postReference.imageUrl}`);
//                                       e.target.src = "/default-post.png";
//                                     }}
//                                   />
//                                 )}
//                                 <div className="shared-post-info">
//                                   <p className="shared-post-caption">
//                                     {message.postReference.caption || "No caption"}
//                                   </p>
//                                   <p className="shared-post-hint">Click to view post</p>
//                                 </div>
//                               </div>
//                             )}
                            
//                             <span className="message-time">{formatTime(message.createdAt)}</span>
//                           </div>
//                         </div>
//                       );
//                     })
//                   )}
//                   <div ref={messagesEndRef} />
//                 </>
//               )}
//             </div>

//             {/* Preview area */}
//             {previewFiles.length > 0 && (
//               <div className="media-preview-container">
//                 {previewFiles.map((file, index) => (
//                   <div key={index} className="media-preview-item">
//                     {file.type === 'image' ? (
//                       <img 
//                         src={file.preview} 
//                         alt="Preview" 
//                         className="preview-image"
//                       />
//                     ) : file.type === 'video' ? (
//                       <video 
//                         src={file.preview} 
//                         className="preview-video"
//                         controls
//                       />
//                     ) : (
//                       <div className="preview-document">
//                         <DescriptionIcon />
//                         <span>{file.file.name}</span>
//                       </div>
//                     )}
//                     <button 
//                       className="remove-preview"
//                       onClick={() => removePreview(index)}
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}

//             <div className="message-input-container">
//               <button 
//                 className="attach-button"
//                 onClick={() => fileInputRef.current.click()}
//               >
//                 <AttachFileIcon />
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   onChange={handleFileChange}
//                   multiple
//                   accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.webm,.pdf"
//                   style={{ display: 'none' }}
//                 />
//               </button>
              
//               <input
//                 type="text"
//                 placeholder="Type a message..."
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
//                 className="message-input"
//               />
              
//               <button 
//                 onClick={sendMessage} 
//                 className="send-button"
//                 disabled={!newMessage.trim() && mediaFiles.length === 0}
//               >
//                 <SendIcon />
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="no-conversation-selected">
//             <h3>Welcome to Vizz Chat</h3>
//             <p>Select a conversation or search for users to start chatting</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Chat;



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

const API_BASE_URL = "http://localhost:5000/api";

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



  // Add these state variables
const [isRecording, setIsRecording] = useState(false);
const [mediaRecorder, setMediaRecorder] = useState(null);
const [audioChunks, setAudioChunks] = useState([]);
const [audioUrl, setAudioUrl] = useState(null);
const [recordingTime, setRecordingTime] = useState(0);
const timerRef = useRef(null);
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

  const handleNewMessage = (message) => {
    if (activeConversation && message.conversationId === activeConversation._id) {
      setMessages(prevMessages => [...prevMessages, message]);
      scrollToBottom();
    }
    
    // Update the conversation list to show the latest message
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv._id === message.conversationId 
          ? { ...conv, latestMessage: message }
          : conv
      )
    );
  };

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
    // if (!newMessage.trim() && mediaFiles.length === 0 && !activeConversation) return;
     // Should be:
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
      const response = await axios.post(`${API_BASE_URL}/messages`, messageData);

      // Replace temp message with server response
      setMessages(prev => 
        prev.map(msg => 
          msg.isTemp && msg._id === tempMessage._id 
            ? response.data 
            : msg
        )
      );
      
      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err.response?.data || err.message);
      setMessages(prev => 
        prev.filter(msg => msg._id !== `temp-${Date.now()}`)
      );
      alert('Failed to send message. Please try again.');
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

  const getConversationName = (conversation) => {
    if (!conversation?.participants || !currentUser) return "Chat";
    const otherParticipant = conversation.participants.find(
      p => p._id !== currentUser._id
    );
    return otherParticipant?.username || "Unknown User";
  };

  const getConversationImage = (conversation) => {
    if (!conversation?.participants || !currentUser) return "/default-avatar.png";
    
    const otherParticipant = conversation.participants.find(
      p => p._id !== currentUser._id
    );
    
    const imageUrl = otherParticipant?.profilePic 
      ? `${API_BASE_URL.replace('/api', '')}${otherParticipant.profilePic}` 
      : "/default-avatar.png";
    
    console.log('Corrected Image URL:', imageUrl);
    
    return imageUrl;
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
  
  return (
    <div className="chat-container">
      {activeConversation && <ConfirmationDialog />}
      {/* Left Panel - Conversations List */}
      <div className="conversations-panel">
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
                  src={user.profilePic 
                    ? `${API_BASE_URL.replace('/api', '')}${user.profilePic}` 
                    : "/default-avatar.png"
                  } 
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
                  onClick={() => setActiveConversation(conversation)}
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
      <div className="conversation-panel">
        {activeConversation ? (
          <>
            <div className="conversation-header">
              <button 
                className="back-button"
                onClick={() => setActiveConversation(null)}
              >
                <ArrowBackIcon />
              </button>
              <Avatar src={getConversationImage(activeConversation)} />
              <h3>{getConversationName(activeConversation)}</h3>
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
                      const hasPostReference = message.postReference && message.postReference.postId;
                      const hasMedia = message.media && message.media.length > 0;
                      
                      return (
                        <div key={message._id || index} className={`message-row ${isSender ? 'sender-row' : 'receiver-row'}`}>
                          {!isSender && showAvatar && (
                            <Avatar
                              src={message.senderId?.profilePic 
                                ? `${API_BASE_URL.replace('/api', '')}${message.senderId.profilePic}` 
                                : "/default-avatar.png"}
                              className="message-avatar"
                              sx={{ width: 28, height: 28 }}
                              onError={(e) => {
                                console.error('Avatar load error:', e);
                                e.target.src = "/default-avatar.png";
                              }}
                            />
                          )}
                          {!isSender && !showAvatar && <div className="avatar-placeholder"></div>}
                          <div className={`message ${isSender ? 'sent' : 'received'} ${message.isTemp ? 'temp-message' : ''}`}>
                          {isSender && (
  <div className="message-actions">
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
                            <p>{message.content}</p>
                            
                            {hasMedia && (
                              <div className="message-media-container">
                                {renderMessageMedia(message.media)}
                              </div>
                            )}
                            
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
            </div>
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














