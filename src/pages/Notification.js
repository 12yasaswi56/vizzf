import { useState, useEffect } from "react";
import { Avatar } from "@mui/material";
import socket from "../services/socket"; 
import { 
    getNotifications, 
    getUnreadNotificationsCount, 
    markAllNotificationsAsRead 
} from '../utils/api';
import "../pagesCss/Notification.css";

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            console.log("User not found in localStorage, redirecting...");
            window.location.href = "/login";
            return;
        }
    
        try {
            const parsedUser = JSON.parse(storedUser);
            if (!parsedUser || !parsedUser._id) {
                console.log("Invalid user data, redirecting...");
                window.location.href = "/login";
                return;
            }
    
            setCurrentUser(parsedUser);
        } catch (error) {
            console.error("Error parsing user data:", error);
            window.location.href = "/login";
            return;
        }
    
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [notifications, unreadData] = await Promise.all([
                    getNotifications(),
                    getUnreadNotificationsCount()
                ]);
                console.log("Notifications data:", notifications); // Add this line
                console.log("Profile pic sample:", notifications.length > 0 ? 
                    notifications[0].senderId?.profilePic : "No notifications");
                setNotifications(notifications);
                setUnreadCount(unreadData.unreadCount);
            } catch (error) {
                console.error("Error fetching notifications:", error);
                if (error.response?.status === 401) {
                    console.log("Unauthorized, redirecting...");
                    window.location.href = "/login";
                } else {
                    setError("Failed to load notifications.");
                }
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchData();
    
        const setupSocket = () => {
            socket.connect();
            socket.emit("joinUser", JSON.parse(storedUser)._id);
    
            socket.on("newNotification", (data) => {
                setNotifications((prev) => [data, ...prev]);
                setUnreadCount((prev) => prev + 1);
            });
    
            socket.on("connect_error", () => setTimeout(() => socket.connect(), 5000));
            socket.on("disconnect", () => socket.connect());
        };
    
        setupSocket();
    
        return () => socket.disconnect();
    }, []);
    

    const markAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setUnreadCount(0);
            setNotifications(prev => 
                prev.map(notification => ({ ...notification, isRead: true }))
            );
        } catch (error) {
            console.error("Error marking notifications as read:", error);
            alert("Failed to mark notifications as read");
        }
    };

    // Helper function to render notification text based on type
    const renderNotificationText = (notification) => {
        switch(notification.type) {
            case 'like':
                return `${notification.senderId?.username || 'Someone'} liked your post`;
            case 'comment':
                return `${notification.senderId?.username || 'Someone'} commented on your post`;
            case 'follow':
                return `${notification.senderId?.username || 'Someone'} started following you`;
            case 'unfollow':
                return `${notification.senderId?.username || 'Someone'} unfollowed you`;
            case 'save':
                return `${notification.senderId?.username || 'Someone'} saved your post`;
            case 'tag':
                return `${notification.senderId?.username || 'Someone'} tagged you in a post`;
            default:
                return notification.message || 'New notification';
        }
    };

    if (isLoading) {
        return (
            <div className="notification-container">
                <div className="loading-spinner">
                    Loading notifications...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="notification-container">
                <div className="error-message">
                    {error}
                    <button onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="notification-container">
            <div className="notification-header">
                <h2>Notifications</h2>
                {unreadCount > 0 && (
                    <button 
                        onClick={markAllAsRead} 
                        className="mark-read-btn"
                    >
                        Mark all as read ({unreadCount})
                    </button>
                )}
            </div>
            {notifications.length === 0 ? (
                <p>No notifications yet.</p>
            ) : (
                notifications.map((notification, index) => (
                    <div 
                        key={notification._id || index} 
                        className={`notification ${notification.isRead ? 'read' : 'unread'}`}
                    >
            <Avatar 
  src={
    notification.senderId?.profilePic ? 
    `${notification.senderId.profilePic.startsWith('http') ? '' : 'https://back-nipj.onrender.com'}${notification.senderId.profilePic}` : 
    "/default-avatar.png"
  } 
  alt={notification.senderId?.username || "User"}
/>
                        <div className="notification-content">
                            <p>
                                <strong>{notification.senderId?.username || "Someone"}</strong>{" "}
                                {renderNotificationText(notification)}
                            </p>
                            <span className="notification-time">
                                {new Date(notification.createdAt).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Notification;