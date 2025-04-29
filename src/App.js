import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { CometChat } from "@cometchat-pro/chat";
import { COMETCHAT_CONFIG } from "./utils/config";


import Login from "./pages/Login";
import MainPage from "./pages/MainPage";
import Home from "./pages/Home";
import Chat from "./pages/Chat"
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import PostDetail from "./pages/PostDetail";
import Notification from "./pages/Notification";
import Settings from "./pages/Settings";
import Reels from './pages/Reels';
import ReelUpload from './components/ReelUpload';
import JobSearchPage from './pages/JobSearchPage';
const App = () => {
  // const [user, setUser] = useState(null);
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  useEffect(() => {
    if (!CometChat) {
      console.error("❌ CometChat Library Not Loaded");
      return;
    }

    // Use the correct initialization format
    const appSetting = new CometChat.AppSettingsBuilder()
      .subscribePresenceForAllUsers()
      .setRegion(COMETCHAT_CONFIG.REGION)
      .build();

    CometChat.init(COMETCHAT_CONFIG.APP_ID, appSetting)
      .then(() => {
        console.log("✅ CometChat Initialized Successfully");
      })
      .catch((error) => {
        console.error("❌ CometChat Initialization Failed:", error);
      });
  }, []);

  return (
    <Router>
      <Routes>
      <Route path="/" element={<MainPage />} />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/edit-profile/:userId" element={<EditProfile />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/notifications" element={<Notification />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/reels/create" element={<ReelUpload />} />
        <Route path="/jobs" element={<JobSearchPage />} />
      </Routes>
    </Router>
  );
};

export default App;