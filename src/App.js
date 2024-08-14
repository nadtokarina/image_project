import React, { useState } from 'react';
// import Modal from './Modal';
import ImageUploader from "./ImageUploader";
import "./styles/App.scss";

function App() {

  // const [isModalOpen, setIsModalOpen] = useState(false);

  // const openModal = () => setIsModalOpen(true);
  // const closeModal = () => setIsModalOpen(false);


  return (
    <div className="App">
      <div className='info-wrapper'>
        <ImageUploader />
        {/* <button className='modal-button' onClick={openModal}>Открыть модальное окно</button> */}
      </div>
      {/* <Modal isOpen={isModalOpen} onClose={closeModal} /> */}
    </div>
  );
}

export default App;
