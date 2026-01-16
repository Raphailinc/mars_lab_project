const Report = require('../models/Report');
const config = require('../config');

const getReports = async (req, res) => {
  try {
    const page =
      parseInt(req.query.page, 10) > 0
        ? parseInt(req.query.page, 10)
        : config.DEFAULT_REPORT_PAGE;
    const requestedLimit =
      parseInt(req.query.limit, 10) > 0
        ? parseInt(req.query.limit, 10)
        : config.DEFAULT_REPORT_LIMIT;

    const limit = Math.min(requestedLimit, config.MAX_REPORT_LIMIT);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Report.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Report.countDocuments(),
    ]);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    res.json({ items, page, limit, total, totalPages });
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
      return res
        .status(400)
        .json({ message: 'scientistName и reportContent обязательны' });
    }

    const report = new Report({
      scientistName,
      reportContent,
      fileName: fileName || null,
    });

    const saved = await report.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getReports, createReport, uploadFile };
