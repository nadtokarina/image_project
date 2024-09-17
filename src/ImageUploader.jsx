import React, { useRef, useState, useEffect } from 'react';
import Modal from './Modal'; 
import ColorPanel from './ColorPanel';
import Curves from './Curves';
import Filters from './Filters';
import './styles/ImageUploader.scss';
import SwipeSharpIcon from '@mui/icons-material/SwipeSharp';
import ColorizeSharpIcon from '@mui/icons-material/ColorizeSharp';


const ImageUploader = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [scale, setScale] = useState(1);
  const canvasRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [pixelInfo, setPixelInfo] = useState({ x: 0, y: 0, rgb: 'N/A' });
  const [modalOpen, setModalOpen] = useState(false);
  const [isHandToolActive, setIsHandToolActive] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [resizedImageSize, setResizedImageSize] = useState({ width: 0, height: 0 });
  const [isEyedropperActive, setIsEyedropperActive] = useState(false);
  const [selectedColors, setSelectedColors] = useState({
    color1: { rgb: ' ', x: 0, y: 0, xyz: '', lab: '' },
    color2: { rgb: ' ', x: 0, y: 0, xyz: '', lab: '' }
  });  
  const [showColorPanel, setShowColorPanel] = useState(false);
  const [curvesOpen, setCurvesOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  

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

      const scaledWidth = resizedImageSize.width || img.width * newScale;
      const scaledHeight = resizedImageSize.height || img.height * newScale;

      const currentScale = scale || newScale;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(
        img,
        (canvasWidth - scaledWidth * currentScale) / 2 + offset.x,
        (canvasHeight - scaledHeight * currentScale) / 2 + offset.y,
        scaledWidth * currentScale,
        scaledHeight * currentScale
      );

      setImageSize({ width: img.width, height: img.height });
    };
  };

  useEffect(() => {
    if (imageSrc) {
      drawImageOnCanvas(imageSrc);
    }
  }, [imageSrc, scale, offset, resizedImageSize]);

  const handleResize = (newWidth, newHeight) => {
    setResizedImageSize({ width: newWidth, height: newHeight });
  };

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

    if (isHandToolActive && startPos.x !== 0) {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      setOffset((prevOffset) => ({
        x: prevOffset.x + dx,
        y: prevOffset.y + dy,
      }));
      setStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleClick = (e) => {
    handleMouseMove(e);
  };


const rgbToXyz = (r, g, b) => {
  const normalize = (v) => v / 255;
  const rgb = [normalize(r), normalize(g), normalize(b)].map((v) => {
    return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
  });

  const [rLin, gLin, bLin] = rgb;

  const x = rLin * 0.4124 + gLin * 0.3576 + bLin * 0.1805;
  const y = rLin * 0.2126 + gLin * 0.7152 + bLin * 0.0722;
  const z = rLin * 0.0193 + gLin * 0.1192 + bLin * 0.9505;

  return { x: x * 100, y: y * 100, z: z * 100 };
};

const xyzToLab = (x, y, z) => {
  const whiteRef = rgbToXyz(255, 255, 255);

  const normalize = (v, ref) => v / ref;
  const f = (t) => {
    return t > 0.008856 ? Math.cbrt(t) : (7.787 * t) + (16 / 116);
  };

  const fx = f(normalize(x, whiteRef.x));
  const fy = f(normalize(y, whiteRef.y));
  const fz = f(normalize(z, whiteRef.z));

  const l = (116 * fy) - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return { l, a, b };
};

const handleMouseDown = (e) => {
  if (isEyedropperActive) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rgb = getColorAtPosition(x, y);

    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    const xyz = rgbToXyz(r, g, b);
    const lab = xyzToLab(xyz.x, xyz.y, xyz.z);

    if (e.altKey || e.ctrlKey || e.shiftKey) {
      setSelectedColors((prevColors) => ({
        ...prevColors,
        color2: { rgb, x: Math.round(x), y: Math.round(y), xyz, lab }
      }));
    } else {
      setSelectedColors((prevColors) => ({
        ...prevColors,
        color1: { rgb, x: Math.round(x), y: Math.round(y), xyz, lab }
      }));
    }
    setShowColorPanel(true);
  }

  if (isHandToolActive) {
    setStartPos({ x: e.clientX, y: e.clientY });
  }};

  const handleMouseUp = () => {
    setStartPos({ x: 0, y: 0 });
  };

  const handleKeyDown = (e) => {
    if (isHandToolActive) {
      switch (e.key) {
        case 'ArrowUp':
          setOffset((prevOffset) => ({ ...prevOffset, y: prevOffset.y - 10 }));
          break;
        case 'ArrowDown':
          setOffset((prevOffset) => ({ ...prevOffset, y: prevOffset.y + 10 }));
          break;
        case 'ArrowLeft':
          setOffset((prevOffset) => ({ ...prevOffset, x: prevOffset.x - 10 }));
          break;
        case 'ArrowRight':
          setOffset((prevOffset) => ({ ...prevOffset, x: prevOffset.x + 10 }));
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    if (isHandToolActive) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isHandToolActive]);

  const handleScaleChange = (e) => {
    setScale(Number(e.target.value) / 100);
  };

  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'scaled-image.png';
    link.click();
  };

  const applyCurvesCorrection = (lookupTable) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
  
      imageData.data[i] = lookupTable[r];
      imageData.data[i + 1] = lookupTable[g];
      imageData.data[i + 2] = lookupTable[b];
    }
  
    ctx.putImageData(imageData, 0, 0);
  };  
  
  
  const handleApplyCurves = (correctionData) => {
    const { lookupTable } = correctionData;
    applyCurvesCorrection(lookupTable);
  
    const newWidth = resizedImageSize.width;
    const newHeight = resizedImageSize.height;
    const newImageData = canvasRef.current.toDataURL('image/png');
    setImageSrc(newImageData);
  
    if (newWidth && newHeight) {
      nearestNeighborResize(canvasRef.current, newWidth, newHeight);
    }
  };
  
  
  const nearestNeighborResize = (imageData, newWidth, newHeight) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
  
    const resizedImage = ctx.createImageData(newWidth, newHeight);
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    const oldData = ctx.getImageData(0, 0, oldWidth, oldHeight).data;
  
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const srcX = Math.floor((x / newWidth) * oldWidth);
        const srcY = Math.floor((y / newHeight) * oldHeight);
  
        const oldIndex = (srcY * oldWidth + srcX) * 4;
        const newIndex = (y * newWidth + x) * 4;
  
        resizedImage.data[newIndex] = oldData[oldIndex];
        resizedImage.data[newIndex + 1] = oldData[oldIndex + 1];
        resizedImage.data[newIndex + 2] = oldData[oldIndex + 2];
        resizedImage.data[newIndex + 3] = oldData[oldIndex + 3]; 
      }
    }
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(resizedImage, 0, 0);
  };  
  
  const applyFilter = (kernel) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const padSize = Math.floor(kernel.length / 2);
    const paddedImageData = addEdgePadding(imageData, padSize);
    
    const newImageData = ctx.createImageData(imageData.width, imageData.height);
  
    const applyKernel = (x, y, kernel) => {
      let r = 0, g = 0, b = 0;
      const kernelSize = kernel.length;
      const halfKernel = Math.floor(kernelSize / 2);
  
      for (let i = -halfKernel; i <= halfKernel; i++) {
        for (let j = -halfKernel; j <= halfKernel; j++) {
          const pixelX = x + j + padSize;
          const pixelY = y + i + padSize;
  
          const index = (pixelY * (paddedImageData.width) + pixelX) * 4;
          r += paddedImageData.data[index] * kernel[i + halfKernel][j + halfKernel];
          g += paddedImageData.data[index + 1] * kernel[i + halfKernel][j + halfKernel];
          b += paddedImageData.data[index + 2] * kernel[i + halfKernel][j + halfKernel];
        }
      }
  
      const pixelIndex = (y * imageData.width + x) * 4;
      newImageData.data[pixelIndex] = Math.min(255, Math.max(0, r));
      newImageData.data[pixelIndex + 1] = Math.min(255, Math.max(0, g));
      newImageData.data[pixelIndex + 2] = Math.min(255, Math.max(0, b));
      newImageData.data[pixelIndex + 3] = imageData.data[pixelIndex + 3]; // Альфа-канал
    };
  
    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        applyKernel(x, y, kernel);
      }
    }
  
    ctx.putImageData(newImageData, 0, 0);
  };
  
  // Функция для расширения изображения, используя ближайшие пиксели
  const addEdgePadding = (imageData, padSize) => {
    const { width, height, data } = imageData;
    const paddedWidth = width + padSize * 2;
    const paddedHeight = height + padSize * 2;
    
    const paddedData = new Uint8ClampedArray(paddedWidth * paddedHeight * 4);
  
    const getPixel = (x, y) => {
      x = Math.max(0, Math.min(width - 1, x));
      y = Math.max(0, Math.min(height - 1, y));
      const index = (y * width + x) * 4;
      return [data[index], data[index + 1], data[index + 2], data[index + 3]];
    };
  
    for (let y = 0; y < paddedHeight; y++) {
      for (let x = 0; x < paddedWidth; x++) {
        const srcX = x - padSize;
        const srcY = y - padSize;
  
        const [r, g, b, a] = getPixel(srcX, srcY);
  
        const index = (y * paddedWidth + x) * 4;
        paddedData[index] = r;
        paddedData[index + 1] = g;
        paddedData[index + 2] = b;
        paddedData[index + 3] = a;
      }
    }
  
    return new ImageData(paddedData, paddedWidth, paddedHeight);
  };
  
  

  
  return (
    <div className='UploaderWrapper'>
      <div className="info-panel">
        <div className="info-buttons">
          <div className="change-buttons">
            <label className='input-file'>
              <input className='upload-button' type="file" accept="image/*" onChange={handleImageUpload} />
              <span className='upload-label'>Загрузить фото</span>
            </label>
            <button className='scale-button' onClick={() => setModalOpen(true)}>Изменить размер</button>
            <button className='scale-button' onClick={() => setCurvesOpen(true)}>Коррекция "Кривые"</button>
            <button className='scale-button' onClick={() => setFiltersOpen(true)}>Применить фильтр</button> 
            <button className='scale-button' onClick={handleSaveImage}>Сохранить</button>  
          </div>
          <div className="instruments-wrapper">
            <p className={isHandToolActive ? 'instrument-button' : 'instrument-unactive-button'}  onClick={() => setIsHandToolActive(!isHandToolActive)}>
              <SwipeSharpIcon className='hand-icon'/>
            </p>
            <p className={isEyedropperActive ? 'instrument-button' : 'instrument-unactive-button'} onClick={() => setIsEyedropperActive(!isEyedropperActive)}>
              <ColorizeSharpIcon className='picker-icon'/>
            </p>
          </div>
        </div>
        <div className="image-info-wrapper">
          <p>Ширина: {Math.round(imageSize.width * scale)} Высота:{Math.round(imageSize.height * scale)}</p>
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
        {showColorPanel && (
          <ColorPanel
            selectedColors={selectedColors}
            onClose={() => setShowColorPanel(false)}
          />
        )}
      </div>
      <div className='canvas-container'> 
        <canvas
          className='canvas'
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
        />
      </div>
    {curvesOpen && (
      <Curves
        onClose={() => setCurvesOpen(false)}
        onApplyCorrection={handleApplyCurves}
        imageData={imageSrc}
      />
    )}
          {filtersOpen && (
        <Filters
          onClose={() => setFiltersOpen(false)}
          onApplyFilter={applyFilter}
          setImageSrc={setImageSrc} 
        />
      )}
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


// import React, { useRef, useState, useEffect } from 'react';
// import Modal from './Modal'; 
// import ColorPanel from './ColorPanel';
// import Curves from './Curves';
// import './styles/ImageUploader.scss';
// import SwipeSharpIcon from '@mui/icons-material/SwipeSharp';
// import ColorizeSharpIcon from '@mui/icons-material/ColorizeSharp';


// const ImageUploader = () => {
//   const [imageSrc, setImageSrc] = useState(null);
//   const [scale, setScale] = useState(1);
//   const canvasRef = useRef(null);
//   const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
//   const [pixelInfo, setPixelInfo] = useState({ x: 0, y: 0, rgb: 'N/A' });
//   const [modalOpen, setModalOpen] = useState(false);
//   const [isHandToolActive, setIsHandToolActive] = useState(false);
//   const [offset, setOffset] = useState({ x: 0, y: 0 });
//   const [startPos, setStartPos] = useState({ x: 0, y: 0 });
//   const [resizedImageSize, setResizedImageSize] = useState({ width: 0, height: 0 });
//   const [isEyedropperActive, setIsEyedropperActive] = useState(false);
//   const [selectedColors, setSelectedColors] = useState({
//     color1: { rgb: ' ', x: 0, y: 0, xyz: '', lab: '' },
//     color2: { rgb: ' ', x: 0, y: 0, xyz: '', lab: '' }
//   });  
//   const [showColorPanel, setShowColorPanel] = useState(false);
//   const [curvesOpen, setCurvesOpen] = useState(false);

  

//   const handleImageUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImageSrc(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const drawImageOnCanvas = (image) => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const img = new Image();
//     img.src = image;

//     img.onload = () => {
//       const canvasWidth = window.innerWidth;
//       const canvasHeight = window.innerHeight;

//       const scaleX = (canvasWidth - 50) / img.width;
//       const scaleY = (canvasHeight - 50) / img.height;
//       const newScale = Math.min(scaleX, scaleY);

//       canvas.width = canvasWidth;
//       canvas.height = canvasHeight;

//       const scaledWidth = resizedImageSize.width || img.width * newScale;
//       const scaledHeight = resizedImageSize.height || img.height * newScale;

//       const currentScale = scale || newScale;

//       ctx.clearRect(0, 0, canvasWidth, canvasHeight);
//       ctx.drawImage(
//         img,
//         (canvasWidth - scaledWidth * currentScale) / 2 + offset.x,
//         (canvasHeight - scaledHeight * currentScale) / 2 + offset.y,
//         scaledWidth * currentScale,
//         scaledHeight * currentScale
//       );

//       setImageSize({ width: img.width, height: img.height });
//     };
//   };

//   useEffect(() => {
//     if (imageSrc) {
//       drawImageOnCanvas(imageSrc);
//     }
//   }, [imageSrc, scale, offset, resizedImageSize]);

//   const handleResize = (newWidth, newHeight) => {
//     setResizedImageSize({ width: newWidth, height: newHeight });
//   };

//   const getColorAtPosition = (x, y) => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const imageData = ctx.getImageData(x, y, 1, 1).data;
//     const rgb = `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
//     return rgb;
//   };  

//   const handleMouseMove = (e) => {
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;
//     const rgb = getColorAtPosition(x, y);
//     setPixelInfo({ x, y, rgb });

//     if (isHandToolActive && startPos.x !== 0) {
//       const dx = e.clientX - startPos.x;
//       const dy = e.clientY - startPos.y;
//       setOffset((prevOffset) => ({
//         x: prevOffset.x + dx,
//         y: prevOffset.y + dy,
//       }));
//       setStartPos({ x: e.clientX, y: e.clientY });
//     }
//   };

//   const handleClick = (e) => {
//     handleMouseMove(e);
//   };


// const rgbToXyz = (r, g, b) => {
//   const normalize = (v) => v / 255;
//   const rgb = [normalize(r), normalize(g), normalize(b)].map((v) => {
//     return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
//   });

//   const [rLin, gLin, bLin] = rgb;

//   const x = rLin * 0.4124 + gLin * 0.3576 + bLin * 0.1805;
//   const y = rLin * 0.2126 + gLin * 0.7152 + bLin * 0.0722;
//   const z = rLin * 0.0193 + gLin * 0.1192 + bLin * 0.9505;

//   return { x: x * 100, y: y * 100, z: z * 100 };
// };

// const xyzToLab = (x, y, z) => {
//   const whiteRef = rgbToXyz(255, 255, 255);

//   const normalize = (v, ref) => v / ref;
//   const f = (t) => {
//     return t > 0.008856 ? Math.cbrt(t) : (7.787 * t) + (16 / 116);
//   };

//   const fx = f(normalize(x, whiteRef.x));
//   const fy = f(normalize(y, whiteRef.y));
//   const fz = f(normalize(z, whiteRef.z));

//   const l = (116 * fy) - 16;
//   const a = 500 * (fx - fy);
//   const b = 200 * (fy - fz);

//   return { l, a, b };
// };

// const handleMouseDown = (e) => {
//   if (isEyedropperActive) {
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;
//     const rgb = getColorAtPosition(x, y);

//     const [r, g, b] = rgb.match(/\d+/g).map(Number);
//     const xyz = rgbToXyz(r, g, b);
//     const lab = xyzToLab(xyz.x, xyz.y, xyz.z);

//     if (e.altKey || e.ctrlKey || e.shiftKey) {
//       setSelectedColors((prevColors) => ({
//         ...prevColors,
//         color2: { rgb, x: Math.round(x), y: Math.round(y), xyz, lab }
//       }));
//     } else {
//       setSelectedColors((prevColors) => ({
//         ...prevColors,
//         color1: { rgb, x: Math.round(x), y: Math.round(y), xyz, lab }
//       }));
//     }
//     setShowColorPanel(true);
//   }

//   if (isHandToolActive) {
//     setStartPos({ x: e.clientX, y: e.clientY });
//   }};

//   const handleMouseUp = () => {
//     setStartPos({ x: 0, y: 0 });
//   };

//   const handleKeyDown = (e) => {
//     if (isHandToolActive) {
//       switch (e.key) {
//         case 'ArrowUp':
//           setOffset((prevOffset) => ({ ...prevOffset, y: prevOffset.y - 10 }));
//           break;
//         case 'ArrowDown':
//           setOffset((prevOffset) => ({ ...prevOffset, y: prevOffset.y + 10 }));
//           break;
//         case 'ArrowLeft':
//           setOffset((prevOffset) => ({ ...prevOffset, x: prevOffset.x - 10 }));
//           break;
//         case 'ArrowRight':
//           setOffset((prevOffset) => ({ ...prevOffset, x: prevOffset.x + 10 }));
//           break;
//         default:
//           break;
//       }
//     }
//   };

//   useEffect(() => {
//     if (isHandToolActive) {
//       window.addEventListener('keydown', handleKeyDown);
//     } else {
//       window.removeEventListener('keydown', handleKeyDown);
//     }

//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [isHandToolActive]);

//   const handleScaleChange = (e) => {
//     setScale(Number(e.target.value) / 100);
//   };

//   const handleSaveImage = () => {
//     const canvas = canvasRef.current;
//     const dataURL = canvas.toDataURL('image/png');

//     const link = document.createElement('a');
//     link.href = dataURL;
//     link.download = 'scaled-image.png';
//     link.click();
//   };

//   const applyCurvesCorrection = (lookupTable) => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
//     for (let i = 0; i < imageData.data.length; i += 4) {
//       const r = imageData.data[i];
//       const g = imageData.data[i + 1];
//       const b = imageData.data[i + 2];
  
//       imageData.data[i] = lookupTable[r];
//       imageData.data[i + 1] = lookupTable[g];
//       imageData.data[i + 2] = lookupTable[b];
//     }
  
//     ctx.putImageData(imageData, 0, 0);
//   };  
  
  
//   const handleApplyCurves = (correctionData) => {
//     const { lookupTable } = correctionData;
//     applyCurvesCorrection(lookupTable);
  
//     const newWidth = resizedImageSize.width;
//     const newHeight = resizedImageSize.height;
//     const newImageData = canvasRef.current.toDataURL('image/png');
//     setImageSrc(newImageData);
  
//     if (newWidth && newHeight) {
//       nearestNeighborResize(canvasRef.current, newWidth, newHeight);
//     }
//   };
  
  
//   const nearestNeighborResize = (imageData, newWidth, newHeight) => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
  
//     const resizedImage = ctx.createImageData(newWidth, newHeight);
//     const oldWidth = canvas.width;
//     const oldHeight = canvas.height;
//     const oldData = ctx.getImageData(0, 0, oldWidth, oldHeight).data;
  
//     for (let y = 0; y < newHeight; y++) {
//       for (let x = 0; x < newWidth; x++) {
//         const srcX = Math.floor((x / newWidth) * oldWidth);
//         const srcY = Math.floor((y / newHeight) * oldHeight);
  
//         const oldIndex = (srcY * oldWidth + srcX) * 4;
//         const newIndex = (y * newWidth + x) * 4;
  
//         resizedImage.data[newIndex] = oldData[oldIndex];
//         resizedImage.data[newIndex + 1] = oldData[oldIndex + 1];
//         resizedImage.data[newIndex + 2] = oldData[oldIndex + 2];
//         resizedImage.data[newIndex + 3] = oldData[oldIndex + 3]; 
//       }
//     }
  
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.putImageData(resizedImage, 0, 0);
//   };  
  
  
//   return (
//     <div className='UploaderWrapper'>
//       <div className="info-panel">
//         <div className="info-buttons">
//           <div className="change-buttons">
//             <label className='input-file'>
//               <input className='upload-button' type="file" accept="image/*" onChange={handleImageUpload} />
//               <span className='upload-label'>Загрузить фото</span>
//             </label>
//             <button className='scale-button' onClick={() => setModalOpen(true)}>Изменить размер</button>
//             <button className='scale-button' onClick={() => setCurvesOpen(true)}>Коррекция "Кривые"</button>
//             <button className='scale-button' onClick={handleSaveImage}>Сохранить</button>  
//           </div>
//           <div className="instruments-wrapper">
//             <p className={isHandToolActive ? 'instrument-button' : 'instrument-unactive-button'}  onClick={() => setIsHandToolActive(!isHandToolActive)}>
//               <SwipeSharpIcon className='hand-icon'/>
//             </p>
//             <p className={isEyedropperActive ? 'instrument-button' : 'instrument-unactive-button'} onClick={() => setIsEyedropperActive(!isEyedropperActive)}>
//               <ColorizeSharpIcon className='picker-icon'/>
//             </p>
//           </div>
//         </div>
//         <div className="image-info-wrapper">
//           <p>Ширина: {Math.round(imageSize.width * scale)} Высота:{Math.round(imageSize.height * scale)}</p>
//           <p>X: {Math.round(pixelInfo.x)}, Y: {Math.round(pixelInfo.y)}</p>
//           <p>{pixelInfo.rgb}</p>
//           <label>
//             <input
//               type="range"
//               min="12"
//               max="300"
//               value={scale * 100}
//               onChange={handleScaleChange}
//               style={{ marginLeft: 10 }}
//             />
//             <span>{Math.round(scale * 100)}%</span>
//           </label>
//         </div>
//         {showColorPanel && (
//           <ColorPanel
//             selectedColors={selectedColors}
//             onClose={() => setShowColorPanel(false)}
//           />
//         )}
//       </div>
//       <div className='canvas-container'> 
//         <canvas
//           className='canvas'
//           ref={canvasRef}
//           onMouseMove={handleMouseMove}
//           onMouseDown={handleMouseDown}
//           onMouseUp={handleMouseUp}
//           onClick={handleClick}
//         />
//       </div>
//     {curvesOpen && (
//       <Curves
//         onClose={() => setCurvesOpen(false)}
//         onApplyCorrection={handleApplyCurves}
//         imageData={imageSrc}
//       />
//     )}
//       <Modal
//         isOpen={modalOpen}
//         onClose={() => setModalOpen(false)}
//         imageData={imageSrc}
//         onResize={handleResize}
//       />
//     </div>
//   );
// };

// export default ImageUploader;