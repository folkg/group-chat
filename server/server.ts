import express from "express";
import cors from "cors";

const server = express();
const hostname = "127.0.0.1";
const port: number = 4000;

server.use(express.json());
server.use(cors());

server.get("/", (req, res) => {
  res.send("Express + TypeScript Server!");
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
