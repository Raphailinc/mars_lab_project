// ReportForm.js
import React, { useState } from 'react';
import FileUpload from './FileUpload';
import { uploadFile } from '../services/reportService';

const ReportForm = ({ onSubmit }) => {
  const [scientistName, setScientistName] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!scientistName || !reportContent) {
      alert('Пожалуйста, заполните имя и текст отчёта');
      return;
    }

    setSubmitting(true);
    try {
      let fileName = null;
      if (file) {
        fileName = await uploadFile(file);
      }

      const report = { scientistName, reportContent, fileName };
      await onSubmit(report);

      setScientistName('');
      setReportContent('');
      setFile(null);
    } catch (error) {
      console.error('Ошибка при сохранении отчёта:', error);
      alert(error.message || 'Произошла ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <label>
        Имя учёного
        <input
          type="text"
          value={scientistName}
          onChange={(e) => setScientistName(e.target.value)}
          placeholder="Имя учёного"
        />
      </label>
      <label>
        Текст отчёта
        <textarea
          value={reportContent}
          onChange={(e) => setReportContent(e.target.value)}
          placeholder="Текстовое содержание отчёта"
        ></textarea>
      </label>
      <FileUpload onFileSelect={(selected) => setFile(selected)} />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Отправляем...' : 'Отправить отчёт'}
      </button>
    </form>
  );
};

export default ReportForm;
