import React, { useState, useEffect } from 'react';
import { getReports } from '../services/reportService';
import ReportList from '../components/ReportList';

const ReportsPage = () => {
  console.log('Rendering ReportsPage component');
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const reportsData = await getReports();
      setReports(reportsData);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      {error ? (
        <p>{error}</p>
      ) : (
        <>
          <h1>Список отчётов</h1>
          <ReportList reports={reports} />
        </>
      )}
    </div>
  );
};

export default ReportsPage;
