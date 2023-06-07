import { createContext } from "react";

const configuration: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"], // Google STUN servers
    },
  ],
  iceCandidatePoolSize: 10,
};
const peerConnection: RTCPeerConnection = new RTCPeerConnection(configuration);

export const PeerContext = createContext<RTCPeerConnection>(peerConnection);
export function PeerContextProvider(props: PeerContextProviderProps) {
  return (
    <PeerContext.Provider value={peerConnection}>
      {props.children}
    </PeerContext.Provider>
  );
}

type PeerContextProviderProps = {
  children: React.ReactNode | undefined;
};
