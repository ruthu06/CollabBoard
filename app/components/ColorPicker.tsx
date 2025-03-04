import React, { useState } from "react";

interface ColorPickerProps {
  color: string;
  onChange: (newColor: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
        <div
          style={{
            width:"170px",
            position: "absolute",
            top: "180px",
            left: "0",
            background: "#fff",
            padding: "8px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            borderRadius: "6px",
            zIndex: 10
          }}
        >
          <label htmlFor="favcolor">Select color:</label>
          <input
            type="color"
            id="favcolor"
            name="favcolor"
            value={color}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            style={{ marginLeft: "8px", border: "none", background: "transparent" }}
          />
        </div>
    </div>
  );
};

export default ColorPicker;


