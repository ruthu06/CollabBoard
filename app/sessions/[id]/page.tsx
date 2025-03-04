"use client";
import { useRef } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ColorPicker from "../../components/ColorPicker";
import { useCanvasDrawing } from "../../hooks/useCanvasDrawing";
import { useToolSelection } from "../../hooks/useToolSelection";
import { useSessionManagement } from "../../hooks/useSessionManagement";
// import { useMessage } from "../../hooks/useMessage";
import { io, Socket } from "socket.io-client";
import { useState } from "react";
import { useSearchParams } from 'next/navigation';


export default function SessionPage({ params }: { params: { id: string } }) {
  const { id: sessionId} = (params);
  const searchParams = useSearchParams();
  const userName = searchParams.get("userName");
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [Message,setMessage]=useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  interface Mess {
    user: string;
    text: string;
  }
  const [Messages,setMessages]=useState<Mess[]>([]);
  const [oldMessages,setOldMessages]=useState<Mess[]>([]);
  
  useEffect(() => {
      socketRef.current = io(process.env.PORT ||"http://localhost:5000");
      socketRef.current.emit("join-room", sessionId);
      socketRef.current.on("sendtext",(data1)=>{
        setMessages((prevMessages) => [...prevMessages, data1.Message]);
      });
      socketRef.current.on("draw",(data)=>{
          const canvas = canvasRef.current;
          if (!canvas) return;
          
          const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
          if (!ctx) return;
          if (data.tool =="Pen"||data.tool=="Eraser"){
              ctx.strokeStyle=data.color;
              if (data.tool=="Eraser"){
                ctx.strokeStyle="white";
                ctx.lineWidth=20;
              }
              ctx.beginPath();
              ctx.moveTo(data.startX, data.startY);
              ctx.lineTo(data.endX, data.endY);
              ctx.stroke();
              ctx.lineWidth=2
            }
          else if (data.tool=="Circle"){
            ctx.strokeStyle=data.color;
            ctx.beginPath();
            ctx.arc(data.startX, data.startY, data.radius ,0, 2*Math.PI)
            ctx.stroke();
          }
          else if (data.tool=="rectangle"){
            ctx.strokeStyle=data.color;
            ctx.beginPath();
            ctx.rect(data.startX, data.startY, data.width, data.height);
            ctx.stroke();
          }
          else if (data.tool=="Text"){
            ctx.font = "16px Arial";
            ctx.fillStyle = data.color;
            ctx.fillText(data.Text, data.startX, data.startY);
    
          }
        })
        const fetchSavedPaths = async () => {
          try {
            const response = await fetch(`http://localhost:5000/get-session/${sessionId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.drawings && data.drawings.length > 0) {
                setPaths(data.drawings);
                renderSavedPaths(data.drawings);
              }
              if (data.messages && data.messages.length > 0) {
                setOldMessages(data.messages);
              }
            }
          } catch (error) {
            console.error("Error fetching saved paths:", error);
          }
        };
      
        fetchSavedPaths();
    
      return () => {
        if(socketRef.current){
          socketRef.current.disconnect();
        }
    
      };
    }, [sessionId]);
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [oldMessages, Messages]);


  const {
    activeTool,setActiveTool,selecttool,setselecttool,currentColor,setCurrentColor,tools} = useToolSelection();

  const {
    isDrawing,istexting,startPos,paths,setPaths,text,setText,renderSavedPaths,startdrawing,draw,stopDrawing,handletextsubmit} = useCanvasDrawing(canvasRef, socketRef, sessionId, selecttool, currentColor);
  
  const { handlesave, exit } = useSessionManagement(sessionId, paths, setPaths, Messages, setMessages,setOldMessages);
  
  const handleMessagesubmit = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!Message.trim()) return;
  
    const messageData = { user: userName || "Unknown", text: Message };
    setMessages((prev) => [...prev, messageData]); 
    socketRef.current?.emit("sendtext", {
      sessionId: sessionId,
      Message: messageData
    });
    setMessage(""); 
  };
  return (
    <div
      style={{
        width: "100%",minHeight: "100vh",background: "white",display: "flex",flexDirection: "row",padding: "15px"}}>
      <div style={{
        width: "80px",minHeight: "20vh",background: '#5F6273',display: "flex",flexDirection: "column",alignItems: "center",padding: "10px 10px 10px 10px",boxShadow: "2px 0 5px rgba(0, 0, 0, 0.2)",}}>
      {tools.map((tool) => (
        <button
          key={tool.name}
          onMouseEnter={() => setActiveTool(tool.name)}
          onMouseLeave={()=> setActiveTool("")}
          onClick={() => {
            setselecttool(selecttool === tool.name ? "" : tool.name);
          }}
          style={{
            background: activeTool === tool.name ? "#B0B0B0" : "transparent",border: "none",cursor: "pointer",padding: "10px",margin: "10px 0",borderRadius: "8px",display: "flex",flexDirection: "column",alignItems: "center",width: "60px",height: "60px",position: "relative",
          }}
        >
          <img
            src={tool.icon}
            alt={tool.name}
            style={{
              width: "50px",height: "50px",boxShadow: "2px 0 5px rgba(0, 0, 0, 0.8)",
            }}
          />
          {activeTool === tool.name && (
            <span
              style={{
                position: "absolute",bottom: "-25px",background: "#333",color: "white",padding: "5px 8px",borderRadius: "5px",fontSize: "12px",whiteSpace: "nowrap",
              }}
            >
              {tool.name}
            </span>
          )}
        </button>
      ))}
      </div>
      { selecttool === "Color" && (
       <ColorPicker 
      color={currentColor} 
      onChange={setCurrentColor}  
      />
      )}
        <div
    style={{
      display: "flex",maxWidth:"800vh",minHeight: "80vh",background: "#dadfe1",padding:"15px", flexDirection:"row",gap:"20px",flexGrow:"0"
    }}
  >
  <canvas
    id="myCanvas"
    ref={canvasRef}
    width={window.innerWidth * 0.6} 
    height={window.innerHeight * 0.9}
    style={{
      border: "2px solid rgb(14, 13, 13)",
      boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.5)",
      background: "white",
      padding: "10px",
      flexGrow:0,
    }}
    onMouseDown={startdrawing}
    onMouseMove={draw}
    onMouseUp={stopDrawing}
    onMouseLeave={stopDrawing}
  >
  </canvas>
  {
    selecttool=="Text" && istexting && (
      <textarea style={{
        position: "absolute",
            left: startPos.x,top:startPos.y, fontSize: "16px", border: "1px solid black", padding: "0px",
      }}
      value={text}
      onChange={(e)=> setText(e.target.value)}
      onBlur={handletextsubmit}
      onKeyDown={(e)=> e.key ==="Enter" && handletextsubmit()} />

    )
  }
  <div
      style={{ minWidth: '320px', background: '#9C887D', borderRadius: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', maxHeight:'90vh', overflowY:"auto",
      }}
    > 

     { (oldMessages || Messages) && [...oldMessages, ...Messages].map((msg) => (
          <div
            style={{
              alignSelf:  msg.user === userName ? 'flex-end' : 'flex-start',
              background: msg.user === userName ?'#5d4037':'#F5F5F5',
              borderRadius: '20px',
              padding: '10px 25px',
              margin: '10px 10px',
              maxWidth: '80%',
              wordWrap: 'break-word',
              color:msg.user === userName ? 'white': "black",
              fontFamily: 'Jacques Francois',
              fontSize: '14px',
            }}
          > 
            {msg.user}: <div></div>  
            {msg.text}
          </div>
        
        ))}

    <div style={{ padding:"20px", top:"700px"}}>
    <input
          type="text"
          value={Message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a Message..."
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '14px',
            fontFamily: 'Jacques Francois', 
            borderRadius: '25px',
            border: '1px solid #ccc',
            outline: 'none',
            background:"white"
          }}
          
          onKeyDown={(e)=> e.key ==="Enter" && handleMessagesubmit(e)}
        />
        </div>
        <div ref={messagesEndRef} />
        </div>
        
    <div style={{display: 'flex', flexDirection: "column",gap:"10px"}}>
    <button
          onClick={handlesave} 
          className="w-20 h-10 px-1 py-0  bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-300"
        >save</button>
    <button
          onClick={exit}
          className="w-20 h-10 px-1 py-0 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-300"
        >Exit</button>
    </div>
  </div>      
</div> 
  );
}