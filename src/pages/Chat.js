// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { Avatar } from "@mui/material";
// import SendIcon from "@mui/icons-material/Send";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import SearchIcon from "@mui/icons-material/Search";
// import socket from '../services/socket';
// import "../pagesCss/chat.css";

// const API_BASE_URL = "https://social-backend-1-qi8q.onrender.com/api";

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
    
//     return () => {
//       socket.off('newMessage', handleNewMessage);
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

//   const sendMessage = async () => {
//     if (!newMessage.trim() || !activeConversation) return;
    
//     try {
//       // Create a temporary message to display immediately
//       const tempMessage = {
//         _id: `temp-${Date.now()}`, // temporary ID
//         conversationId: activeConversation._id,
//         senderId: {
//           _id: currentUser._id,
//           username: currentUser.username,
//           profilePic: currentUser.profilePic
//         },
//         content: newMessage,
//         createdAt: new Date(),
//         isTemp: true // flag to identify temp messages
//       };
      
//       // Add message to UI immediately
//       setMessages(prevMessages => [...prevMessages, tempMessage]);
      
//       // Update conversations list with latest message
//       setConversations(prevConversations => 
//         prevConversations.map(conv => 
//           conv._id === activeConversation._id 
//             ? { ...conv, latestMessage: tempMessage }
//             : conv
//         )
//       );
      
//       // Clear input
//       const messageCopy = newMessage;
//       setNewMessage("");
      
//       // Actually send the message to server
//       const response = await axios.post(`${API_BASE_URL}/messages`, {
//         conversationId: activeConversation._id,
//         senderId: currentUser._id,
//         content: messageCopy
//       });
      
//       // If needed, replace the temp message with the real one from server
//       // This step might not be necessary if you solely rely on socket updates
//       setMessages(prevMessages => 
//         prevMessages.map(msg => 
//           msg.isTemp && msg._id === tempMessage._id 
//             ? response.data 
//             : msg
//         )
//       );
      
//       // Scroll to bottom again to ensure visibility
//       scrollToBottom();
//     } catch (err) {
//       console.error("Error sending message:", err);
//       // If error, you might want to show an error and remove the temp message
//       setMessages(prevMessages => 
//         prevMessages.filter(msg => msg._id !== `temp-${Date.now()}`)
//       );
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
//       (p) => p._id !== currentUser._id
//     );
  
//     if (otherParticipant && otherParticipant.profilePic) {
//       return otherParticipant.profilePic;
//     } else {
//         const otherUserId = conversation.participants.find(id => id !== currentUser._id);
//         if(typeof otherUserId === 'string'){
//             const user = users.find(user => user._id === otherUserId);
//             return user?.profilePic || "/default-avatar.png"
//         }
//         return "/default-avatar.png";
//     }
//   };

//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   // Function to check if message is from current user
//   const isCurrentUserMessage = (message) => {
//     return message.senderId._id === currentUser?._id;
//   };

//   // Function to check if we should show the sender avatar
//   // Only show avatar for received messages
//   const shouldShowAvatar = (message, index) => {
//     // If it's a sent message, don't show avatar
//     if (isCurrentUserMessage(message)) return false;

//     // For received messages, check if it's the first message or from a different sender than previous
//     if (index === 0) return true;
//     const prevMessage = messages[index - 1];
    
//     // Show avatar if sender changed
//     return prevMessage.senderId._id !== message.senderId._id;
//   };

//   return (
//     <div className="chat-container">
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
//                 <Avatar src={user.profilePic || "/default-avatar.png"} />
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

            

// <div className="messages-container">
//   {loading ? (
//     <p className="loading">Loading messages...</p>
//   ) : (
//     <>
//       {messages.length === 0 ? (
//         <p className="no-messages">No messages yet. Say hello!</p>
//       ) : (
//         messages.map((message, index) => {
//           const isSender = isCurrentUserMessage(message);
//           const showAvatar = shouldShowAvatar(message, index);
//           const hasPostReference = message.postReference && message.postReference.postId;
//           console.log('Rendering message:', message._id, 'hasPostRef:', !!message.postReference?.postId);
//   if (message.postReference) {
//     console.log('PostRef details:', JSON.stringify(message.postReference));
//   }
  
//           return (
//             <div key={message._id || index} className={`message-row ${isSender ? 'sender-row' : 'receiver-row'}`}>
//               {!isSender && showAvatar && (
//               <Avatar 
//               src={message.senderId.profilePic ? `${API_BASE_URL}${message.senderId.profilePic}` : "/default-avatar.png"} 
//               className="message-avatar"
//               sx={{ width: 28, height: 28 }}
//             />
//               )}
//               {!isSender && !showAvatar && <div className="avatar-placeholder"></div>}
//               <div className={`message ${isSender ? 'sent' : 'received'} ${message.isTemp ? 'temp-message' : ''}`}>
//                 <p>{message.content}</p>
                
//                 {/* Display shared post if exists */}
// {/* Display shared post if exists */}
// {hasPostReference && message.postReference.imageUrl && (
//           <div className="shared-post-preview" onClick={() => window.location.href = `/post/${message.postReference.postId}`}>
//             <img
//               src={message.postReference.imageUrl}
//               alt="Shared post"
//               className="shared-post-image"
//               onError={(e) => {
//                 console.error(`Failed to load image: ${message.postReference.imageUrl}`);
//                 e.target.style.display = "none";
//               }}
//             />
//             <div className="shared-post-info">
//               <p className="shared-post-caption">
//                 {message.postReference.caption || "No caption"}
//               </p>
//               <p className="shared-post-hint">Click to view post</p>
//             </div>
//           </div>
//         )}
                
//                 <span className="message-time">{formatTime(message.createdAt)}</span>
//               </div>
//             </div>
//           );
//         })
//       )}
//       <div ref={messagesEndRef} />
//     </>
//   )}
// </div>

//             <div className="message-input-container">
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
//                 disabled={!newMessage.trim()}
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
    
    return () => {
      socket.off('newMessage', handleNewMessage);
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    try {
      // Create a temporary message to display immediately
      const tempMessage = {
        _id: `temp-${Date.now()}`, // temporary ID
        conversationId: activeConversation._id,
        senderId: {
          _id: currentUser._id,
          username: currentUser.username,
          profilePic: currentUser.profilePic
        },
        content: newMessage,
        createdAt: new Date(),
        isTemp: true // flag to identify temp messages
      };
      
      // Add message to UI immediately
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      
      // Update conversations list with latest message
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv._id === activeConversation._id 
            ? { ...conv, latestMessage: tempMessage }
            : conv
        )
      );
      
      // Clear input
      const messageCopy = newMessage;
      setNewMessage("");
      
      // Actually send the message to server
      const response = await axios.post(`${API_BASE_URL}/messages`, {
        conversationId: activeConversation._id,
        senderId: currentUser._id,
        content: messageCopy
      });
      
      // If needed, replace the temp message with the real one from server
      // This step might not be necessary if you solely rely on socket updates
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.isTemp && msg._id === tempMessage._id 
            ? response.data 
            : msg
        )
      );
      
      // Scroll to bottom again to ensure visibility
      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err);
      // If error, you might want to show an error and remove the temp message
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg._id !== `temp-${Date.now()}`)
      );
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
    return otherParticipant?.profilePic ? `${API_BASE_URL}${otherParticipant.profilePic}` : "/default-avatar.png";
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to check if message is from current user
  const isCurrentUserMessage = (message) => {
    return message.senderId._id === currentUser?._id;
  };

  // Function to check if we should show the sender avatar
  // Only show avatar for received messages
  const shouldShowAvatar = (message, index) => {
  // If it's a sent message, don't show avatar
  if (isCurrentUserMessage(message)) return false;

  // For received messages, check if it's the first message or from a different sender than previous
  if (index === 0) return true;
  const prevMessage = messages[index - 1];

  // Show avatar if sender changed
  return prevMessage.senderId._id !== message.senderId._id;
};
  return (
    <div className="chat-container">
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
                  src={user.profilePic ? `${API_BASE_URL}${user.profilePic}` : "/default-avatar.png"} 
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
            console.log("message sender id:", message.senderId);
            return (
              <div key={message._id || index} className={`message-row ${isSender ? 'sender-row' : 'receiver-row'}`}>
                {!isSender && showAvatar && (
                  <Avatar
                    src={message.senderId?.profilePic || "/default-avatar.png"}
                    className="message-avatar"
                    sx={{ width: 28, height: 28 }}
                  />
                )}
                {!isSender && !showAvatar && <div className="avatar-placeholder"></div>}
                <div className={`message ${isSender ? 'sent' : 'received'} ${message.isTemp ? 'temp-message' : ''}`}>
                  <p>{message.content}</p>
                  {hasPostReference && message.postReference.imageUrl && (
                    <div className="shared-post-preview" onClick={() => (window.location.href = `/post/${message.postReference.postId}`)}>
                      <img
                        src={message.postReference.imageUrl}
                        alt="Shared post"
                        className="shared-post-image"
                        onError={(e) => {
                          console.error(`Failed to load image: ${message.postReference.imageUrl}`);
                          e.target.style.display = "none";
                        }}
                      />
                      <div className="shared-post-info">
                        <p className="shared-post-caption">{message.postReference.caption || "No caption"}</p>
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
);

            <div className="message-input-container">
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
                disabled={!newMessage.trim()}
              >
                <SendIcon />
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










