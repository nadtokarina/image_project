import React, { useRef, useState, useEffect } from 'react';
import Modal from './Modal'; // Импортируем компонент Modal
import './styles/ImageUploader.scss';

const ImageUploader = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [scale, setScale] = useState(1);
  const canvasRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [pixelInfo, setPixelInfo] = useState({ x: 0, y: 0, rgb: 'N/A' });
  const [modalOpen, setModalOpen] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawImageOnCanvas = (image) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = image;

    img.onload = () => {
      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight;

      const scaleX = (canvasWidth - 50) / img.width;
      const scaleY = (canvasHeight - 50) / img.height;
      const newScale = Math.min(scaleX, scaleY);

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const scaledWidth = img.width * newScale;
      const scaledHeight = img.height * newScale;

      const currentScale = scale || newScale;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, (canvasWidth - scaledWidth * currentScale) / 2, (canvasHeight - scaledHeight * currentScale) / 2, scaledWidth * currentScale, scaledHeight * currentScale);

      setImageSize({ width: img.width, height: img.height });
    };
  };

  useEffect(() => {
    if (imageSrc) {
      drawImageOnCanvas(imageSrc);
    }
  }, [imageSrc]);

  useEffect(() => {
    if (imageSrc) {
      drawImageOnCanvas(imageSrc);
    }
  }, [scale]);

  const getColorAtPosition = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(x, y, 1, 1).data;
    const rgb = `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
    return rgb;
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rgb = getColorAtPosition(x, y);
    setPixelInfo({ x, y, rgb });
  };

  const handleClick = (e) => {
    handleMouseMove(e);
  };

  const handleScaleChange = (e) => {
    setScale(Number(e.target.value) / 100);
  };

  const handleResize = (newWidth, newHeight) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
    };
  };

  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'scaled-image.png';
    link.click();
  };

  return (
    <div className='UploaderWrapper'>
      <div className="info-panel">
        <div className="info-buttons">
          <label className='input-file'>
            <input className='upload-button' type="file" accept="image/*" onChange={handleImageUpload} />
            <span className='upload-label'>Загрузить фото</span>
          </label>
          <button className='scale-button' onClick={() => setModalOpen(true)}>Изменить размер</button>
          <button className='save-button' onClick={handleSaveImage}>Сохранить</button>
        </div>
        <div className="image-info-wrapper">
          <p>{Math.round(imageSize.width * scale)}x{Math.round(imageSize.height * scale)} px</p>
          <p>X: {Math.round(pixelInfo.x)}, Y: {Math.round(pixelInfo.y)}</p>
          <p>{pixelInfo.rgb}</p>
          <label>
            <input
              type="range"
              min="12"
              max="300"
              value={scale * 100}
              onChange={handleScaleChange}
              style={{ marginLeft: 10 }}
            />
            <span>{Math.round(scale * 100)}%</span>
          </label>
        </div>
      </div>
      <div>
        <canvas className='canvas' ref={canvasRef} onMouseMove={handleMouseMove} onClick={handleClick} />
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        imageData={imageSrc}
        onResize={handleResize}
      />
    </div>
  );
};

export default ImageUploader;