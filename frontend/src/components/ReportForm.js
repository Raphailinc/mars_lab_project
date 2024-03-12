// ReportForm.js
import React, { useState } from 'react';
import FileUpload from './FileUpload';

const ReportForm = ({ onSubmit }) => {
  const [scientistName, setScientistName] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!scientistName || !reportContent || !file) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    console.log('Report data:', { scientistName, reportContent, file });

    const formData = new FormData();
    formData.append('file', file);

    const reportData = { scientistName, reportContent };

    try {
      const fileName = await uploadFile(formData);
      const report = { ...reportData, fileName };

      onSubmit(report);

      setScientistName('');
      setReportContent('');
      setFile(null);
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={scientistName}
        onChange={(e) => setScientistName(e.target.value)}
        placeholder="Имя учёного"
      />
      <textarea
        value={reportContent}
        onChange={(e) => setReportContent(e.target.value)}
        placeholder="Текстовое содержание отчёта"
      ></textarea>
      <FileUpload onFileSelect={(file) => setFile(file)} />
      <button type="submit">Отправить отчёт</button>
    </form>
  );
};

export default ReportForm;

export const uploadFile = async (formData) => {
  const response = await fetch('/api/upload-file', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: formData,
  });
  const { fileName } = await response.json();
  return fileName;
};