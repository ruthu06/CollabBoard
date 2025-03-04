import { useState } from "react";

export function useToolSelection() {
  const [activeTool, setActiveTool] = useState("");
  const [selecttool, setselecttool] = useState("");
  const [currentColor, setCurrentColor] = useState("black");
  
  const tools = [
    { name: "Pen", icon: "/images/pen.jpeg" },
    { name: "Eraser", icon: "/images/erase.png" },
    { name: "Color", icon: "/images/color.jpeg" },
    { name: "Circle", icon: "/images/shape.png" },
    { name: "rectangle", icon: "/images/rect.png" },
    { name: "Text", icon: "/images/text.png" },
  ];

  return {
    activeTool,
    setActiveTool,
    selecttool,
    setselecttool,
    currentColor,
    setCurrentColor,
    tools
  };
}