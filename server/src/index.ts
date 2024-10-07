import express from "express";
import { createWebinar, joinWebinar } from "./webinarController";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/webinar", createWebinar);
app.post("/webinar/:id/join", joinWebinar);

app.listen(3000, () => {
  console.log("Server running on 3000");
});

export default app;
