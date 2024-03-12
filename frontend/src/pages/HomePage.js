import React from 'react';
import ReportForm from '../components/ReportForm';
import { createReport } from '../services/reportService';

const HomePage = () => {
  const handleSubmit = async (report) => {
    try {
      await createReport(report);
      alert('Отчет успешно отправлен');
    } catch (error) {
      console.error('Ошибка при отправке отчета:', error);
      alert('Произошла ошибка при отправке отчета');
    }
  };

  return (
    <div>
      <h1>Отправка отчётов</h1>
      <ReportForm onSubmit={handleSubmit} />
    </div>
  );
};

export default HomePage;