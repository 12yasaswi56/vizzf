import React, { useState, useEffect, useRef } from 'react';
import { FaPhone, FaVideo, FaTimes, FaMicrophone, FaMicrophoneSlash, FaVideoSlash } from 'react-icons/fa';
import Peer from 'simple-peer';
import io from 'socket.io-client';

const Call = ({ callType, conversationId, currentUser, otherUser, onEndCall }) => {
  const [callStatus, setCallStatus] = useState('calling');
  const [stream, setStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  
  const userVideo = useRef();
  const peerVideo = useRef();
  const socketRef = useRef();
  const callInterval = useRef();

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('https://back-nipj.onrender.com/');

    // Get user media
    navigator.mediaDevices.getUserMedia({
      video: callType === 'video',
      audio: true
    }).then(stream => {
      setStream(stream);
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    // Set up socket listeners
    socketRef.current.on('callAccepted', signal => {
      setCallStatus('active');
      peer.signal(signal);
    });

    socketRef.current.on('callEnded', () => {
      endCall();
    });

    // Start call timer when call is active
    if (callStatus === 'active') {
      setCallStartTime(Date.now());
      callInterval.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peer) peer.destroy();
      if (socketRef.current) socketRef.current.disconnect();
      clearInterval(callInterval.current);
    };
  }, [callStatus]);

  const endCall = () => {
    if (peer) peer.destroy();
    if (stream) stream.getTracks().forEach(track => track.stop());
    if (socketRef.current) {
      socketRef.current.emit('endCall', { conversationId });
      socketRef.current.disconnect();
    }
    clearInterval(callInterval.current);
    onEndCall();
  };

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <div className="call-container">
      {callType === 'video' && (
        <div className="video-container">
          <video 
            playsInline 
            muted 
            ref={userVideo} 
            autoPlay 
            className="user-video"
            style={{ display: isVideoOff ? 'none' : 'block' }}
          />
          <video 
            playsInline 
            ref={peerVideo} 
            autoPlay 
            className="peer-video"
          />
        </div>
      )}
      
      <div className="call-controls">
        <div className="call-info">
          <p>{otherUser.username}</p>
          <p>{callStatus === 'active' ? formatCallDuration(callDuration) : callStatus}</p>
        </div>
        
        <div className="call-buttons">
          <button onClick={toggleMute} className={isMuted ? 'active' : ''}>
            {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
          
          {callType === 'video' && (
            <button onClick={toggleVideo} className={isVideoOff ? 'active' : ''}>
              {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
            </button>
          )}
          
          <button onClick={endCall} className="end-call">
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
};

const formatCallDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default Call;