import React, { useState } from 'react';
// import Modal from './Modal';
import ImageUploader from "./ImageUploader";
import "./styles/App.scss";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


function App() {


  return (
    <div className="App">
        <ImageUploader />
    </div>
  );
}

export default App;
