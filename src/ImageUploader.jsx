import React, { useRef, useState, useEffect } from 'react';
import './styles/ImageUploader.scss';

const ImageUploader = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const canvasRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [pixelInfo, setPixelInfo] = useState({ x: 0, y: 0, rgb: 'N/A' });

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
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      setImageSize({ width: img.width, height: img.height });
    };
  };

  useEffect(() => {
    if (imageSrc) {
      drawImageOnCanvas(imageSrc);
    }
  }, [imageSrc]);

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

  return (
    <div className='UploaderWrapper'>
      <label className='input-file'>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <span>Загрузить фото</span>
      </label>
      <div className="image-info-wrapper">
        <p>{imageSize.width}x{imageSize.height} px</p>
        <p>X: {Math.round(pixelInfo.x)}, Y: {Math.round(pixelInfo.y)}</p>
        <p>{pixelInfo.rgb}</p>
      </div>
      <div>
        <canvas ref={canvasRef} onMouseMove={handleMouseMove} onClick={handleClick} />
      </div>
    </div>
  );
};

export default ImageUploader;