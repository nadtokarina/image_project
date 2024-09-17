import React, { useState, useCallback, useEffect } from 'react';
import './styles/Filters.scss';

const Filters = ({ onClose, onApplyFilter, imageSrc, setImageSrc }) => {
  const initialKernel = [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ];

  const [kernel, setKernel] = useState(initialKernel);
  const [showPreview, setShowPreview] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [originalSrc, setOriginalSrc] = useState(imageSrc);

  useEffect(() => {
    setOriginalSrc(imageSrc);
  }, [imageSrc]);

  const handleKernelChange = (row, col, value) => {
    const newKernel = [...kernel];
    newKernel[row][col] = parseFloat(value);
    setKernel(newKernel);
  };

  const predefinedKernels = {
    identity: initialKernel,
    sharpen: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
    gaussianBlur: [
      [1 / 16, 1 / 8, 1 / 16],
      [1 / 8, 1 / 4, 1 / 8],
      [1 / 16, 1 / 8, 1 / 16],
    ],
    boxBlur: [
      [1 / 8, 1 / 8, 1 / 8],
      [1 / 8, 1 / 8, 1 / 8],
      [1 / 8, 1 / 8, 1 / 8],
    ],
  };

  const handlePredefinedKernel = (type) => {
    setKernel(predefinedKernels[type]);
    if (showPreview) {
      updatePreview(predefinedKernels[type]);
    }
  };

  const handleApplyFilter = () => {
    const canvas = document.querySelector('.canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newImageData = ctx.createImageData(imageData.width, imageData.height);

    const applyKernel = (x, y, kernel) => {
      let r = 0, g = 0, b = 0;
      const kernelSize = kernel.length;
      const halfKernel = Math.floor(kernelSize / 2);

      for (let i = -halfKernel; i <= halfKernel; i++) {
        for (let j = -halfKernel; j <= halfKernel; j++) {
          const pixelX = x + j + halfKernel;
          const pixelY = y + i + halfKernel;

          const index = (pixelY * (imageData.width) + pixelX) * 4;
          r += imageData.data[index] * kernel[i + halfKernel][j + halfKernel];
          g += imageData.data[index + 1] * kernel[i + halfKernel][j + halfKernel];
          b += imageData.data[index + 2] * kernel[i + halfKernel][j + halfKernel];
        }
      }

      const pixelIndex = (y * imageData.width + x) * 4;
      newImageData.data[pixelIndex] = Math.min(255, Math.max(0, r));
      newImageData.data[pixelIndex + 1] = Math.min(255, Math.max(0, g));
      newImageData.data[pixelIndex + 2] = Math.min(255, Math.max(0, b));
      newImageData.data[pixelIndex + 3] = imageData.data[pixelIndex + 3];
    };

    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        applyKernel(x, y, kernel);
      }
    }

    ctx.putImageData(newImageData, 0, 0);
    const newImageSrc = canvas.toDataURL('image/png');
    setImageSrc(newImageSrc);
    onApplyFilter(kernel);
    onClose();
  };

  const handleCancel = () => {
    setImageSrc(originalSrc);
    onClose();
  };

  const handleReset = () => {
    setKernel(initialKernel);
    setPreviewSrc(null);
  };

  const handleSelectChange = (e) => {
    const selectedKernel = e.target.value;
    handlePredefinedKernel(selectedKernel);
  };

  const updatePreview = useCallback((kernel) => {
    const canvas = document.querySelector('.canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newImageData = ctx.createImageData(imageData.width, imageData.height);

    const applyKernel = (x, y, kernel) => {
      let r = 0, g = 0, b = 0;
      const kernelSize = kernel.length;
      const halfKernel = Math.floor(kernelSize / 2);

      for (let i = -halfKernel; i <= halfKernel; i++) {
        for (let j = -halfKernel; j <= halfKernel; j++) {
          const pixelX = x + j + halfKernel;
          const pixelY = y + i + halfKernel;

          const index = (pixelY * (imageData.width) + pixelX) * 4;
          r += imageData.data[index] * kernel[i + halfKernel][j + halfKernel];
          g += imageData.data[index + 1] * kernel[i + halfKernel][j + halfKernel];
          b += imageData.data[index + 2] * kernel[i + halfKernel][j + halfKernel];
        }
      }

      const pixelIndex = (y * imageData.width + x) * 4;
      newImageData.data[pixelIndex] = Math.min(255, Math.max(0, r));
      newImageData.data[pixelIndex + 1] = Math.min(255, Math.max(0, g));
      newImageData.data[pixelIndex + 2] = Math.min(255, Math.max(0, b));
      newImageData.data[pixelIndex + 3] = imageData.data[pixelIndex + 3];
    };

    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        applyKernel(x, y, kernel);
      }
    }

    ctx.putImageData(newImageData, 0, 0);
    setPreviewSrc(canvas.toDataURL('image/png'));
  }, [showPreview, kernel]);

  return (
    <div className="filters-modal">
      <h2>Фильтры</h2>
      <div className="filter-kernel">
        {kernel.map((row, rowIndex) => (
          <div key={rowIndex} className="kernel-row">
            {row.map((value, colIndex) => (
              <input
                key={colIndex}
                type="number"
                value={value}
                step="0.1"
                onChange={(e) => handleKernelChange(rowIndex, colIndex, e.target.value)}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="filter-presets">
        <label htmlFor="filterSelect">Выбрать фильтр:</label>
        <select id="filterSelect" onChange={handleSelectChange}>
          <option value="identity">Тождественное отображение</option>
          <option value="sharpen">Повышение резкости</option>
          <option value="gaussianBlur">Фильтр Гаусса</option>
          <option value="boxBlur">Прямоугольное размытие</option>
        </select>
      </div>
      <div className="filter-controls">
        <label className='preview-text'>
          <input
            type="checkbox"
            checked={showPreview}
            onChange={() => {
              setShowPreview(!showPreview);
              if (!showPreview) {
                updatePreview(kernel);
              }
            }}
          />
          Предпросмотр
        </label>
        {showPreview && previewSrc && (
          <div className="preview">
            <img src={previewSrc} alt="Preview" />
          </div>
        )}
        <div className="filter-buttons">
          <button onClick={handleApplyFilter}>Применить</button>
          <button onClick={handleReset}>Сбросить</button>
          <button onClick={handleCancel}>Отмена</button>
        </div>
      </div>
    </div>
  );
};

export default Filters;