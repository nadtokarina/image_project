import React, { useState, useEffect } from 'react';
import "./styles/Filters.scss";

const Filters = ({ isOpen, onClose, onApplyFilter }) => {
  const [kernel, setKernel] = useState([
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ]);
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('identity');

  const presets = {
    identity: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
    sharpen: [
      [0, 1, 0],
      [1, -5, 1],
      [0, 1, 0],
    ],
    gaussian: [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1],
    ],
    boxBlur: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
  };

  useEffect(() => {
    setKernel(presets[selectedPreset]);
  }, [selectedPreset]);

  const handleKernelChange = (i, j, value) => {
    const newKernel = [...kernel];
    newKernel[i][j] = parseFloat(value) || 0;
    setKernel(newKernel);
  };

  const applyFilter = () => {
    onApplyFilter(kernel);
    onClose();
  };

  const resetFilter = () => {
    setKernel(presets.identity);
    setSelectedPreset('identity');
  };

  return (
    isOpen && (
      <div className="filters-modal">
        <div className="modal-content">
          <h2>Фильтры</h2>
          <select onChange={(e) => setSelectedPreset(e.target.value)} value={selectedPreset}>
            <option value="identity">Тождественное отображение</option>
            <option value="sharpen">Повышение резкости</option>
            <option value="gaussian">Фильтр Гаусса</option>
            <option value="boxBlur">Прямоугольное размытие</option>
          </select>
          <div className="kernel-inputs">
            {kernel.map((row, i) =>
              row.map((value, j) => (
                <input
                  key={`${i}-${j}`}
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) => handleKernelChange(i, j, e.target.value)}
                />
              ))
            )}
          </div>
          <label>
            <input
              type="checkbox"
              checked={previewEnabled}
              onChange={() => setPreviewEnabled(!previewEnabled)}
            />
            Включить предпросмотр
          </label>
          <div className="modal-buttons">
            <button onClick={resetFilter}>Сбросить</button>
            <button onClick={applyFilter}>Применить</button>
            <button onClick={onClose}>Закрыть</button>
          </div>
        </div>
      </div>
    )
  );
};

export default Filters;


// // Filters.jsx
// import React, { useState, useEffect } from 'react';
// import "./styles/Filters.scss";

// const Filters = ({ isOpen, onClose, onApplyFilter, imageData }) => {
//   // Состояния для хранения ядер и предпросмотра
//   const [kernel, setKernel] = useState([
//     [0, 0, 0],
//     [0, 1, 0],
//     [0, 0, 0],
//   ]);
//   const [previewEnabled, setPreviewEnabled] = useState(false);
//   const [selectedPreset, setSelectedPreset] = useState('identity');

//   // Предустановленные фильтры
//   const presets = {
//     identity: [
//       [0, 0, 0],
//       [0, 1, 0],
//       [0, 0, 0],
//     ],
//     sharpen: [
//       [0, 1, 0],
//       [1, -5, 1],
//       [0, 1, 0],
//     ],
//     gaussian: [
//       [1, 2, 1],
//       [2, 4, 2],
//       [1, 2, 1],
//     ],
//     boxBlur: [
//       [1, 1, 1],
//       [1, 1, 1],
//       [1, 1, 1],
//     ],
//   };

//   useEffect(() => {
//     // Применяем предустановленное ядро при изменении выбора
//     setKernel(presets[selectedPreset]);
//   }, [selectedPreset]);

//   const handleKernelChange = (i, j, value) => {
//     const newKernel = [...kernel];
//     newKernel[i][j] = parseFloat(value) || 0;
//     setKernel(newKernel);
//   };

//   const applyFilter = () => {
//     onApplyFilter(kernel);
//     onClose();
//   };

//   const resetFilter = () => {
//     setKernel(presets.identity);
//     setSelectedPreset('identity');
//   };

//   return (
//     isOpen && (
//       <div className="filters-modal">
//         <div className="modal-content">
//           <h2>Фильтры</h2>
//           <select onChange={(e) => setSelectedPreset(e.target.value)} value={selectedPreset}>
//             <option value="identity">Тождественное отображение</option>
//             <option value="sharpen">Повышение резкости</option>
//             <option value="gaussian">Фильтр Гаусса</option>
//             <option value="boxBlur">Прямоугольное размытие</option>
//           </select>
//           <div className="kernel-inputs">
//             {kernel.map((row, i) =>
//               row.map((value, j) => (
//                 <input
//                   key={`${i}-${j}`}
//                   type="number"
//                   step="0.01"
//                   value={value}
//                   onChange={(e) => handleKernelChange(i, j, e.target.value)}
//                 />
//               ))
//             )}
//           </div>
//           <label>
//             <input
//               type="checkbox"
//               checked={previewEnabled}
//               onChange={() => setPreviewEnabled(!previewEnabled)}
//             />
//             Включить предпросмотр
//           </label>
//           <div className="modal-buttons">
//             <button onClick={resetFilter}>Сбросить</button>
//             <button onClick={applyFilter}>Применить</button>
//             <button onClick={onClose}>Закрыть</button>
//           </div>
//         </div>
//       </div>
//     )
//   );
// };

// export default Filters;
