import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Share2,
  Users,
  MessageSquare,
  ShieldCheck,
  Send,
  X,
  AlertCircle,
  Sparkles,
  Wifi,
  Lock,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface LiveWebRtcPracticeRoomProps {
  roomId: string;
  roomTitle: string;
  categoryLabel: string;
  topicNotes?: string;
  currentUserId: string;
  currentUserName: string;
  isHost: boolean;
  passcode?: string;
  onLeaveRoom: () => void;
}

interface PeerConnectionData {
  userId: string;
  userName: string;
  peerConnection: RTCPeerConnection;
  remoteStream?: MediaStream;
  isMuted: boolean;
  isVideoOn: boolean;
  connectionState: RTCPeerConnectionState;
}

interface RoomChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const LiveWebRtcPracticeRoom: React.FC<LiveWebRtcPracticeRoomProps> = ({
  roomId,
  roomTitle,
  categoryLabel,
  topicNotes,
  currentUserId,
  currentUserName,
  isHost,
  passcode,
  onLeaveRoom,
}) => {
  // WebRTC Media Stream States
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Signaling & Peers State
  const [signalingStatus, setSignalingStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [peers, setPeers] = useState<Map<string, PeerConnectionData>>(new Map());
  const [chatMessages, setChatMessages] = useState<RoomChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Audio Level Meter
  const [localAudioLevel, setLocalAudioLevel] = useState(0);

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const peersRef = useRef<Map<string, PeerConnectionData>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Keep peersRef in sync with state for callbacks
  useEffect(() => {
    peersRef.current = peers;
  }, [peers]);

  // 1. Initialize Local Media (Camera & Mic)
  useEffect(() => {
    let mounted = true;

    async function initMedia() {
      try {
        setMediaError(null);
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
            video: { width: { ideal: 640 }, height: { ideal: 360 } },
          });
        } catch (camErr) {
          console.warn('Camera failed or declined, falling back to audio-only:', camErr);
          // Graceful fallback: audio-only if camera unavailable or denied
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
            video: false,
          });
          if (mounted) {
            setIsVideoOn(false);
            setMediaError('Camera unavailable or permission denied. Connected in audio-only mode.');
          }
        }

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Setup local audio meter
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const pcmData = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!mounted || !audioContextRef.current) return;
            analyser.getByteFrequencyData(pcmData);
            let sum = 0;
            for (let i = 0; i < pcmData.length; i++) sum += pcmData[i];
            const avg = sum / pcmData.length;
            setLocalAudioLevel(avg);
            requestAnimationFrame(checkVolume);
          };
          checkVolume();
        } catch (_) {}
      } catch (err: any) {
        console.error('Failed to get media devices:', err);
        if (mounted) {
          setMediaError(`Microphone/camera access required: ${err.message || 'Permission denied'}`);
        }
      }
    }

    initMedia();

    return () => {
      mounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // 2. Initialize WebSocket Signaling Connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/rooms?roomId=${encodeURIComponent(roomId)}&userId=${encodeURIComponent(currentUserId)}&userName=${encodeURIComponent(currentUserName)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setSignalingStatus('connected');
      // Send join-room signal
      ws.send(
        JSON.stringify({
          type: 'join-room',
          roomId,
          passcode,
          role: isHost ? 'Host' : 'Participant',
        })
      );
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { type } = msg;

        switch (type) {
          case 'room-joined': {
            // Joined room, initiate connections to existing peers
            const existingPeers: Array<{ id: string; name: string }> = msg.peers || [];
            if (msg.room?.messages) {
              setChatMessages(msg.room.messages);
            }

            for (const peer of existingPeers) {
              await createPeerConnection(peer.id, peer.name, true);
            }
            break;
          }

          case 'peer-joined': {
            const { participant } = msg;
            // Existing members wait for the new member to create offer, or initiate
            await createPeerConnection(participant.id, participant.name, false);
            break;
          }

          case 'peer-left': {
            const { userId: leftUserId } = msg;
            closePeerConnection(leftUserId);
            break;
          }

          case 'signal-offer': {
            const { fromUserId, fromUserName, sdp } = msg;
            let peerData = peersRef.current.get(fromUserId);
            if (!peerData) {
              peerData = await createPeerConnection(fromUserId, fromUserName || 'Peer', false);
            }
            if (peerData) {
              await peerData.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
              const answer = await peerData.peerConnection.createAnswer();
              await peerData.peerConnection.setLocalDescription(answer);

              ws.send(
                JSON.stringify({
                  type: 'signal-answer',
                  targetUserId: fromUserId,
                  sdp: answer,
                })
              );
            }
            break;
          }

          case 'signal-answer': {
            const { fromUserId, sdp } = msg;
            const peerData = peersRef.current.get(fromUserId);
            if (peerData) {
              await peerData.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
            }
            break;
          }

          case 'signal-ice-candidate': {
            const { fromUserId, candidate } = msg;
            const peerData = peersRef.current.get(fromUserId);
            if (peerData && candidate) {
              try {
                await peerData.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (e) {
                console.warn('Error adding ICE candidate:', e);
              }
            }
            break;
          }

          case 'chat-message': {
            const { message } = msg;
            setChatMessages((prev) => [...prev, message]);
            break;
          }

          case 'peer-media-status': {
            const { userId: peerId, isMuted: peerMuted, isVideoOn: peerVideo } = msg;
            setPeers((prev) => {
              const updated = new Map(prev);
              const p = updated.get(peerId);
              if (p) {
                updated.set(peerId, { ...p, isMuted: peerMuted, isVideoOn: peerVideo });
              }
              return updated;
            });
            break;
          }

          case 'room-closed': {
            alert('The practice room has been closed by the host.');
            handleCleanLeave();
            break;
          }

          case 'error': {
            setMediaError(msg.message || 'Room error occurred');
            break;
          }
        }
      } catch (e) {
        console.error('Error processing signaling message:', e);
      }
    };

    ws.onclose = () => {
      setSignalingStatus('disconnected');
    };

    ws.onerror = (e) => {
      console.warn('Signaling WebSocket error:', e);
      setSignalingStatus('disconnected');
    };

    return () => {
      // Close all peer connections on unmount
      peersRef.current.forEach((p) => p.peerConnection.close());
      peersRef.current.clear();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'leave-room' }));
        ws.close();
      }
    };
  }, [roomId, currentUserId, currentUserName]);

  // Peer Connection Factory
  async function createPeerConnection(peerId: string, peerName: string, isInitiator: boolean): Promise<PeerConnectionData> {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    const remoteStream = new MediaStream();

    const peerData: PeerConnectionData = {
      userId: peerId,
      userName: peerName,
      peerConnection: pc,
      remoteStream,
      isMuted: true,
      isVideoOn: false,
      connectionState: pc.connectionState,
    };

    // Add local tracks if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle ICE Candidate exchange
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'signal-ice-candidate',
            targetUserId: peerId,
            candidate: event.candidate,
          })
        );
      }
    };

    // Handle incoming remote media tracks
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
      setPeers((prev) => {
        const next = new Map(prev);
        const cur = next.get(peerId);
        if (cur) {
          next.set(peerId, { ...cur, remoteStream });
        }
        return next;
      });
    };

    pc.onconnectionstatechange = () => {
      setPeers((prev) => {
        const next = new Map(prev);
        const cur = next.get(peerId);
        if (cur) {
          next.set(peerId, { ...cur, connectionState: pc.connectionState });
        }
        return next;
      });
    };

    setPeers((prev) => new Map(prev).set(peerId, peerData));

    // If initiator, create offer and send to peer
    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'signal-offer',
              targetUserId: peerId,
              sdp: offer,
            })
          );
        }
      } catch (err) {
        console.error('Error creating offer for peer:', peerId, err);
      }
    }

    return peerData;
  }

  function closePeerConnection(peerId: string) {
    const peer = peersRef.current.get(peerId);
    if (peer) {
      peer.peerConnection.close();
      setPeers((prev) => {
        const next = new Map(prev);
        next.delete(peerId);
        return next;
      });
    }
  }

  // Media Controls
  const toggleMicrophone = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      const newMuted = !audioTrack.enabled;
      setIsMicMuted(newMuted);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'media-status',
            isMuted: newMuted,
            isVideoOn,
          })
        );
      }
    }
  };

  const toggleVideo = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      const newVideoState = videoTrack.enabled;
      setIsVideoOn(newVideoState);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'media-status',
            isMuted: isMicMuted,
            isVideoOn: newVideoState,
          })
        );
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace track across all peer connections
        peersRef.current.forEach((peer) => {
          const sender = peer.peerConnection.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch (e) {
      console.warn('Screen share cancelled or failed:', e);
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (localStreamRef.current) {
      const originalVideoTrack = localStreamRef.current.getVideoTracks()[0];
      peersRef.current.forEach((peer) => {
        const sender = peer.peerConnection.getSenders().find((s) => s.track?.kind === 'video');
        if (sender && originalVideoTrack) {
          sender.replaceTrack(originalVideoTrack);
        }
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
    setIsScreenSharing(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || wsRef.current?.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(
      JSON.stringify({
        type: 'chat-message',
        text: chatInput.trim(),
      })
    );
    setChatInput('');
  };

  const handleCleanLeave = () => {
    stopScreenShare();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'leave-room' }));
      wsRef.current.close();
    }
    onLeaveRoom();
  };

  const handleCloseRoomByHost = () => {
    if (!isHost) return;
    if (confirm('Are you sure you want to end this practice room for all participants?')) {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'close-room' }));
      }
      handleCleanLeave();
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const activePeerList = Array.from(peers.values());

  return (
    <div className="fixed inset-0 z-50 bg-[#030410]/95 backdrop-blur-xl flex flex-col overflow-hidden text-white animate-fadeIn">
      {/* Top Header Bar */}
      <header className="px-4 py-3 border-b border-white/10 bg-[#090b20]/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2dd4bf]/20 to-[#38bdf8]/20 border border-[#2dd4bf]/30 flex items-center justify-center">
            <Users className="w-4 h-4 text-[#2dd4bf]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-baskerville font-bold text-sm sm:text-base text-white">{roomTitle}</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#2dd4bf]/15 text-[#5eead4] text-[10px] font-mono border border-[#2dd4bf]/30">
                {categoryLabel}
              </span>
              {passcode && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                  <Lock className="w-2.5 h-2.5" /> Passcode Protected
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#a4a9d0]">
              <span>Room ID: <code className="font-mono text-[#7dd3fc]">{roomId}</code></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Wifi className={`w-3 h-3 ${signalingStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400'}`} />
                {signalingStatus === 'connected' ? 'Signaling Live' : 'Connecting signaling...'}
              </span>
              <span>•</span>
              <span>{activePeerList.length + 1} Real Participant{activePeerList.length === 0 ? '' : 's'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isHost && (
            <button
              onClick={handleCloseRoomByHost}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              End Room (Host)
            </button>
          )}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isChatOpen ? 'bg-[#2dd4bf]/20 border-[#2dd4bf]/40 text-[#5eead4]' : 'bg-white/5 border-white/10 text-white'
            }`}
            title="Toggle Live Chat"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={handleCleanLeave}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-rose-600/30 cursor-pointer"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Leave Room</span>
          </button>
        </div>
      </header>

      {/* Diagnostic notification if camera or media warning */}
      {mediaError && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{mediaError}</span>
          </div>
          <button onClick={() => setMediaError(null)} className="text-amber-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Video Grid and Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Canvas Grid */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto flex flex-col justify-between">
          {/* Topic guidance banner */}
          {topicNotes && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#a4a9d0] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff6a2b] shrink-0" />
              <span><strong className="text-white">Topic Focus:</strong> {topicNotes}</span>
            </div>
          )}

          {/* Video Grid layout */}
          <div className={`grid gap-3 flex-1 ${
            activePeerList.length === 0
              ? 'grid-cols-1 max-w-2xl mx-auto w-full'
              : activePeerList.length === 1
              ? 'grid-cols-1 md:grid-cols-2'
              : activePeerList.length <= 3
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-2 md:grid-cols-3'
          }`}>
            {/* 1. Local Video Card */}
            <div className="relative rounded-2xl overflow-hidden bg-[#0c1033] border border-white/10 flex flex-col justify-end min-h-[220px] shadow-xl group">
              {isVideoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover mirror"
                  style={{ transform: isScreenSharing ? 'none' : 'scaleX(-1)' }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#090b20] to-[#0c1033]">
                  <div className="w-16 h-16 rounded-full bg-[#2dd4bf]/20 border border-[#2dd4bf]/40 flex items-center justify-center text-xl font-bold text-[#5eead4]">
                    {currentUserName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-[#a4a9d0] mt-2 font-mono">Camera Off</span>
                </div>
              )}

              {/* Status Overlay */}
              <div className="relative z-10 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-white drop-shadow">
                    {currentUserName} (You)
                  </span>
                  {isHost && (
                    <span className="px-1.5 py-0.2 rounded bg-[#ff6a2b]/30 text-[#ffb27a] text-[9px] font-mono border border-[#ff6a2b]/40">
                      Host
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Local Mic status & visualizer */}
                  <div
                    className={`p-1.5 rounded-lg text-xs ${
                      isMicMuted ? 'bg-rose-500/30 text-rose-300' : 'bg-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </div>
                  {!isMicMuted && (
                    <div className="w-2 h-4 bg-white/20 rounded-full overflow-hidden flex flex-col justify-end">
                      <div
                        className="w-full bg-emerald-400 transition-all duration-75"
                        style={{ height: `${Math.min(100, localAudioLevel * 2)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Remote Peers Cards */}
            {activePeerList.map((peer) => (
              <RemotePeerCard key={peer.userId} peer={peer} />
            ))}
          </div>

          {/* Bottom Floating Control Dock */}
          <div className="mt-4 pt-3 flex items-center justify-center gap-3">
            <button
              onClick={toggleMicrophone}
              className={`p-3 sm:px-4 sm:py-2.5 rounded-2xl flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer shadow-lg ${
                isMicMuted
                  ? 'bg-rose-600/90 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              }`}
              title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
              <span className="hidden sm:inline">{isMicMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3 sm:px-4 sm:py-2.5 rounded-2xl flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer shadow-lg ${
                !isVideoOn
                  ? 'bg-rose-600/90 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              }`}
              title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isVideoOn ? <Video className="w-4 h-4 text-[#38bdf8]" /> : <VideoOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-3 sm:px-4 sm:py-2.5 rounded-2xl flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer shadow-lg ${
                isScreenSharing
                  ? 'bg-[#2dd4bf] text-black font-bold shadow-[#2dd4bf]/40'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              }`}
              title="Share Screen"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
            </button>
          </div>
        </div>

        {/* Live Room Chat & Participants Sidebar */}
        {isChatOpen && (
          <aside className="w-80 border-l border-white/10 bg-[#07091c] flex flex-col shrink-0">
            {/* Sidebar Tabs / Header */}
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <MessageSquare className="w-4 h-4 text-[#2dd4bf]" />
                <span>Live Practice Room Chat</span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-[#a4a9d0] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active Real Participants List Preview */}
            <div className="p-2.5 bg-black/30 border-b border-white/5">
              <div className="text-[10px] font-mono uppercase text-[#a4a9d0] px-1 mb-1.5 font-bold">
                Connected Peers ({activePeerList.length + 1})
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2 py-1 rounded bg-white/5 text-[11px]">
                  <span className="text-white font-medium truncate">{currentUserName} (You)</span>
                  <span className="text-[9px] font-mono text-emerald-400">Connected</span>
                </div>
                {activePeerList.map((p) => (
                  <div key={p.userId} className="flex items-center justify-between px-2 py-1 rounded bg-white/5 text-[11px]">
                    <span className="text-white truncate">{p.userName}</span>
                    <span className="text-[9px] font-mono text-[#7dd3fc]">P2P WebRTC</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8 text-[#a4a9d0] text-xs">
                  No messages yet. Send a note or prompt to start the peer discussion!
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-xl ${
                      msg.senderId === currentUserId
                        ? 'bg-[#2dd4bf]/15 border border-[#2dd4bf]/30 text-white ml-4'
                        : msg.senderId === 'system'
                        ? 'bg-white/5 border border-white/10 text-[#a4a9d0] text-[11px]'
                        : 'bg-white/5 border border-white/10 text-white mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#a4a9d0] mb-1">
                      <span className="font-semibold text-white/90">{msg.senderName}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="break-words leading-relaxed">{msg.text}</p>
                  </div>
                ))
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-[#090b20]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Share a thought or question..."
                  className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-[#a4a9d0]/60 focus:outline-none focus:border-[#2dd4bf]"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2 rounded-xl bg-[#2dd4bf] hover:bg-[#14b8a6] disabled:opacity-40 text-black transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#a4a9d0]/60">
                <span>Encrypted P2P signaling</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-2.5 h-2.5" /> Safe Space
                </span>
              </div>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
};

// Remote Peer Video Player Component
const RemotePeerCard: React.FC<{ peer: PeerConnectionData }> = ({ peer }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && peer.remoteStream) {
      videoRef.current.srcObject = peer.remoteStream;
    }
  }, [peer.remoteStream]);

  const hasVideoTrack = peer.remoteStream && peer.remoteStream.getVideoTracks().length > 0;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#0c1033] border border-white/10 flex flex-col justify-end min-h-[220px] shadow-xl">
      {hasVideoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#090b20] to-[#0c1033]">
          <div className="w-16 h-16 rounded-full bg-[#38bdf8]/20 border border-[#38bdf8]/40 flex items-center justify-center text-xl font-bold text-[#7dd3fc]">
            {peer.userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-[#a4a9d0] mt-2 font-mono">Audio Stream Active</span>
        </div>
      )}

      {/* Hidden audio element to ensure audio plays even if video track is absent */}
      <audio
        ref={(audioEl) => {
          if (audioEl && peer.remoteStream) {
            audioEl.srcObject = peer.remoteStream;
          }
        }}
        autoPlay
      />

      {/* Remote Peer Overlay */}
      <div className="relative z-10 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-white drop-shadow">{peer.userName}</span>
          <span className="px-1.5 py-0.2 rounded bg-white/10 text-[#a4a9d0] text-[9px] font-mono">
            {peer.connectionState === 'connected' ? 'Connected' : peer.connectionState}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div
            className={`p-1.5 rounded-lg text-xs ${
              peer.isMuted ? 'bg-rose-500/30 text-rose-300' : 'bg-emerald-500/30 text-emerald-300'
            }`}
          >
            {peer.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>
    </div>
  );
};
