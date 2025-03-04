import { useRouter } from "next/navigation";
import {useState} from "react";

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
interface Mess {
  user: string;
  text: string;
}

export function useSessionManagement(sessionId: string, paths: PathData[],
  setPaths: React.Dispatch<React.SetStateAction<PathData[]>>, Messages: Mess[],
  setMessages: React.Dispatch<React.SetStateAction<Mess[]>>,setOldMessages: React.Dispatch<React.SetStateAction<Mess[]>>) {
  const router = useRouter();
  const handlesave = async () => {
    console.log("Saving session with paths:", paths);
  
    const res = await fetch('http://localhost:5000/save-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, paths , Messages}),
    });
    
    if (res.ok) {
      alert("Session saved successfully!");
      if (Messages.length>0){
        setOldMessages((prevOldMessages) => [...prevOldMessages, ...Messages]);
      }
      setMessages([]),
      setPaths([])
    } else {
      alert("Failed to save session. Please try again later.");
    }
  };
  
  const exit = () => {
    router.push("/");
  };
  
  return {
    handlesave,
    exit,
    paths,
    setPaths,
    Messages,
    setMessages,
  };
}