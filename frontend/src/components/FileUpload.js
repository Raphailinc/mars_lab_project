import React from 'react';

const FileUpload = ({ onFileSelect }) => {
  const handleFileInput = (e) => {
    const file = e.target.files[0];
    console.log('Selected file:', file);
    onFileSelect(file);
  };

  return (
    <div className="file-upload-container">
      <label className="file-upload-label">
        <input
          type="file"
          className="file-upload-input"
          onChange={handleFileInput}
        />
      </label>
    </div>
  );
};

export default FileUpload;