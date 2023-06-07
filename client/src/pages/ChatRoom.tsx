import { useContext, useEffect, useRef } from "react";
import "./ChatRoom.css";
import { useParams } from "react-router-dom";
import { PeerContext } from "../contexts/peerConnection.context";

export default function ChatRoom() {
  const { roomId } = useParams();
  const peerConnection = useContext(PeerContext); // TODO: This should be singleton so that we create it on first use, rather than project start?
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  let localStream: MediaStream;
  let remoteStream: MediaStream;

  useEffect(() => {
    setup();

    async function setup() {
      await initLocalStream();
      initRemoteStream();
      // TODO: Should these functions be moved to the context?
      generateICECandidates();
      // TODO: Only create offer if we are the first in the room
      await createOffer();
    }
  }, []);

  async function initLocalStream() {
    // Set up the local media stream
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }

  function initRemoteStream() {
    // TODO: Handle multiple remotes -  could create new peerConnection per each and then add to context array?
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
      }
    };
  }
  async function createOffer() {
    const offerSDP: RTCSessionDescriptionInit =
      await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerSDP);
    console.log(offerSDP);
  }
  async function createAnswer() {
    const answerSDP: RTCSessionDescriptionInit =
      await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answerSDP);
    console.log(answerSDP);
  }
  async function setRemoteDescription(sdp: RTCSessionDescriptionInit) {
    peerConnection.setRemoteDescription(sdp);
  }
  async function addICECandidate(candidate: RTCIceCandidateInit) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
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
