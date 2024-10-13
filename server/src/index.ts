import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createWebinar, joinWebinar } from "./webinarController";
import cors from "cors";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.post("/webinar", createWebinar);
app.post("/webinar/:id/join", joinWebinar);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join room", (webinarId) => {
    socket.join(webinarId);
    console.log(`User joined room: ${webinarId}`);
  });

  socket.on("chat message", (msg) => {
    const room = Array.from(socket.rooms)[1];
    io.to(room).emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

httpServer.listen(3001, () => {
  console.log("Server running on 3001");
});

export default app;
