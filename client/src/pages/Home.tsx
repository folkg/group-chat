import { Button, Card, TextField } from "@mui/material";
import "./Home.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  function handleRoomIdChange(event: React.ChangeEvent<HTMLInputElement>) {
    setRoomId(event.target.value);
  }

  function createNewRoom() {
    navigate(`/room/${uuidv4()}`);
  }

  function joinExistingRoom() {
    navigate(`/room/${roomId}`);
  }

  const isNameValid = name.trim().length > 0;
  const isRoomIdValid = roomId.trim().length > 0;

  return (
    <>
      <h1>Welcome to Group Chat</h1>
      <div className="home-cards">
        <Card className="home-card">
          <div className="room-options">
            <TextField
              id="name"
              label="Your Name"
              value={name}
              onChange={handleNameChange}
            />
          </div>
        </Card>
        <Card className="home-card">
          <div className="room-options">
            <Button
              variant="contained"
              disabled={!isNameValid || isRoomIdValid}
              onClick={createNewRoom}
            >
              Create New Room
            </Button>
          </div>
          <p className="or-text">OR</p>
          <div className="room-options">
            <TextField
              id="roomid"
              label="Room ID"
              value={roomId}
              onChange={handleRoomIdChange}
            />
            <Button
              variant="contained"
              disabled={!isNameValid || !isRoomIdValid}
              onClick={joinExistingRoom}
            >
              Join Existing Room
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
