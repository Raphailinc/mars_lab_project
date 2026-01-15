const { loadPeriods } = require('./periodService');

const isCommunicationAvailable = () => {
  const periods = loadPeriods();
  if (!periods.length) return true;
  const currentDateTime = new Date();

  return periods.some((period) => {
    const start = new Date(period.from);
    const end = new Date(period.to);
    return currentDateTime >= start && currentDateTime <= end;
  });
};

module.exports = { isCommunicationAvailable };
