import express, { Express, Request, Response } from "express";
import { Server } from "socket.io";
import cors from "cors";

const app: Express = express();
app.use(express.json());
app.use(cors());

// TODO: Could remove express and just use socket.io if we aren't using express for anything else
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server!");
});

const hostname = "127.0.0.1";
const port: number = 4004;
const server = app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const io: Server = new Server(server);
io.on("connection", (socket) => {
  console.log(`New user connected on ${socket.id}`);
  socket.emit("connection-success", {
    status: "connection-succes",
    socketId: socket.id,
  });

  socket.on("sdp", (data) => {
    console.log(data);
    socket.broadcast.emit("sdp", data);
  });

  socket.on("ice-candidate", (data) => {
    socket.broadcast.emit("ice-candidate", data);
  });

  socket.on("join_room", (roomId) => {
    console.log("user joined room #" + roomId);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected ${socket.id}`);
  });
});
