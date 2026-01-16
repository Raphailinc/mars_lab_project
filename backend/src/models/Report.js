const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    scientistName: {
      type: String,
      required: true,
    },
    reportContent: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

reportSchema.index({ createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
