const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const reportRoutes = require('./routes/reportRoutes');
const connectionRoutes = require('./routes/connectionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = 'mongodb://localhost:27017/mars_lab_database';

mongoose.connect(MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'public')));

app.use((req, res, next) => {
  if (!isCommunicationAvailable()) {
      return res.status(503).json({ message: 'Communication unavailable at the moment. Please try again later.' });
  }
  next();
});

const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '..', '..', 'uploads'),
  filename: (req, fileName, cb) => {
    cb(null, req.body.fileName);
  }
});

const upload = multer({ storage });

app.use('/api', upload.single('fileName'), reportRoutes);
app.use('/api', reportRoutes);
app.use('/api', connectionRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
