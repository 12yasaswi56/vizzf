import { useState, useEffect } from "react";
import axios from "axios";
import { Avatar } from "@mui/material";
import socket from "../services/socket"; 
import "../pagesCss/Notification.css";

const API_BASE_URL = "http://localhost:5000/api";

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser._id) {
            alert("User session expired. Please log in again.");
            return;
        }
        setCurrentUser(storedUser);

        fetchNotifications(storedUser._id);

        socket.connect();
        socket.emit("joinUser", storedUser._id);

        socket.on("newNotification", (data) => {
            console.log("Received new notification:", data);
            setNotifications((prev) => [data, ...prev]);
        });

        // Add reconnection logic
        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            // Try to reconnect after delay
            setTimeout(() => socket.connect(), 5000);
        });
        
        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
            if (reason === "io server disconnect") {
                // Reconnect if server disconnected
                socket.connect();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchNotifications = async (userId) => {
        try {
            if (!userId) return;
            const response = await axios.get(`${API_BASE_URL}/notifications/${userId}`);
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    return (
        <div className="notification-container">
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
                <p>No notifications yet.</p>
            ) : (
                notifications.map((notification, index) => (
                    <div key={notification._id || index} className="notification">
                        <Avatar src={
                            notification.senderId?.profilePic || 
                            notification.senderPic || 
                            "/default-avatar.png"
                        } />
                        <div className="notification-content">
                            <p>
                                <strong>{notification.senderId?.username || "Someone"}</strong> {notification.message}
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