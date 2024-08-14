import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './styles/Modal.scss';
import { Tooltip } from 'react-tooltip';

const Modal = ({ isOpen, onClose, imageData, onResize }) => {
  const [resizeMode, setResizeMode] = useState('percentage');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [linkDimensions, setLinkDimensions] = useState(true);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [resizedWidth, setResizedWidth] = useState(0);
  const [resizedHeight, setResizedHeight] = useState(0);

  useEffect(() => {
    if (imageData) {
      const img = new Image();
      img.src = imageData;
      img.onload = () => {
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
      };
    }
  }, [imageData]);

  const handleResize = () => {
    let newWidth = width;
    let newHeight = height;

    if (resizeMode === 'percentage') {
      const percentage = parseFloat(width);
      if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
        alert('Введите корректный процент (от 1 до 100)');
        return;
      }
      newWidth = (originalWidth * percentage) / 100;
      newHeight = (originalHeight * percentage) / 100;
    } else {
      newWidth = parseFloat(width);
      newHeight = parseFloat(height);
      if (isNaN(newWidth) || newWidth <= 0 || isNaN(newHeight) || newHeight <= 0) {
        alert('Введите корректные значения для ширины и высоты');
        return;
      }
    }

    if (linkDimensions) {
      const ratio = originalWidth / originalHeight;
      if (newWidth > newHeight) {
        newHeight = newWidth / ratio;
      } else {
        newWidth = newHeight * ratio;
      }
    }

    setResizedWidth(newWidth);
    setResizedHeight(newHeight);

    // Call the resize function passed from parent component
    onResize(newWidth, newHeight);

    onClose(); // Закрытие модального окна
  };

  const calculatePixels = (width, height) => (width * height) / 1000000; // Convert to megapixels

  return (
    isOpen ? ReactDOM.createPortal(
      <div className='modal-overlay'>
        <div className='modal-content'>
          <h2>Изменение размера изображения</h2>
          <div>
            <label>
              Режим изменения размера:
              <select value={resizeMode} onChange={(e) => setResizeMode(e.target.value)}>
                <option value="percentage">Процент</option>
                <option value="pixels">Пиксели</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Ширина:
              <input
                type="text"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </label>
            {resizeMode === 'percentage' ? null : (
              <label>
                Высота:
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </label>
            )}
          </div>
          <div>
            <label>
              Связать размеры:
              <input
                type="checkbox"
                checked={linkDimensions}
                onChange={() => setLinkDimensions(!linkDimensions)}
              />
            </label>
          </div>
          <div>
            <label>
              Алгоритм интерполяции:
              <select>
                <option value="nearest">Ближайшего соседа</option>
              </select>
              <Tooltip id="tooltip" place="top" effect="solid">
                Алгоритм ближайшего соседа - простейший метод интерполяции, при котором значение пикселя определяется по значению ближайшего к нему пикселя исходного изображения.
              </Tooltip>
              <span data-tip data-for="tooltip">?</span>
            </label>
          </div>
          <div>
            <h4>Общее количество пикселей до изменения размера: {calculatePixels(originalWidth, originalHeight)} Мп</h4>
            <h4>Общее количество пикселей после изменения размера: {calculatePixels(resizedWidth, resizedHeight)} Мп</h4>
          </div>
          <button onClick={handleResize}>Применить</button>
          <button onClick={onClose}>Закрыть</button>
        </div>
      </div>,
      document.body
    ) : null
  );
};

export default Modal;


// import './styles/Modal.scss'; // Подключение стилей

// const Modal = ({ isOpen, onClose}) => {
//   if (!isOpen) return null; // Если модальное окно закрыто, ничего не рендерим


//   return (
//     <div className="modal-overlay">
//       <div className="modal-content">
//         <h2>Модальное окно</h2>
//         <button className="close-button" onClick={onClose}>Закрыть</button>
//       </div>
//     </div>
//   );
// };

// export default Modal;
