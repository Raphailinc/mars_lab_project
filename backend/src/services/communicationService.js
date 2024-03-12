const { loadPeriods } = require('./periodService');

const isCommunicationAvailable = () => {
    const periods = loadPeriods();
    const currentDateTime = new Date();

    for (const period of periods) {
        const start = new Date(period.from);
        const end = new Date(period.to);

        if (currentDateTime >= start && currentDateTime <= end) {
            return true;
        }
    }

    return false;
};

module.exports = { isCommunicationAvailable };