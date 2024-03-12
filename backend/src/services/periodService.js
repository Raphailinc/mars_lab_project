const fs = require('fs');
const path = require('path');

const loadPeriods = () => {
    const filePath = path.join(__dirname, '../../periods.json');
    const periodsData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(periodsData);
};

module.exports = { loadPeriods };