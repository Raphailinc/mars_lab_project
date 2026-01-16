const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs/promises');

const config = require('./config');
const createReportRoutes = require('./routes/reportRoutes');
const connectionRoutes = require('./services/connectionRoutes');
const periodService = require('./services/periodService');
const { isCommunicationAvailable } = require('./services/communicationService');

const app = express();
const readiness = { mongo: false, periods: false };

app.use(cors());
app.use(express.json());

app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }));
app.get('/readyz', (_req, res) => {
  const ready = readiness.mongo && periodService.isReady();
  if (ready) {
    return res.status(200).json({ status: 'ready' });
  }
  return res.status(503).json({
    status: 'not_ready',
    mongo: readiness.mongo,
    periods: periodService.isReady(),
  });
});

if (config.SERVE_UPLOADS_PUBLIC) {
  const safeInline = new Set(config.INLINE_PUBLIC_EXTENSIONS);
  const uploadsStatic = express.static(config.UPLOAD_DIR, {
    fallthrough: true,
  });
  app.use('/uploads', (req, res, next) => {
    const ext = path.extname(req.path).toLowerCase();
    if (!safeInline.has(ext)) {
      res.setHeader('Content-Disposition', 'attachment');
    }
    uploadsStatic(req, res, (err) => {
      if (err && err.status === 404) {
        return res.status(404).json({ message: 'File not found' });
      }
      return next(err);
    });
  });
}

app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'public')));

const communicationGuard = (req, res, next) => {
  if (!isCommunicationAvailable()) {
    return res.status(503).json({
      message:
        'Communication unavailable at the moment. Please try again later.',
    });
  }
  return next();
};

app.use('/api', communicationGuard);
app.use('/api', connectionRoutes);
app.use('/api', createReportRoutes(config));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.get('*', (req, res) => {
  res.sendFile(
    path.join(__dirname, '..', '..', 'frontend', 'public', 'index.html')
  );
});

const startServer = async ({
  mongoConnect = mongoose.connect,
  periodsOptions = {},
} = {}) => {
  try {
    await fs.mkdir(config.UPLOAD_DIR, { recursive: true });
    console.log(`Upload directory ready at ${config.UPLOAD_DIR}`);

    readiness.periods = await periodService.init({
      filePath: config.PERIODS_FILE,
      watch: config.WATCH_PERIODS_FILE,
      ...periodsOptions,
    });
    if (readiness.periods) {
      console.log('Loaded communication periods cache');
    } else {
      console.warn(
        'Communication periods cache not ready; proceeding with defaults'
      );
    }

    await mongoConnect(config.MONGO_URI);
    readiness.mongo = true;
    console.log('Connected to MongoDB');

    if (process.env.NODE_ENV !== 'test') {
      app.listen(config.PORT, () => {
        console.log(`Server is running on port ${config.PORT}`);
      });
    }
    return true;
  } catch (err) {
    console.error('Failed to start server', err);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw err;
  }
};

const shouldAutoStart = process.env.DEFER_APP_START !== 'true';
const assignReadyPromise = (promise) => {
  app.readyPromise = promise;
  return promise;
};

if (shouldAutoStart) {
  assignReadyPromise(startServer());
} else {
  assignReadyPromise(Promise.resolve());
}

app.startServer = (options) => assignReadyPromise(startServer(options));
app.readiness = readiness;

module.exports = app;
