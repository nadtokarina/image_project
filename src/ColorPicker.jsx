import React from 'react';
import './styles/ColorPickerTool.scss';

const ColorPickerTool = ({ onClose, color1, color2 }) => {
  const renderColorInfo = (color, index) => (
    <div className="color-swatch" key={index}>
      <span
        style={{ backgroundColor: color.rgb }}
        title={`RGB: ${color.rgb}\nXYZ: ${color.xyz}\nLab: ${color.lab}`}
      />
      <p>X: {color.x}, Y: {color.y}</p>
      <p>RGB: {color.rgb}</p>
      <p title="X (0-95.05), Y (0-100), Z (0-108.88)">XYZ: {color.xyz}</p>
      <p title="L (0-100), a (-128 to 128), b (-128 to 128)">Lab: {color.lab}</p>
    </div>
  );

  return (
    <div className="color-picker-tool">
      <button className="close-button" onClick={onClose}>Закрыть</button>
      <div className="color-info">
        {color1 && renderColorInfo(color1, 1)}
        {color2 && renderColorInfo(color2, 2)}
      </div>
    </div>
  );
};

export default ColorPickerTool;
