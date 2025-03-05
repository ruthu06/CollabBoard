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
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));
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
    const {sessionId,paths,Messages} = req.body; 
    const sessionexists = await Session.findOne({sessionId}); 
    if (sessionexists) {
      sessionexists.drawings.push(...paths);
      if( sessionexists.messages.length != Messages.length){
        sessionexists.messages.push(...Messages)
      }
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
  app.post('/clear-session', async (req, res) => {
    const { sessionId } = req.body;

    try {
        await Session.updateOne(
            { sessionId }, 
            { $set: { drawings: [] } } 
        );
        res.json({ success: true, message: "Canvas cleared successfully!" });
    } catch (error) {
        console.error("Error clearing session:", error);
        res.status(500).json({ success: false, message: "Failed to clear session" });
    }
});
  

  io.on("connection", (socket) => {
  
    socket.on("join-room", (sessionId) => {
      socket.join(sessionId);
      
    });
   
  
    socket.on("senddrawing", (data) => {
      socket.to(data.sessionId).emit("draw", data); 
    });

    socket.on("sendtext", (data1) => {
      socket.to(data1.sessionId).emit("sendtext", data1); 
    });
    
  
    socket.on("disconnect", () => {
    });
  });
  
const PORT = process.env.PORT || 5000; 
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
