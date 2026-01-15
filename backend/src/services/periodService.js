const fs = require('fs');
const path = require('path');

const loadPeriods = () => {
  try {
    const filePath = path.join(__dirname, '../../periods.json');
    if (!fs.existsSync(filePath)) return [];
    const periodsData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(periodsData);
  } catch (err) {
    console.error('Failed to load periods.json', err);
    return [];
  }
};

module.exports = { loadPeriods };
