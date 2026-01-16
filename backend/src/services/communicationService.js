const { getPeriods } = require('./periodService');

const isCommunicationAvailable = () => {
  const periods = getPeriods();
  if (!Array.isArray(periods) || periods.length === 0) return true;

  const currentDateTime = new Date();
  return periods.some((period) => {
    const start = new Date(period.from);
    const end = new Date(period.to);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return false;
    }
    return currentDateTime >= start && currentDateTime <= end;
  });
};

module.exports = { isCommunicationAvailable };
