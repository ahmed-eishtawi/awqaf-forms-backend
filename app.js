import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import useSocketIo from "./src/routes/socketRoute.js";
import restoreDatabase from "./src/routes/restoreDatabase.js";
import cors from "cors";

/* Load environment variables */
dotenv.config();

/* Set up the server */
const PORT = process.env.PORT || 3501;
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const socket_io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Use the Socket.io logic
useSocketIo(socket_io);

/* Set up the root route */
app.get("/", (req, res) => {
  res.status(200).send("Powered by Ahmed Eishtawi");
});

app.get("/api/restore-database", restoreDatabase);
