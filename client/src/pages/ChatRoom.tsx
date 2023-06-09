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
  const [state, setState] = useState("");
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
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
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

    remoteStream = new MediaStream();
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }

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

    peerConnection.current.onconnectionstatechange = async (event) => {
      const newState = peerConnection.current?.connectionState;
      console.log("Connection state changed:", newState);
      if (newState) {
        setState(newState);
        if (newState === "disconnected") {
          // create a new RTCPeerConnection object if closed
          console.log("peer connection is closed, creating a new one.");
          // TODO: This new connection is still not working. Why?
          setupPeerConnection();
        }
      }
    };
  }

  function setupSocket() {
    const socket = io("http://localhost:4004", {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    // TODO: Could pass our username as well to dusplay on screen or chat
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
      // Session Description Protocol
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
      // Interactive Connectivity Establishment
      // Ideally uses a UDP direct connection, but can use TCP or TURN server
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
      <h3>{state}</h3>
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
