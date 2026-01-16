import React from 'react';
import ReportForm from '../components/ReportForm';
import { createReport } from '../services/reportService';

const HomePage = () => {
  const handleSubmit = async (report) => {
    await createReport(report);
    alert('Отчёт успешно отправлен');
  };

  return (
    <div className="container">
      <h1>Отправка отчётов</h1>
      <p>
        Прикрепите файл по желанию, добавьте имя и текст. Связь проверяется
        автоматически.
      </p>
      <ReportForm onSubmit={handleSubmit} />
    </div>
  );
};

export default HomePage;
