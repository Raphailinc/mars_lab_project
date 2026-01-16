const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

const fixturesDir = path.join(__dirname, 'fixtures');
const periodsPath = path.join(fixturesDir, 'periods.json');
const uploadDir = path.join(__dirname, 'tmp-uploads');

const writePeriods = (periods) => {
  fs.mkdirSync(path.dirname(periodsPath), { recursive: true });
  fs.writeFileSync(periodsPath, JSON.stringify(periods));
};

describe('readiness gating', () => {
  test('readyz reports 503 before Mongo connects and 200 after', async () => {
    fs.mkdirSync(fixturesDir, { recursive: true });
    fs.writeFileSync(periodsPath, '[]');

    const readyMongo = await MongoMemoryServer.create();
    let triggerConnect;
    const deferredConnect = () => {
      let resolve;
      let reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      triggerConnect = () =>
        mongoose.connect(readyMongo.getUri()).then(resolve).catch(reject);
      return promise;
    };

    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = readyMongo.getUri();
    process.env.UPLOAD_DIR = path.join(uploadDir, 'ready');
    process.env.PERIODS_FILE = path.join(fixturesDir, 'periods-ready.json');
    process.env.WATCH_PERIODS_FILE = 'false';
    process.env.DEFER_APP_START = 'true';
    fs.mkdirSync(fixturesDir, { recursive: true });
    fs.writeFileSync(process.env.PERIODS_FILE, '[]');

    jest.resetModules();
    const appInstance = require('../src/app');
    appInstance.startServer({ mongoConnect: deferredConnect });

    for (let i = 0; i < 10 && !triggerConnect; i += 1) {
      // wait for startServer to reach mongoConnect call
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    expect(typeof triggerConnect).toBe('function');
    const resBefore = await request(appInstance).get('/readyz');
    expect(resBefore.statusCode).toBe(503);

    await triggerConnect();
    await appInstance.readyPromise;

    const resAfter = await request(appInstance).get('/readyz');
    expect(resAfter.statusCode).toBe(200);

    await mongoose.connection.close();
    await readyMongo.stop();
    const { stopWatching } = require('../src/services/periodService');
    stopWatching();
    fs.rmSync(path.join(uploadDir, 'ready'), { recursive: true, force: true });
    fs.rmSync(process.env.PERIODS_FILE, { force: true });
  });
});

describe('API', () => {
  let app;
  let mongo;
  let periodService;
  const ensureConnected = async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  };

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = mongo.getUri();
    process.env.UPLOAD_DIR = uploadDir;
    process.env.PERIODS_FILE = periodsPath;
    process.env.WATCH_PERIODS_FILE = 'false';
    process.env.MAX_UPLOAD_BYTES = `${1024 * 1024}`; // 1MB
    process.env.ALLOWED_UPLOAD_EXTENSIONS = 'pdf,jpg,jpeg,png,gif,txt';
    process.env.ALLOWED_UPLOAD_MIME_TYPES =
      'application/pdf,image/jpeg,image/png,image/gif,text/plain';
    process.env.DEFER_APP_START = 'false';
    fs.mkdirSync(fixturesDir, { recursive: true });
    fs.writeFileSync(periodsPath, '[]');
    jest.resetModules();
    app = require('../src/app');
    periodService = require('../src/services/periodService');
    await mongoose.connection.asPromise();
    await app.readyPromise;
  });

  afterAll(async () => {
    await ensureConnected();
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (mongo) {
      await mongo.stop();
    }
    periodService.stopWatching();
    fs.rmSync(uploadDir, { recursive: true, force: true });
    fs.rmSync(periodsPath, { force: true });
  });

  afterEach(async () => {
    await ensureConnected();
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    fs.rmSync(uploadDir, { recursive: true, force: true });
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(periodsPath, '[]');
    await periodService.reload();
  });

  test('communication guard blocks when outside allowed period', async () => {
    const now = new Date();
    const pastStart = new Date(now.getTime() - 120000).toISOString();
    const pastEnd = new Date(now.getTime() - 60000).toISOString();
    writePeriods([{ from: pastStart, to: pastEnd }]);
    await periodService.reload();
    const res = await request(app).get('/api/check-connection');
    expect(res.statusCode).toBe(503);
  });

  test('create and list reports with pagination defaults and caps', async () => {
    for (let i = 0; i < 25; i += 1) {
      await request(app)
        .post('/api/reports')
        .send({ scientistName: `User ${i}`, reportContent: `Content ${i}` })
        .expect(201);
    }

    const listDefault = await request(app).get('/api/reports');
    expect(listDefault.statusCode).toBe(200);
    expect(listDefault.body.page).toBe(1);
    expect(listDefault.body.limit).toBe(20);
    expect(listDefault.body.total).toBe(25);
    expect(listDefault.body.totalPages).toBe(2);
    expect(listDefault.body.items).toHaveLength(20);
    expect(listDefault.body.items[0].reportContent).toBe('Content 24');

    const listCapped = await request(app).get('/api/reports?limit=200');
    expect(listCapped.statusCode).toBe(200);
    expect(listCapped.body.limit).toBe(100);
    expect(listCapped.body.total).toBe(25);
    expect(listCapped.body.items.length).toBe(25);
  });

  test('upload sanitizes traversal names', async () => {
    const filePath = path.join(fixturesDir, 'dummy.txt');
    fs.mkdirSync(fixturesDir, { recursive: true });
    fs.writeFileSync(filePath, 'hello');

    const res = await request(app)
      .post('/api/upload-file')
      .attach('file', filePath, '../evil.txt');

    expect(res.statusCode).toBe(200);
    expect(res.body.fileName).toBeDefined();
    expect(res.body.fileName).not.toMatch(/\.\./);
    expect(res.body.fileName).not.toMatch(/[\\/]/);

    const storedPath = path.join(uploadDir, res.body.fileName);
    expect(fs.existsSync(storedPath)).toBe(true);

    const resWindows = await request(app)
      .post('/api/upload-file')
      .attach('file', filePath, '..\\\\evil.txt');
    expect(resWindows.statusCode).toBe(200);
    expect(resWindows.body.fileName).not.toMatch(/\.\./);
    expect(resWindows.body.fileName).not.toMatch(/[\\/]/);
  });

  test('upload rejects disallowed file types', async () => {
    const filePath = path.join(fixturesDir, 'dummy.exe');
    fs.writeFileSync(filePath, 'bad');
    const res = await request(app)
      .post('/api/upload-file')
      .attach('file', filePath, 'dummy.exe');
    expect(res.statusCode).toBe(415);
    expect(fs.readdirSync(uploadDir)).toHaveLength(0);
  });

  test('upload rejects payloads that exceed max size', async () => {
    const largePath = path.join(fixturesDir, 'large.txt');
    const bigBuffer = Buffer.alloc(Math.ceil(1.5 * 1024 * 1024), 'a');
    fs.writeFileSync(largePath, bigBuffer);
    const res = await request(app)
      .post('/api/upload-file')
      .attach('file', largePath, 'large.txt');
    expect(res.statusCode).toBe(413);
    expect(
      fs.existsSync(path.join(uploadDir, res.body.fileName || 'nonexistent'))
    ).toBe(false);
  });
});
jest.setTimeout(20000);
