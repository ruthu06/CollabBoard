import { useRouter } from "next/navigation";

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

export function useSessionManagement(sessionId: string, paths: PathData[]) {
  const router = useRouter();
  
  const handlesave = async () => {
    console.log("Saving session with paths:", paths);
  
    const res = await fetch('http://localhost:5000/save-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, paths }),
    });
    
    if (res.ok) {
      alert("Session saved successfully!");
      console.log('Session saved successfully');
    } else {
      alert("Failed to save session. Please try again later.");
      console.error('Failed to save session');
    }
  };
  
  const exit = () => {
    router.push("/");
  };
  
  return {
    handlesave,
    exit
  };
}