import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

const WebRTCVideoCall = ({ socket, chatId, currentUserId, isCaller, onClose }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    // 1. Initialize Peer Connection
    peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);

    // 2. Handle remote stream
    peerConnectionRef.current.ontrack = (event) => {
      console.log('Received remote track:', event.streams[0]);
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // 3. Handle ICE Candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc_ice_candidate', {
          chatId,
          candidate: event.candidate,
          senderId: currentUserId
        });
      }
    };

    peerConnectionRef.current.onconnectionstatechange = () => {
      setConnectionStatus(peerConnectionRef.current.connectionState);
    };

    // 4. Get Local Media
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          peerConnectionRef.current.addTrack(track, stream);
        });

        // 5. Initiate Call (Create Offer) ONLY if caller
        if (isCaller) {
          createOffer();
        } else {
          setConnectionStatus('Waiting for offer...');
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
        setConnectionStatus('Camera/Mic Access Denied');
      }
    };

    const createOffer = async () => {
      try {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        socket.emit('webrtc_offer', {
          chatId,
          offer,
          senderId: currentUserId
        });
        setConnectionStatus('Calling...');
      } catch (err) {
        console.error("Error creating offer:", err);
      }
    };

    startMedia();

    // 6. Socket Listeners for Signaling
    const handleOffer = async (data) => {
      if (data.senderId === currentUserId) return;
      console.log('Received offer');
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit('webrtc_answer', {
          chatId,
          answer,
          senderId: currentUserId
        });
        setConnectionStatus('Connecting...');
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    };

    const handleAnswer = async (data) => {
      if (data.senderId === currentUserId) return;
      console.log('Received answer');
      try {
        const remoteDesc = new RTCSessionDescription(data.answer);
        await peerConnectionRef.current.setRemoteDescription(remoteDesc);
      } catch (err) {
        console.error("Error handling answer:", err);
      }
    };

    const handleIceCandidate = async (data) => {
      if (data.senderId === currentUserId) return;
      try {
        const candidate = new RTCIceCandidate(data.candidate);
        await peerConnectionRef.current.addIceCandidate(candidate);
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    };

    socket.on('webrtc_offer', handleOffer);
    socket.on('webrtc_answer', handleAnswer);
    socket.on('webrtc_ice_candidate', handleIceCandidate);

    // Cleanup
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      socket.off('webrtc_offer', handleOffer);
      socket.off('webrtc_answer', handleAnswer);
      socket.off('webrtc_ice_candidate', handleIceCandidate);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    onClose();
  };

  return (
    <div className="w-full h-96 md:h-[500px] border-b border-white/5 bg-black relative z-20 overflow-hidden flex flex-col">
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand"></span>
        </span>
        <span className="text-white text-xs font-bold uppercase tracking-wider shadow-sm drop-shadow-md">
          {connectionStatus === 'connected' ? 'Secure Connection' : connectionStatus}
        </span>
      </div>

      {/* Remote Video (Full Screen) */}
      <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
        {!remoteStream && (
          <div className="flex flex-col items-center text-white/30 animate-pulse">
            <Video size={48} className="mb-4" />
            <p>Waiting for other user...</p>
          </div>
        )}
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className={`w-full h-full object-cover transition-opacity duration-500 ${remoteStream ? 'opacity-100' : 'opacity-0'}`} 
        />
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="absolute bottom-24 right-4 w-28 h-40 md:w-40 md:h-56 bg-black/50 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl z-30"
      >
        <video 
          ref={localVideoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : 'opacity-100'}`} 
        />
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-black/80">
            <VideoOff size={24} />
          </div>
        )}
      </motion.div>

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <button 
          onClick={toggleMute}
          className={`p-3.5 rounded-full transition-all duration-300 ${isMuted ? 'bg-white/20 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <button 
          onClick={handleEndCall}
          className="p-4 rounded-full bg-brand text-white hover:bg-red-600 transition-all duration-300 shadow-[0_0_20px_rgba(225,29,72,0.5)] hover:scale-110"
        >
          <PhoneOff size={24} />
        </button>
        <button 
          onClick={toggleVideo}
          className={`p-3.5 rounded-full transition-all duration-300 ${isVideoOff ? 'bg-white/20 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
        </button>
      </div>
    </div>
  );
};

export default WebRTCVideoCall;
