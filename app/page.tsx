"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";


export default function Home() {
  const [sessionId, setSessionId] = useState<string>("");
  const [id, setId] = useState<boolean>(false);
  const [UserName, setUserName] = useState<string>("");
  const router = useRouter();
  const createroom = async () => {
    try {
      console.log('creating new session');
      const res = await axios.post("http://localhost:5000/create-room");
      setId(true);
      setSessionId(res.data.sessionId);
    } catch (error) {
      console.error("Error creating room", error);
    }
  };
  const startSession = async () => {
    if (!sessionId) {
      alert("No session found. Please create a new session first.");
      return;
    }
    if (!UserName){
      alert("Please enter a username.");
      return;
    }
    
    try {
      const res = await fetch('http://localhost:5000/check-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
      
      if (res.ok) {
        const data = await res.json();
        router.push(`/sessions/${sessionId}`);
        query: { userName: UserName }
      } else {
        alert("Session not found. Please create a new session.");
      }
    }
    catch (error) {
      console.error("Error checking session", error);
      alert("Error connecting to server. Please try again.");
    }
  };


  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "40px",
        fontFamily: "Calistoga",
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: "64px",
          color: "black",
          textAlign: "center",
        }}
      >
        MEETING ROOM
      </h1>
  
      {/* Join Room Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <span
          style={{
            fontSize: "32px",
            fontWeight: "400",
            color: "black",
          }}
        >
          Join Room:
        </span>
  
        <input
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="Enter session ID"
          style={{
            width: "350px",
            height: "50px",
            background: "#D9D9D9",
            borderRadius: "25px",
            border: "2px solid #ccc",
            fontSize: "20px",
            textAlign: "center",
            outline: "none",
            padding: "10px",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <span
          style={{
            fontSize: "32px",
            fontWeight: "400",
            color: "black",
          }}
        >
          UserName:
        </span>
  
        <input
          type="text"
          value={UserName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter UserName"
          style={{
            width: "350px",
            height: "50px",
            background: "#D9D9D9",
            borderRadius: "25px",
            border: "2px solid #ccc",
            fontSize: "20px",
            textAlign: "center",
            outline: "none",
            padding: "10px",
          }}
        />
      </div>
      <button
        style={{
          width: "220px",
          height: "60px",
          background: "#6A5ACD", // Soft purple color
          color: "white",
          borderRadius: "30px",
          fontSize: "25px",
          fontWeight: "500",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          transition: "0.3s ease",
        }}
        onClick={startSession}
        // onMouseOver={(e) => (e.target.style.background = "#5B4ECF")}
        // onMouseOut={(e) => (e.target.style.background = "#6A5ACD")}
      >
        JOIN ROOM
      </button>
      <button
        style={{
          width: "220px",
          height: "60px",
          background: "#6A5ACD", // Soft purple color
          color: "white",
          borderRadius: "30px",
          fontSize: "25px",
          fontWeight: "500",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          transition: "0.3s ease",
        }}
        onClick={createroom}
        // onMouseOver={(e) => (e.target.style.background = "#5B4ECF")}
        // onMouseOut={(e) => (e.target.style.background = "#6A5ACD")}
      >
        CREATE ROOM
      </button>
      {id && sessionId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center relative">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Session Created!</h3>
            <p className="text-lg text-gray-600 mb-4">Session ID: <span className="font-semibold text-gray-900">{sessionId}</span></p>
        
      <input
  type="text"
  value={UserName}
  onChange={(e) => setUserName(e.target.value)}
  placeholder="Enter UserName"
  className="w-full px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-grey-600 transition duration-300 mb-4 "
/>
            <button
              onClick={startSession}
              className="w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-300"
            >
              Start Session
            </button>

            {/* Close Button */}
            <button
              onClick={() => {setId(false)  
                setSessionId("")}}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
