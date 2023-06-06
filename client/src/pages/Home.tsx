import { Button, TextField } from "@mui/material";
import "./Home.css";
import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleRoomIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(event.target.value);
  };

  const isNameValid = name.trim().length > 0;
  const isRoomIdValid = roomId.trim().length > 0;

  return (
    <div>
      <h1>Welcome to Group Chat</h1>
      <div>
        <div className="field-button-group">
          <TextField
            id="name"
            label="Your Name"
            value={name}
            onChange={handleNameChange}
          />
          <Button variant="contained" disabled={!isNameValid || isRoomIdValid}>
            Create New Room
          </Button>
        </div>
        <p className="or-text">OR</p>
        <div className="field-button-group">
          <TextField
            id="roomid"
            label="Room ID"
            value={roomId}
            onChange={handleRoomIdChange}
          />
          <Button variant="contained" disabled={!isNameValid || !isRoomIdValid}>
            Join Existing Room
          </Button>
        </div>
      </div>
    </div>
  );
}
