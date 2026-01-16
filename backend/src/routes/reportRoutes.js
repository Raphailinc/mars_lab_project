const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs/promises');

const {
  getReports,
  uploadFile,
  createReport,
} = require('../controllers/reportController');
const { scanFile } = require('../services/avService');

class UnsupportedFileTypeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnsupportedFileTypeError';
    this.statusCode = 415;
  }
}

const normalizeName = (name) =>
  path.posix.basename(
    String(name || '')
      .replace(/\0/g, '')
      .replace(/\\/g, '/')
  );
const getExtension = (name) =>
  path.posix.extname(normalizeName(name)).toLowerCase();

const buildAuthMiddleware = (requireAuth, token) => (req, res, next) => {
  if (!requireAuth) return next();
  const header = req.get('authorization') || '';
  const [scheme, credentials] = header.split(' ');
  if (scheme?.toLowerCase() === 'bearer' && credentials === token) {
    return next();
  }
  console.warn('Upload rejected (unauthorized)', { path: req.path });
  return res.status(401).json({ message: 'Unauthorized' });
};

const createReportRoutes = (config) => {
  const router = express.Router();
  const allowedExtensions = new Set(config.ALLOWED_UPLOAD_EXTENSIONS);
  const allowedMimeTypes = new Set(config.ALLOWED_UPLOAD_MIME_TYPES);

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, config.UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = getExtension(file.originalname);
      const unique = crypto.randomBytes(8).toString('hex');
      const timestamp = Date.now();
      const safeExt = allowedExtensions.has(ext) ? ext : '';
      cb(null, `${timestamp}-${unique}${safeExt}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: config.MAX_UPLOAD_BYTES },
    fileFilter: (_req, file, cb) => {
      const ext = getExtension(file.originalname);
      const mime = (file.mimetype || '').toLowerCase();
      if (allowedExtensions.has(ext) && allowedMimeTypes.has(mime)) {
        return cb(null, true);
      }
      return cb(new UnsupportedFileTypeError('Unsupported file type'));
    },
  });

  const uploadMiddleware = (req, res, next) =>
    upload.single('file')(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        console.warn('Upload rejected (too large)', {
          originalname: req?.file?.originalname,
        });
        return res.status(413).json({
          message: 'File is too large',
          limit: config.MAX_UPLOAD_BYTES,
        });
      }
      if (err instanceof UnsupportedFileTypeError || err.statusCode === 415) {
        console.warn('Upload rejected (unsupported type)', {
          originalname: req?.file?.originalname,
        });
        return res.status(415).json({ message: 'Unsupported file type' });
      }
      return next(err);
    });

  const avScanMiddleware = async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не был загружен' });
    }
    if (!config.ENABLE_AV_SCAN) return next();

    try {
      const result = await scanFile(req.file.path);
      if (!result.clean) {
        await fs.unlink(req.file.path).catch(() => {});
        console.warn('Upload rejected (AV scan failed)', {
          originalname: req.file.originalname,
        });
        return res.status(400).json({
          message: 'File failed antivirus scan',
          reason: result.reason || 'blocked',
        });
      }
      return next();
    } catch (err) {
      await fs.unlink(req.file.path).catch(() => {});
      return next(err);
    }
  };

  router.get('/reports', getReports);
  router.post('/reports', createReport);
  router.post(
    '/upload-file',
    buildAuthMiddleware(config.REQUIRE_AUTH, config.AUTH_TOKEN),
    uploadMiddleware,
    avScanMiddleware,
    uploadFile
  );

  return router;
};

module.exports = createReportRoutes;
