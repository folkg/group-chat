import "./ChatRoom.css";
import { useParams } from "react-router-dom";

export default function ChatRoom() {
  const { roomId } = useParams();
  return <div>ChatRoom {roomId}</div>;
}
