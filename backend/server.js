import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
import { Socket } from "dgram";
dotenv.config();

const app = express();
import Session from './models/session.js';

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));
app.use(cors());
app.use(express.json());
app.post("/create-room", async (req, res) => {
    const sessionId = Math.random().toString(36).substring(2, 10); 
    const session = new Session({ sessionId, drawings: [] });
    await session.save();
    res.json({ sessionId });
  });
  app.post("/check-session", async (req, res) => {
    const {sessionId} = req.body; 
    const sessionexists = await Session.findOne({sessionId}); 
    if (sessionexists) {
      return res.status(200).json({ exists: true });
  } else {
      return res.status(404).json({ exists: false, message: "Session not found" });
  }

  });
  app.post("/save-session", async (req, res) => {
    const {sessionId,paths} = req.body; 
    const sessionexists = await Session.findOne({sessionId}); 
    if (sessionexists) {
      sessionexists.drawings.push(...paths);
    }
    await sessionexists.save();

    res.status(200).json({ message: "Session saved successfully!" });  

  })

  app.get('/get-session/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const session = await Session.findOne({ sessionId: id });
      
      if (!session) {

        return res.status(200).json({ sessionId: id, paths: [] });
      }

      return res.status(200).json(session);
    } catch (error) {
      console.error('Error retrieving session:', error);
      return res.status(500).json({ 
        message: 'Server error while retrieving session data',
        error: error.message 
      });
    }
  });
  

  io.on("connection", (socket) => {
  
    socket.on("join-room", (sessionId) => {
      socket.join(sessionId);
      
    });
   
  
    socket.on("senddrawing", (data) => {
      socket.to(data.sessionId).emit("draw", data); 
    });
    
  
    socket.on("disconnect", () => {
    });
  });
  
const PORT = process.env.PORT || 5000; 
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
