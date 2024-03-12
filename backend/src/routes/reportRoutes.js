const express = require('express');
const router = express.Router();
const { getReports, uploadFile, createReport } = require('../controllers/reportController');
const multer = require('multer');
const path = require('path');

console.log('Storage destination:', path.resolve(__dirname, '..', '..', 'uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

router.get('/reports', getReports);
router.post('/reports', upload.single('fileName'), createReport);
router.get('/upload-file', upload.single('fileName'), uploadFile);

module.exports = router;