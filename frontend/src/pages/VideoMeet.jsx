import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import server from '../environment';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    const navigate = useNavigate();
    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    let [sessionTimer, setSessionTimer] = useState("00:00:00");
    let [activeTab, setActiveTab] = useState("chat");

    useEffect(() => {
        if (!askForUsername) {
            let startTime = Date.now();
            let interval = setInterval(() => {
                let diff = Date.now() - startTime;
                let hours = Math.floor(diff / 3600000);
                let minutes = Math.floor((diff % 3600000) / 60000);
                let seconds = Math.floor((diff % 60000) / 1000);

                let pad = (num) => String(num).padStart(2, '0');
                setSessionTimer(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [askForUsername]);

    // TODO
    // if(isChrome() === false) {


    // }

    useEffect(() => {
        getPermissions()
    }, [])

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);

        }


    }, [video, audio])
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
        // getUserMedia();
    }
    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }

        if (localStorage.getItem('token')) {
            navigate('/home');
            return;
        }

        navigate('/');
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };



    let sendMessage = () => {
        if (!message.trim() || !socketRef.current) return
        socketRef.current.emit('chat-message', message.trim(), username)
        setMessage("")
    }

    let connect = () => {
        if (!username.trim()) return
        setAskForUsername(false)
        getMedia()
    }


    return (
        <div className="bg-background text-on-background min-h-screen flex flex-col overflow-hidden font-body-md select-none relative box-border">
            {/* Floating Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10 opacity-20">
                <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary rounded-full blur-[160px]"></div>
                <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-secondary rounded-full blur-[140px]"></div>
            </div>

            {askForUsername ? (
                /* REDESIGNED LOBBY UI */
                <div className="flex flex-col items-center justify-center min-h-screen px-4">
                    <div className="w-full max-w-lg bg-surface-container-low/40 backdrop-blur-2xl border border-solid border-outline-variant/20 rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
                        <div className="text-center">
                            <span className="text-secondary font-bold font-label-md text-xs uppercase tracking-widest bg-surface-variant/30 px-3 py-1 rounded-lg">
                                Meeting Lobby
                            </span>
                            <h2 className="font-headline-md text-2xl md:text-3xl font-bold text-on-surface mt-4 mb-2">
                                Join Video Room
                            </h2>
                            <p className="text-on-surface-variant text-sm font-body-md leading-relaxed">
                                Enter your display name to connect and start your call with HD video, high-quality audio, and real-time chat.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <input
                                className="w-full bg-surface-container-lowest border border-solid border-outline-variant/30 rounded-xl px-4 py-3 text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/40"
                                placeholder="Enter your username..."
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && username.trim()) connect(); }}
                            />
                            <button
                                className="w-full bg-primary hover:bg-primary/95 text-on-primary font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg border-0 cursor-pointer"
                                onClick={connect}
                                disabled={!username.trim()}
                            >
                                Connect to Call
                            </button>
                        </div>

                        <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-container-lowest border border-solid border-outline-variant/20 shadow-inner">
                            <video
                                ref={localVideoref}
                                autoPlay
                                muted
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />
                            <div className="absolute bottom-4 left-4 bg-surface-container-lowest/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-solid border-outline-variant/20 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                                <span className="font-label-sm text-xs text-on-surface">Camera Preview</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* REDESIGNED MEETING UI */
                <div className="flex-grow flex flex-col h-screen overflow-hidden relative">
                    {/* TopAppBar */}
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full px-4 sm:px-6 py-3 sm:py-0 min-h-16 z-50 fixed top-0 bg-surface-container/40 backdrop-blur-xl border-b border-solid border-outline-variant/20 box-border">
                        <div className="flex items-center gap-3 flex-wrap">
                            <img src="/logo.png" alt="VibeMeet Logo" className="w-8 h-8 rounded-lg" />
                            <span className="font-headline-md text-base md:text-lg font-bold text-on-surface">
                                {window.location.pathname.replace('/', '') || 'VibeMeet Session'}
                            </span>
                            <div className="flex gap-2">
                                <span className="bg-surface-variant/30 text-secondary font-bold text-xs px-2.5 py-1 rounded-lg">HD</span>
                                <span className="bg-surface-variant/30 text-on-surface-variant font-medium text-xs px-2.5 py-1 rounded-lg">
                                    {sessionTimer}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm border border-solid border-primary-container">
                                    {username.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-label-md text-sm text-on-surface hidden sm:inline">{username} (Host)</span>
                            </div>

                        </div>
                    </header>

                    {/* Main Content Layout */}
                    <main className="flex-grow flex flex-col md:flex-row pt-16 pb-24 md:pb-0 h-full overflow-hidden box-border">
                        {/* Video Canvas */}
                        <div className="flex-grow relative p-4 md:p-6 flex items-center justify-center bg-surface-container-lowest overflow-hidden">
                            <div className="w-full h-full max-w-6xl aspect-video relative rounded-xl overflow-hidden bg-surface-container-low shadow-2xl border border-solid border-outline-variant/10">

                                {/* If there are remote participants, we show a grid layout. Else, show the local user full-screen */}
                                {videos.length === 0 ? (
                                    /* Single User Fullscreen */
                                    <div className="w-full h-full relative bg-surface-container-lowest">
                                        {video ? (
                                            <video
                                                ref={localVideoref}
                                                autoPlay
                                                muted
                                                className="w-full h-full object-cover transform scale-x-[-1]"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-surface-container-low text-on-surface-variant">
                                                <div className="w-20 h-20 rounded-full bg-surface-variant/50 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-4xl">videocam_off</span>
                                                </div>
                                                <p className="text-sm font-medium">Your camera is turned off</p>
                                            </div>
                                        )}
                                        {/* Participant Label */}
                                        <div className="absolute bottom-4 left-4 backdrop-blur-md bg-surface-container-lowest/60 px-4 py-2 rounded-lg border border-solid border-outline-variant/20 flex items-center gap-2 z-10">
                                            <span className={`material-symbols-outlined scale-75 ${audio ? 'text-secondary' : 'text-error'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                                {audio ? 'mic' : 'mic_off'}
                                            </span>
                                            <span className="font-label-md text-sm text-on-surface">{username} (You)</span>
                                        </div>
                                        {/* Status Overlay */}
                                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                                            <div className="backdrop-blur-md bg-secondary-container/20 px-3 py-1 rounded-full border border-solid border-secondary/30 flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                                                <span className="font-label-sm text-xs font-semibold text-secondary">LIVE</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Grid Layout for Multiple Participants */
                                    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 box-border bg-surface-container-lowest overflow-y-auto">
                                        {/* Local Participant */}
                                        <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-container-low border border-solid border-outline-variant/20 shadow-md">
                                            {video ? (
                                                <video
                                                    ref={localVideoref}
                                                    autoPlay
                                                    muted
                                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-surface-container-low text-on-surface-variant">
                                                    <div className="w-12 h-12 rounded-full bg-surface-variant/50 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-2xl">videocam_off</span>
                                                    </div>
                                                    <p className="text-xs">Your camera is off</p>
                                                </div>
                                            )}
                                            <div className="absolute bottom-3 left-3 backdrop-blur-md bg-surface-container-lowest/60 px-3 py-1.5 rounded-lg border border-solid border-outline-variant/20 flex items-center gap-2 z-10">
                                                <span className={`material-symbols-outlined scale-75 ${audio ? 'text-secondary' : 'text-error'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                                    {audio ? 'mic' : 'mic_off'}
                                                </span>
                                                <span className="font-label-sm text-xs text-on-surface">{username} (You)</span>
                                            </div>
                                        </div>

                                        {/* Remote Participants */}
                                        {videos.map((remoteVideo) => (
                                            <div key={remoteVideo.socketId} className="relative aspect-video rounded-xl overflow-hidden bg-surface-container-low border border-solid border-outline-variant/20 shadow-md">
                                                <video
                                                    data-socket={remoteVideo.socketId}
                                                    ref={(ref) => {
                                                        if (ref && remoteVideo.stream) {
                                                            ref.srcObject = remoteVideo.stream;
                                                        }
                                                    }}
                                                    autoPlay
                                                    playsInline
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute bottom-3 left-3 backdrop-blur-md bg-surface-container-lowest/60 px-3 py-1.5 rounded-lg border border-solid border-outline-variant/20 flex items-center gap-2 z-10">
                                                    <span className="material-symbols-outlined text-secondary scale-75" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                                                    <span className="font-label-sm text-xs text-on-surface">Guest ({remoteVideo.socketId.substring(0, 5)})</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SideNavBar (Chat/Participants Panel) */}
                        {showModal && (
                            <aside className="fixed inset-y-0 right-0 md:static h-full flex flex-col z-40 w-full md:w-[320px] bg-surface-container-low/40 backdrop-blur-2xl border-l border-solid border-outline-variant/20 pt-16 md:pt-0 box-border transition-all duration-300">
                                <div className="p-6 flex flex-col h-full box-border">
                                    <div className="mb-6">
                                        <h2 className="font-headline-sm text-xl font-bold text-on-surface m-0">Meeting Panel</h2>
                                        <p className="text-on-surface-variant text-xs m-0 mt-1">Manage chat and participants</p>
                                    </div>

                                    {/* Tab selection */}
                                    <div className="flex border-b border-solid border-outline-variant/20 mb-4">
                                        <button
                                            onClick={() => setActiveTab('chat')}
                                            className={`flex-1 pt-2 pb-2 text-xs font-semibold border-0 bg-transparent cursor-pointer transition-all ${activeTab === 'chat' ? 'border-b-2 border-solid border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                                        >
                                            Chat
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('participants')}
                                            className={`flex-1 pt-2 pb-2 text-xs font-semibold border-0 bg-transparent cursor-pointer transition-all ${activeTab === 'participants' ? 'border-b-2 border-solid border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                                        >
                                            Participants ({videos.length + 1})
                                        </button>

                                    </div>

                                    {/* Tab Contents */}
                                    {activeTab === 'chat' && (
                                        <div className="flex-grow flex flex-col overflow-hidden">
                                            {/* Chat Messages */}
                                            <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                                                {messages.length === 0 ? (
                                                    <div className="text-center py-8 text-on-surface-variant text-xs border border-dashed border-solid border-outline-variant/20 rounded-xl bg-surface-variant/10">
                                                        No messages yet. Start the conversation.
                                                    </div>
                                                ) : (
                                                    messages.map((item, index) => {
                                                        const isSelf = item.sender === username;
                                                        return (
                                                            <div key={index} className={`flex flex-col gap-1 ${isSelf ? 'items-end' : 'items-start'}`}>
                                                                <span className="text-[10px] text-on-surface-variant">
                                                                    {item.sender} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                <div className={`p-3 rounded-xl max-w-[85%] text-sm leading-relaxed ${isSelf ? 'bg-primary-container text-on-primary-container rounded-tr-none shadow-md border-0 text-left' : 'bg-surface-variant/40 border border-solid border-outline-variant/10 text-on-surface rounded-tl-none text-left'}`}>
                                                                    {item.data}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>

                                            {/* Chat Input */}
                                            <div className="mt-4 relative flex items-center box-border">
                                                <input
                                                    className="w-full bg-surface-container-lowest border border-solid border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors pr-10 box-border"
                                                    placeholder="Type a message..."
                                                    type="text"
                                                    value={message}
                                                    onChange={handleMessage}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                                                />
                                                <button
                                                    onClick={sendMessage}
                                                    className="absolute right-3 bg-transparent border-0 text-primary hover:scale-110 active:scale-95 transition-transform cursor-pointer flex items-center justify-center p-0"
                                                >
                                                    <span className="material-symbols-outlined text-xl">send</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'participants' && (
                                        <div className="flex-grow overflow-y-auto space-y-3">
                                            <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-variant/20 border border-solid border-outline-variant/10">
                                                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
                                                    {username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="text-sm font-semibold m-0 text-on-surface">{username}</p>
                                                    <p className="text-[10px] m-0 text-secondary">Host • You</p>
                                                </div>
                                                <span className="material-symbols-outlined text-secondary text-sm">mic</span>
                                            </div>

                                            {videos.map((remote, idx) => (
                                                <div key={remote.socketId} className="flex items-center gap-3 p-2 rounded-lg bg-surface-variant/10 border border-solid border-outline-variant/5">
                                                    <div className="w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-bold text-xs">
                                                        G
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="text-sm font-medium m-0 text-on-surface">Guest {idx + 1}</p>
                                                        <p className="text-[10px] m-0 text-on-surface-variant">{remote.socketId.substring(0, 8)}</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-on-surface-variant text-sm">mic</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeTab === 'polls' && (
                                        <div className="flex-grow flex flex-col items-center justify-center text-center p-4 border border-dashed border-solid border-outline-variant/20 rounded-xl bg-surface-variant/10">
                                            <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">poll</span>
                                            <h4 className="text-sm font-bold text-on-surface m-0 mb-1">No Active Polls</h4>
                                            <p className="text-xs text-on-surface-variant m-0 max-w-[180px]">Polls created by the host will appear here.</p>
                                        </div>
                                    )}
                                </div>
                            </aside>
                        )}
                    </main>

                    {/* BottomNavBar (Controls) */}
                    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 sm:gap-4 p-3 z-50 bg-surface-variant/40 backdrop-blur-xl rounded-3xl mb-3 sm:mb-6 mx-auto w-[calc(100%-0.75rem)] max-w-[520px] border border-solid border-outline-variant/30 shadow-2xl box-border">
                        <button
                            onClick={handleAudio}
                            className={`rounded-full p-3.5 flex flex-col items-center gap-1 border-0 hover:scale-110 active:scale-95 transition-all cursor-pointer min-w-[56px] ${audio ? 'bg-surface-container-highest/50 text-on-surface' : 'bg-error-container text-on-error-container'}`}
                        >
                            <span className="material-symbols-outlined text-lg">{audio ? 'mic' : 'mic_off'}</span>
                            <span className="text-[10px] font-semibold tracking-wide">{audio ? 'Mute' : 'Unmute'}</span>
                        </button>

                        <button
                            onClick={handleVideo}
                            className={`rounded-full p-3.5 flex flex-col items-center gap-1 border-0 hover:scale-110 active:scale-95 transition-all cursor-pointer min-w-[56px] ${video ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-container-highest/50 text-on-surface'}`}
                        >
                            <span className="material-symbols-outlined text-lg">{video ? 'videocam' : 'videocam_off'}</span>
                            <span className="text-[10px] font-semibold tracking-wide">Camera</span>
                        </button>

                        {screenAvailable && (
                            <button
                                onClick={handleScreen}
                                className={`rounded-full p-3.5 flex flex-col items-center gap-1 border-0 hover:scale-110 active:scale-95 transition-all cursor-pointer min-w-[56px] ${screen ? 'bg-secondary text-on-secondary shadow-lg shadow-secondary/20' : 'bg-surface-container-highest/50 text-on-surface'}`}
                            >
                                <span className="material-symbols-outlined text-lg">{screen ? 'stop_screen_share' : 'screen_share'}</span>
                                <span className="text-[10px] font-semibold tracking-wide">Share</span>
                            </button>
                        )}

                        <button
                            onClick={() => setModal(!showModal)}
                            className={`rounded-full p-3.5 flex flex-col items-center gap-1 border-0 hover:scale-110 active:scale-95 transition-all cursor-pointer min-w-[56px] ${showModal ? 'bg-primary/20 text-primary border border-solid border-primary/30' : 'bg-surface-container-highest/50 text-on-surface'}`}
                        >
                            <span className="material-symbols-outlined text-lg">chat</span>
                            <span className="text-[10px] font-semibold tracking-wide">Chat</span>
                        </button>



                        <div className="w-[1px] h-10 bg-outline-variant/30 self-center mx-1"></div>

                        <button
                            onClick={handleEndCall}
                            className="bg-error-container text-on-error-container rounded-full p-3.5 px-6 flex flex-col items-center gap-1 border border-solid border-error/20 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-lg">call_end</span>
                            <span className="text-[10px] font-semibold tracking-wide">Leave</span>
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
}
