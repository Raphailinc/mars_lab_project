const Report = require('../models/Report');

const getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не был загружен' });
    }
    return res.status(200).json({ fileName: req.file.filename });
  } catch (error) {
    console.error('Ошибка при загрузке файла:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const createReport = async (req, res) => {
  try {
    const { scientistName, reportContent, fileName } = req.body;
    if (!scientistName || !reportContent) {
      return res.status(400).json({ message: 'scientistName и reportContent обязательны' });
    }

    const report = new Report({
      scientistName,
      reportContent,
      fileName: fileName || null
    });

    const saved = await report.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getReports, createReport, uploadFile };
