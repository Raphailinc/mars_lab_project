const Report = require('../models/Report');

const getReports = async (req, res) => {
  try {
    const reports = await Report.find();
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
    const fileName = req.file.filename;
    return res.status(200).json({ fileName });
  } catch (error) {
    console.error('Ошибка при загрузке файла:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const createReport = async (req, res) => {
  console.log('Received report data:', req.body);
  console.log('Received file:', req.file);

  const { scientistName, reportContent, fileName } = req.body;

  const report = new Report({
    scientistName,
    reportContent,
    fileName
  });

  try {
    const newReport = await report.save();
    res.status(201).json(newReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getReports, createReport, uploadFile };
