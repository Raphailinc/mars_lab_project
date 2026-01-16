const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const config = require('../config');

let periodsCache = [];
let periodsReady = false;
let periodsFilePath = config.PERIODS_FILE;
let watchHandler = null;
let watching = false;

const loadFromDisk = async () => {
  try {
    const raw = await fsp.readFile(periodsFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('periods.json must contain an array');
    }
    periodsCache = parsed;
    periodsReady = true;
    console.log(
      `Loaded ${periodsCache.length} communication periods from ${periodsFilePath}`
    );
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') {
      periodsCache = [];
      periodsReady = true;
      console.warn(
        `No periods.json found at ${periodsFilePath}; defaulting to open communication`
      );
      return true;
    }
    periodsReady = false;
    console.error('Failed to load periods.json', err);
    return false;
  }
};

const stopWatching = () => {
  if (watching && watchHandler) {
    fs.unwatchFile(periodsFilePath, watchHandler);
  }
  watching = false;
};

const init = async ({ filePath, watch } = {}) => {
  if (filePath) {
    periodsFilePath = path.resolve(filePath);
  }
  const loaded = await loadFromDisk();

  if (watch) {
    stopWatching();
    watchHandler = async () => {
      await loadFromDisk();
    };
    fs.watchFile(periodsFilePath, { interval: 1000 }, watchHandler);
    watching = true;
  } else {
    stopWatching();
  }

  return loaded;
};

const getPeriods = () => periodsCache;
const isReady = () => periodsReady;
const reload = () => loadFromDisk();

module.exports = {
  init,
  getPeriods,
  reload,
  isReady,
  stopWatching,
};
