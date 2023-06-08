import { useContext, useEffect, useRef } from "react";
import "./ChatRoom.css";
import { useParams } from "react-router-dom";
import { PeerContext } from "../contexts/peerConnection.context";
import io, { Socket } from "socket.io-client";

export default function ChatRoom() {
  const { roomId } = useParams();
  const peerConnection = useContext(PeerContext); // TODO: This should be singleton so that we create it on first use, rather than project start?
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket>();

  let localStream: MediaStream;
  let remoteStream: MediaStream;

  useEffect(() => {
    setup();

    async function setup() {
      setupSignalServerSocket();
      await setupLocalStream();
      setupRemoteStream();
      // TODO: Should these functions be moved to the context?
      generateICECandidates();
      // TODO: Only create offer if we are the first in the room
      await createOffer();
    }
  }, []);

  function setupSignalServerSocket() {
    socketRef.current = io("http://localhost:4004", {
      transports: ["websocket"],
    });

    socketRef.current.on("connection-success", (success) => {
      console.log("socket connection to sever a success!", success);
    });

    socketRef.current.on("sdp", (data) => {
      // TODO: Check for offer/answer and perform different actions
      console.log(data);
      setRemoteDescription(data.sdp);
    });

    socketRef.current.on("ice-candidate", (data) => {
      console.log(data);
      addICECandidate(data.candidate);
    });
  }

  async function setupLocalStream() {
    // Set up the local media stream
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }

  function setupRemoteStream() {
    // TODO: Handle multiple remotes -  could create new peerConnection per each and then add to context array?
    // multiple remoteStream and peerConnection objects required
    localStream.getTracks().forEach((track: MediaStreamTrack) => {
      peerConnection.addTrack(track, localStream);
    });

    // Set up the remote media stream
    remoteStream = new MediaStream();
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    peerConnection.ontrack = (event: RTCTrackEvent) => {
      event.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
        remoteStream.addTrack(track);
      });
    };
  }

  // TODO: Should these functions be moved to the context?
  function generateICECandidates() {
    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log("new ICE candidate", event.candidate);
        socketRef.current?.emit("ice-candidate", event.candidate);
      }
    };
  }
  async function createOffer() {
    const offerSDP: RTCSessionDescriptionInit =
      await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerSDP);
    socketRef.current?.emit("sdp", {
      sdp: offerSDP,
    });
    console.log(offerSDP);
  }
  async function createAnswer() {
    const answerSDP: RTCSessionDescriptionInit =
      await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answerSDP);
    socketRef.current?.emit("sdp", {
      sdp: answerSDP,
    });
    console.log(answerSDP);
  }
  async function setRemoteDescription(sdp: RTCSessionDescriptionInit) {
    peerConnection.setRemoteDescription(sdp);
  }
  async function addICECandidate(candidate: RTCIceCandidateInit) {
    peerConnection.addIceCandidate(candidate);
  }

  return (
    <div className="chat-container">
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
    </div>
  );
}
