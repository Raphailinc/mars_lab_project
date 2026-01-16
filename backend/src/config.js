const path = require('path');

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const parseNumber = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const UPLOAD_DIR = path.resolve(
  process.env.UPLOAD_DIR || path.join(ROOT_DIR, 'uploads')
);

const ALLOWED_UPLOAD_EXTENSIONS = (
  process.env.ALLOWED_UPLOAD_EXTENSIONS || 'pdf,jpg,jpeg,png,gif,txt,docx,xlsx'
)
  .split(',')
  .map((ext) => ext.trim().toLowerCase())
  .filter(Boolean)
  .map((ext) => (ext.startsWith('.') ? ext : `.${ext}`));

const ALLOWED_UPLOAD_MIME_TYPES = (
  process.env.ALLOWED_UPLOAD_MIME_TYPES ||
  'application/pdf,image/jpeg,image/png,image/gif,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
)
  .split(',')
  .map((type) => type.trim().toLowerCase())
  .filter(Boolean);

const INLINE_PUBLIC_EXTENSIONS = (
  process.env.INLINE_PUBLIC_EXTENSIONS || 'pdf,jpg,jpeg,png,gif'
)
  .split(',')
  .map((ext) => ext.trim().toLowerCase())
  .filter(Boolean)
  .map((ext) => (ext.startsWith('.') ? ext : `.${ext}`));

module.exports = Object.freeze({
  PORT: parseNumber(process.env.PORT, 3000),
  MONGO_URI:
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/mars_lab_database',
  UPLOAD_DIR,
  MAX_UPLOAD_BYTES: parseNumber(process.env.MAX_UPLOAD_BYTES, 10 * 1024 * 1024),
  SERVE_UPLOADS_PUBLIC: parseBoolean(process.env.SERVE_UPLOADS_PUBLIC, false),
  REQUIRE_AUTH: parseBoolean(process.env.REQUIRE_AUTH, false),
  AUTH_TOKEN: process.env.AUTH_TOKEN || '',
  ENABLE_AV_SCAN: parseBoolean(process.env.ENABLE_AV_SCAN, false),
  ALLOWED_UPLOAD_EXTENSIONS,
  ALLOWED_UPLOAD_MIME_TYPES,
  INLINE_PUBLIC_EXTENSIONS,
  PERIODS_FILE: path.resolve(
    process.env.PERIODS_FILE || path.join(ROOT_DIR, 'periods.json')
  ),
  WATCH_PERIODS_FILE: parseBoolean(
    process.env.WATCH_PERIODS_FILE,
    process.env.NODE_ENV !== 'production'
  ),
  DEFAULT_REPORT_PAGE: parseNumber(process.env.DEFAULT_REPORT_PAGE, 1),
  DEFAULT_REPORT_LIMIT: parseNumber(process.env.DEFAULT_REPORT_LIMIT, 20),
  MAX_REPORT_LIMIT: parseNumber(process.env.MAX_REPORT_LIMIT, 100),
});
