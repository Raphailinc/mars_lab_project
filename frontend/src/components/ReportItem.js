import React from 'react';

const ReportItem = ({ report }) => {
  return (
    <li>
      <p>Имя учёного: {report.scientistName}</p>
      <p>Текст отчёта: {report.reportContent}</p>
      {report.fileName && (
        <p>
          Файл: <a href={`/uploads/${report.fileName}`} target="_blank" rel="noopener noreferrer">{report.fileName}</a>
        </p>
      )}
    </li>
  );
};

export default ReportItem;
