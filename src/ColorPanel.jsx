import React from 'react';
import { Tooltip } from 'react-tooltip';
import './styles/ColorPanel.scss';

const getRelativeLuminance = (rgb) => {
  if (!rgb || !rgb.match(/\d+/g)) {
    return 0;
  }

  const [r, g, b] = rgb.match(/\d+/g).map(Number).map((v) => v / 255);
  const luminance = (v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  return 0.2126 * luminance(r) + 0.7152 * luminance(g) + 0.0722 * luminance(b);
};

const calculateContrastRatio = (rgb1, rgb2) => {
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

const ColorPanel = ({ selectedColors, onClose }) => {
  const { color1, color2 } = selectedColors;

  const isColor2Available = color2.rgb.trim() !== '';

  const contrastRatio = isColor2Available
    ? calculateContrastRatio(color1.rgb, color2.rgb)
    : null;

  const isContrastSufficient = contrastRatio && contrastRatio >= 4.5;

  return (
    <div className="color-panel">
      <div className="color-information">
        <div className="color-swatch">
          <div className="swatch" style={{ backgroundColor: color1.rgb }} id="color1" />
          X: {color1.x} Y: {color1.y}
          <Tooltip anchorSelect="#color1">
            {color1.rgb}
            <br />
            XYZ: ({color1.xyz.x}, {color1.xyz.y}, {color1.xyz.z})
            <br />
            Lab: ({color1.lab.l}, {color1.lab.a}, {color1.lab.b})
          </Tooltip>
        </div>
        <div className="color-swatch">
          <div className="swatch" style={{ backgroundColor: isColor2Available ? color2.rgb : '' }} id="color2" />
            {' '}
            {isColor2Available
              ? `X: ${color2.x} Y: ${color2.y}`
              : 'Цвет не выбран'}
            {isColor2Available && (
              <>
              <Tooltip anchorSelect="#color2">
                {color2.rgb}
                <br />
                XYZ: ({color2.xyz.x}, {color2.xyz.y}, {color2.xyz.z})
                <br />
                Lab: ({color2.lab.l}, {color2.lab.a}, {color2.lab.b})
              </Tooltip>
              </>
          )}
        </div>
      </div>
      <div className='contrast-wrapper'>
        {contrastRatio !== null && (
          <p className={isContrastSufficient ? 'contrast-sufficient' : 'contrast-insufficient'}>
            Контраст: {contrastRatio.toFixed(2)}{' '}
            {isContrastSufficient ? '' : '(недостаточный контраст)'}
          </p>
        )}
      <button className="close-panel-button" onClick={onClose}>
        Закрыть
      </button>
      </div>
    </div>
  );
};

export default ColorPanel;