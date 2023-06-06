import express, { Express, Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app: Express = express();
app.use(express.json());
app.use(cors());

// TODO: Could remove express and just use socket.io if we aren't using express for anything else
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server!");
});

const httpServer = createServer(app);

const io: Server = new Server(httpServer);

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join_room", (roomId) => {
    console.log("user joined room #" + roomId);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const hostname = "127.0.0.1";
const port: number = 4000;
httpServer.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
