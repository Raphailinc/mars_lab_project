const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const reportRoutes = require('./routes/reportRoutes');
const connectionRoutes = require('./services/connectionRoutes');
const { isCommunicationAvailable } = require('./services/communicationService');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/mars_lab_database';
const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.resolve(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

mongoose.connect(MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'public')));

app.use((req, res, next) => {
  if (!isCommunicationAvailable()) {
    return res.status(503).json({
      message:
        'Communication unavailable at the moment. Please try again later.',
    });
  }
  return next();
});

app.use('/api', reportRoutes);
app.use('/api', connectionRoutes);

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.get('*', (req, res) => {
  res.sendFile(
    path.join(__dirname, '..', '..', 'frontend', 'public', 'index.html')
  );
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
