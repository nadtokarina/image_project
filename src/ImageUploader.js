import React, { useState } from 'react';

const ImageUploader = () => {
  const [imageURL, setImageURL] = useState('');
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      setImageURL(reader.result);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <br />
      { imageURL && <img src={imageURL} alt="Uploaded" />}
    </div>
  );
};

export default ImageUploader;