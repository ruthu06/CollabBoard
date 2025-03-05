import { useState, useRef, useEffect, RefObject } from "react";
import { Socket } from "socket.io-client";

interface Point {
  x: number;
  y: number;
}

interface PathData {
  points: Point[];
  tool: string;
  color: string;
  circledimension?: [number, number, number, number];
  rectdimension?: [number, number, number, number];
  textdimension?: [number, number];
  text?: string;
}

export function useCanvasDrawing(
  canvasRef: RefObject<HTMLCanvasElement|null>,
  socketRef: RefObject<Socket | null>,
  sessionId: string,
  selecttool: string,
  currentColor: string
) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [istexting, setistexting] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [paths, setPaths] = useState<PathData[]>([]);
  const [text, setText] = useState("");

  const renderSavedPaths = (savedPaths: PathData[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  
    savedPaths.forEach(({ points, color, tool, circledimension, rectdimension, textdimension, text}) => { 
      ctx.strokeStyle = color; 
      ctx.lineWidth = tool === "Eraser" ? 20 : 2; 
      if (tool === "Eraser"|| tool === "Pen"){
        if (points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
      
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
      
          ctx.stroke();
        }
      }
      else if (tool === "Circle" && circledimension) {
        const [centerX, centerY, radius] = circledimension;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } 
      else if (tool === "rectangle" && rectdimension) {
        const [x, y, width, height] = rectdimension;
        ctx.strokeRect(x, y, width, height);
      } 
      else if (tool === "Text" && textdimension && text){
        const [x,y]= textdimension;
        ctx.font = "16px Arial";
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
      } 
    });
  };

  const startdrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selecttool === "Pen"|| selecttool === "Eraser"|| selecttool === "Circle"|| selecttool === "rectangle"|| selecttool==="Text") {
      const canvas = canvasRef.current;
      if (!canvas) return; 
      const ctx = canvas.getContext("2d");
      if (!ctx) return; 
      const rect = canvas.getBoundingClientRect();
          
      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top; 
      if (selecttool === "Text"){
        setistexting(true);
      } 
      setIsDrawing(true);
      setStartPos({ x: startX, y: startY });
      if (selecttool === "Pen"|| selecttool === "Eraser"|| selecttool === "Circle"|| selecttool === "rectangle"){
        ctx.beginPath();
      }
      if (selecttool === "Pen"|| selecttool === "Eraser"){
        ctx.moveTo(startX, startY);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => { 
    if (isDrawing && (selecttool === "Pen"||selecttool === "Eraser")) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (selecttool === "Pen" || selecttool === "Eraser") {
        ctx.lineTo(x, y);
        ctx.strokeStyle = selecttool === "Eraser" ? "white" : currentColor;
        ctx.lineWidth = selecttool === "Eraser" ? 20 : 2;
        ctx.stroke();
        ctx.lineWidth=2;
      }
      setCurrentPath((prevList) => [
        ...prevList,
        { x: startPos.x, y: startPos.y },
        { x, y },
      ]);
      
      socketRef.current?.emit("senddrawing",{
        sessionId: sessionId,
        startX: startPos.x,
        startY: startPos.y,
        endX: x,
        endY: y,
        tool: selecttool,
        color: currentColor
      });
      setStartPos({x:x,y:y});
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && (selecttool === "Circle" || selecttool === "rectangle")) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
  
      const rect = canvas.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;
  
      const width = endX - startPos.x;
      const height = endY - startPos.y;
  
      ctx.beginPath();
  
      if (selecttool === "Circle") {
        const radius = Math.sqrt(width * width + height * height);
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.strokeStyle=currentColor;
        ctx.stroke();
        setPaths((prevList) => [
          ...prevList,
          {
            points: [],  
            tool: selecttool,      
            color: currentColor,
            circledimension:[startPos.x, startPos.y, radius, 0],
            rectdimension: undefined,
            textdimension: undefined,
            text: undefined,
          }
        ]);
        socketRef.current?.emit("senddrawing",{
          sessionId: sessionId,
          startX: startPos.x,
          startY: startPos.y,
          radius: radius,
          tool: selecttool,
          color: currentColor
        });
      } else if (selecttool === "rectangle") {
        ctx.rect(startPos.x, startPos.y, width, height);
        ctx.strokeStyle=currentColor;
        ctx.stroke();
        setPaths((prevList) => [
          ...prevList,
          {
            points: [],  
            tool: selecttool,      
            color: currentColor,
            circledimension: undefined, 
            rectdimension: [startPos.x, startPos.y, width, height],
            textdimension: undefined,
            text: undefined,
          }
        ]);
        socketRef.current?.emit("senddrawing",{
          sessionId: sessionId,
          startX: startPos.x,
          startY: startPos.y,
          width: width,
          height: height,
          tool: selecttool,
          color: currentColor
        });
      }
    }
    setIsDrawing(false);
    if (currentPath.length > 0) {
      setPaths((prevList) => [
        ...prevList,
        {
          points: currentPath,  
          tool: selecttool,      
          color: selecttool=="Eraser"? "white":currentColor,
          circledimension: undefined, 
          rectdimension: undefined,
          textdimension: undefined,
          text: undefined
        }
      ]);
    }
    
    setCurrentPath([]);  
  };

  const handletextsubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.font = "16px Arial";
    ctx.fillStyle = currentColor;
    ctx.fillText(text, startPos.x, startPos.y);
    socketRef.current?.emit("senddrawing", {
      sessionId: sessionId,
      startX: startPos.x,
      startY: startPos.y,
      tool: selecttool,
      color: currentColor,
      Text: text,
    });
    setPaths((prevList) => [
      ...prevList,
      {
        points: [],  
        tool: selecttool,      
        color:currentColor,
        circledimension: undefined, 
        rectdimension: undefined,
        textdimension: [startPos.x, startPos.y],
        text: text
      }
    ]);
    setStartPos({x:0,y:0});
    setistexting(false);
    setText("");
  };

  const clear = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socketRef.current?.emit("senddrawing",{
      sessionId: sessionId,
      startX:0,
      startY:0,
      endX: canvas.width,
      endY: canvas.height,
      tool: "clear",
      color: currentColor
    });
    setPaths([]);
    try {
      const response = await fetch("http://localhost:5000/clear-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();
      if (data.success) {
          console.log("Canvas cleared in MongoDB!");
      } else {
          console.error("Failed to clear MongoDB");
      }
  } catch (error) {
      console.error("Error clearing canvas:", error);
  }
  }
  return {
    isDrawing,
    istexting,
    currentPath,
    startPos,
    paths,
    setPaths,
    text,
    setText,
    renderSavedPaths,
    startdrawing,
    draw,
    stopDrawing,
    handletextsubmit,
    clear
  };
}