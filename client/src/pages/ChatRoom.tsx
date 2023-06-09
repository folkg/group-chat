import { useEffect, useRef, useState } from "react";
import "./ChatRoom.css";
import { useParams } from "react-router-dom";
import io, { Socket } from "socket.io-client";

export default function ChatRoom() {
  const { roomId } = useParams();
  const peerConnection = useRef<RTCPeerConnection>();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket>();
  const [isRoomFull, setIsRoomFull] = useState(false);

  let localStream: MediaStream;
  let remoteStream: MediaStream;

  useEffect(() => {
    setup();

    async function setup() {
      await setupStreams();
      setupPeerConnection();
      setupSocket();
    }

    return () => {
      socketRef.current?.disconnect();
      peerConnection.current?.close();
    };
  }, []);

  async function setupStreams() {
    // Set up the local media stream
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    // TODO: Make sure button on home routes to room (and created uuid on new room)
    // Set up the remote media stream
    remoteStream = new MediaStream();
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }

  function setupPeerConnection() {
    const configuration: RTCConfiguration = {
      iceServers: [
        {
          urls: [
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
          ], // Google STUN servers
        },
      ],
      iceCandidatePoolSize: 10,
    };
    peerConnection.current = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach((track: MediaStreamTrack) => {
      peerConnection.current?.addTrack(track, localStream);
    });

    peerConnection.current.ontrack = (event: RTCTrackEvent) => {
      event.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
        remoteStream.addTrack(track);
      });
    };

    peerConnection.current.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log(
          "new ICE candidate discovered, sending to other user",
          event.candidate
        );
        socketRef.current?.emit("ice-candidate", event.candidate);
      }
    };
  }

  function setupSocket() {
    const socket = io("http://localhost:4004", {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.emit("join-room", roomId);

    socket.on("connection-success", (success) => {
      // Could save the socketId for later in multi-peer settings
      console.log("socket connection to sever a success!", success);
    });

    socket.on("room-full", () => {
      console.log("Room is full. Cannot enter");
      setIsRoomFull(true);
    });

    socket.on("new-user-joined", () => {
      console.log("New user joined. You were the first one in the chat.");
      createOffer();
    });

    socket.on("sdp", (sdp) => {
      console.log("SDP received", sdp);
      peerConnection.current?.setRemoteDescription(
        new RTCSessionDescription(sdp)
      );
      if (sdp.type === "offer") {
        createAnswer();
      }
    });

    socket.on("user-disconnected", () => {
      console.log("other use left");
    });

    socket.on("ice-candidate", (data) => {
      console.log("received ICE from other user", data);
      peerConnection.current?.addIceCandidate(new RTCIceCandidate(data));
    });
  }

  async function createOffer() {
    if (peerConnection.current) {
      const offerSDP: RTCSessionDescriptionInit =
        await peerConnection.current.createOffer();
      await peerConnection.current?.setLocalDescription(offerSDP);
      socketRef.current?.emit("sdp", offerSDP);
      console.log("sending SDP offer");
      console.log(offerSDP);
    }
  }

  async function createAnswer() {
    if (peerConnection.current) {
      const answerSDP: RTCSessionDescriptionInit =
        await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answerSDP);
      socketRef.current?.emit("sdp", answerSDP);
      console.log("sending SDP answer");
      console.log(answerSDP);
    }
  }

  const roomFullError = (
    <>
      <h1>This Chat Room is currently full.</h1>
      <p>Please try again later.</p>
    </>
  );
  const videos = (
    <>
      <h1>ChatRoom {roomId}</h1>
      <div className="videos-container">
        <video
          className="video-container"
          ref={localVideoRef}
          autoPlay
          muted
        ></video>
        <video
          className="video-container"
          ref={remoteVideoRef}
          autoPlay
        ></video>
      </div>
    </>
  );
  return (
    <div className="chat-container">{isRoomFull ? roomFullError : videos}</div>
  );
}
