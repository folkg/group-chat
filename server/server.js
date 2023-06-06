"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const server = (0, express_1.default)();
const hostname = "127.0.0.1";
const port = 4000;
server.use(express_1.default.json());
server.use((0, cors_1.default)());
server.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
