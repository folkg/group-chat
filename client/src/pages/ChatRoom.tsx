import { useContext, useEffect, useRef } from "react";
import "./ChatRoom.css";
import { useParams } from "react-router-dom";
import { PeerContext } from "../contexts/peerConnection.context";

export default function ChatRoom() {
  const { roomId } = useParams();
  const peerConnection = useContext(PeerContext);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  let localStream: MediaStream;
  let remoteStream: MediaStream;

  useEffect(() => {
    initializeWebRTC();

    async function initializeWebRTC() {
      // Set up the local media stream
      try {
        localStream = await openMediaDevices({
          video: true,
          audio: true,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
      localStream.getTracks().forEach((track: MediaStreamTrack) => {
        peerConnection.addTrack(track, localStream);
      });

      // TODO: Handle multiple remotes
      // Set up the remote media stream
      remoteStream = new MediaStream();
      peerConnection.addEventListener("track", (event: RTCTrackEvent) => {
        event.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
          remoteStream.addTrack(track);
        });
      });
    }
  }, []);

  return (
    <>
      <h1>ChatRoom {roomId}</h1>
      <video ref={localVideoRef} autoPlay muted></video>
    </>
  );
}

async function openMediaDevices(constraints: MediaStreamConstraints) {
  return await navigator.mediaDevices.getUserMedia(constraints);
}
