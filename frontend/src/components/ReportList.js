import React from 'react';
import ReportItem from './ReportItem';

const ReportList = ({ reports }) => {
  return (
    <div>
      <h2>Список отчётов</h2>
      <ul>
        {reports.map((report, index) => (
          <ReportItem key={index} report={report} />
        ))}
      </ul>
    </div>
  );
};

export default ReportList;