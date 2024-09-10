import React, { useState, useEffect } from 'react';
import { VictoryChart, VictoryLine, VictoryScatter, VictoryArea, VictoryGroup } from 'victory';
import './styles/Curves.scss';

const Curves = ({ onClose, onApplyCorrection, imageData }) => {
  const [point1, setPoint1] = useState({ input: 0, output: 0 });
  const [point2, setPoint2] = useState({ input: 255, output: 255 });
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [newData, setNewData] = useState(null);
  const [histograms, setHistograms] = useState({ r: [], g: [], b: [] });

  const calculateHistograms = (imageData) => {
    const rHistogram = new Array(256).fill(0);
    const gHistogram = new Array(256).fill(0);
    const bHistogram = new Array(256).fill(0);

    for (let i = 0; i < imageData.data.length; i += 4) {
      rHistogram[imageData.data[i]]++;
      gHistogram[imageData.data[i + 1]]++;
      bHistogram[imageData.data[i + 2]]++;
    }

    setHistograms({ r: rHistogram, g: gHistogram, b: bHistogram });
  };


  useEffect(() => {
    if (imageData) {
      const img = new Image();
      img.src = imageData;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, img.width, img.height);
        calculateHistograms(data);
      };
    }
  }, [imageData]);

  const handlePointChange = (e, point) => {
    const { name, value } = e.target;
    const intValue = parseInt(value, 10);

    if (isNaN(intValue) || intValue < 0 || intValue > 255) return;

    if (point === 'point1') {
      if (name === 'input' && intValue >= point2.input) return;
      setPoint1((prev) => ({ ...prev, [name]: intValue }));
    } else {
      if (name === 'input' && intValue <= point1.input) return;
      setPoint2((prev) => ({ ...prev, [name]: intValue }));
    }

    if (previewEnabled) {
      updatePreviewImage();
    }
  };

  const handleApply = () => {
    const lookupTable = createLookupTable();
    onApplyCorrection({ lookupTable });
    onClose();
  };

  const resetValues = () => {
    setPoint1({ input: 0, output: 0 });
    setPoint2({ input: 255, output: 255 });
    if (previewEnabled) {
      updatePreviewImage();
    }
  };

  const createLookupTable = () => {
    const lookupTable = new Array(256).fill(0).map((_, i) => {
      if (i <= point1.input) return point1.output;
      if (i >= point2.input) return point2.output;

      const ratio = (i - point1.input) / (point2.input - point1.input);
      return Math.round(point1.output + ratio * (point2.output - point1.output));
    });

    return lookupTable;
  };

  const normalizeHistogram = (histogram) => {
    const max = Math.max(...histogram);
    return histogram.map((value) => (value / max) * 100);
  };

  const updatePreviewImage = () => {
    const lookupTable = createLookupTable();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageData;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = lookupTable[imageData.data[i]];       
        imageData.data[i + 1] = lookupTable[imageData.data[i + 1]]; 
        imageData.data[i + 2] = lookupTable[imageData.data[i + 2]];
      }

      ctx.putImageData(imageData, 0, 0);
      setNewData(canvas.toDataURL());
    };
  };

  const togglePreview = () => {
    setPreviewEnabled(!previewEnabled);
    if (!previewEnabled) {
      updatePreviewImage();
    }
  };

  return (
    <div className='curves-modal'>
      <div className='curves-content'>
        <p className='curves-title'>Градационная коррекция "Кривые"</p>
        {previewEnabled && newData ? (
          <img src={newData} alt="Preview" style={{ width: '100%', height: 'auto' }} />
        ) : (
          <VictoryChart   style={{ parent: { background: "#fff" }}}
            width={400} height={400} domain={{ x: [0, 255], y: [0, 255] }}>
            <VictoryGroup>
              <VictoryArea 
                data={normalizeHistogram(histograms.r).map((y, x) => ({ x, y }))}
                style={{ data: { fill: "red", opacity: 0.4 } }}
              />
              <VictoryArea 
                data={normalizeHistogram(histograms.g).map((y, x) => ({ x, y }))}
                style={{ data: { fill: "green", opacity: 0.4 } }}
              />
              <VictoryArea 
                data={normalizeHistogram(histograms.b).map((y, x) => ({ x, y }))}
                style={{ data: { fill: "blue", opacity: 0.4 } }}
              />
            </VictoryGroup>
            
            <VictoryLine
              style={{ data: { stroke: '#8b00ff' } }}
              data={[
                { x: 0, y: point1.output },
                { x: point1.input, y: point1.output },
                { x: point2.input, y: point2.output },
                { x: 255, y: point2.output },
              ]}
            />
            <VictoryScatter
              data={[
                { x: point1.input, y: point1.output },
                { x: point2.input, y: point2.output },
              ]}
              size={5}
              style={{ data: { fill: '#8b00ff' } }}
            />
          </VictoryChart>
        )}

        <div className='controls'>
          <div>
            <label>Точка 1 (вход):</label>
            <input
              type='number'
              name='input'
              min='0'
              max='255'
              value={point1.input}
              onChange={(e) => handlePointChange(e, 'point1')}
            />
            <label>Точка 1 (выход):</label>
            <input
              type='number'
              name='output'
              min='0'
              max='255'
              value={point1.output}
              onChange={(e) => handlePointChange(e, 'point1')}
            />
          </div>
          <div>
            <label>Точка 2 (вход):</label>
            <input
              type='number'
              name='input'
              min='0'
              max='255'
              value={point2.input}
              onChange={(e) => handlePointChange(e, 'point2')}
            />
            <label>Точка 2 (выход):</label>
            <input
              type='number'
              name='output'
              min='0'
              max='255'
              value={point2.output}
              onChange={(e) => handlePointChange(e, 'point2')}
            />
          </div>
        </div>

        <div className='options'>
          <label>
            <input
              type='checkbox'
              checked={previewEnabled}
              onChange={togglePreview}
            />
            Предпросмотр коррекции
          </label>
        </div>

        <div className='curves-buttons'>
          <button onClick={handleApply}>Применить коррекцию</button>
          <button onClick={resetValues}>Сбросить</button>
          <button onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
};

export default Curves;



