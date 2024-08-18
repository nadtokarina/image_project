import React, { useState } from 'react';
// import Modal from './Modal';
import ImageUploader from "./ImageUploader";
import "./styles/App.scss";

function App() {


  return (
    <div className="App">
      <div className='info-wrapper'>
        <ImageUploader />
      </div>
    </div>
  );
}

export default App;
