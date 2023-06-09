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

const MAX_CLIENTS_PER_ROOM = 2;
const clientsPerRoom = new Map<string, number>();
const io: Server = new Server(server);
io.on("connection", (socket) => {
  console.log(`New user connected on ${socket.id}`);

  socket.on("join-room", async (roomId) => {
    const numClientsInRoom = clientsPerRoom.get(roomId);
    if (numClientsInRoom && numClientsInRoom >= MAX_CLIENTS_PER_ROOM) {
      console.log(`user tried joined room ${roomId}, but it was full`);
      socket.emit("room-full");
      return;
    }

    await socket.join(roomId);
    console.log(`user joined room ${roomId}`);

    socket.emit("connection-success", {
      status: "connection-succes",
      socketId: socket.id,
      otherUsers: [], // TODO: If we want to keep track
    });

    clientsPerRoom.set(roomId, (clientsPerRoom.get(roomId) ?? 0) + 1);
    socket.to(roomId).emit("new-user-joined", socket.id);

    socket.on("ice-candidate", (data) => {
      console.log("ice candidate received");
      socket.to(roomId).emit("ice-candidate", data);
    });

    socket.on("disconnect", () => {
      const numClientsInRoom = clientsPerRoom.get(roomId);
      if (numClientsInRoom) {
        clientsPerRoom.set(roomId, numClientsInRoom - 1);
        socket.to(roomId).emit("user-disconnected", socket.id);
      }
    });
  });

  socket.on("sdp", (data) => {
    socket.broadcast.emit("sdp", data);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected ${socket.id}`);
  });
});
