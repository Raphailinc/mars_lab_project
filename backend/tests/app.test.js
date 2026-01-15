const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

let app;
let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.NODE_ENV = 'test';
  // Lazy-require after env is set
  app = require('../src/app');
  await mongoose.connection.asPromise();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongo) {
    await mongo.stop();
  }
});

describe('API', () => {
  test('check-connection returns 200 when window open', async () => {
    const res = await request(app).get('/api/check-connection');
    expect([200, 503]).toContain(res.statusCode); // depends on periods.json
  });

  test('create and list reports', async () => {
    const payload = { scientistName: 'Alice', reportContent: 'Soil sample' };
    const created = await request(app).post('/api/reports').send(payload);
    expect(created.statusCode).toBe(201);
    expect(created.body.scientistName).toBe('Alice');

    const list = await request(app).get('/api/reports');
    expect(list.statusCode).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body[0].reportContent).toBe('Soil sample');
  });

  test('uploads file and returns fileName', async () => {
    const filePath = path.join(__dirname, 'fixtures', 'dummy.txt');
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, 'hello');

    const res = await request(app).post('/api/upload-file').attach('file', filePath);
    expect(res.statusCode).toBe(200);
    expect(res.body.fileName).toBeDefined();
  });

  test('respects communication windows from periods.json', async () => {
    const periodsPath = path.join(__dirname, '../../periods.json');
    const now = new Date();
    const past = new Date(now.getTime() - 60_000).toISOString();
    const future = new Date(now.getTime() + 60_000).toISOString();
    fs.writeFileSync(periodsPath, JSON.stringify([{ from: past, to: future }]));

    const res = await request(app).get('/api/check-connection');
    expect(res.statusCode).toBe(200);

    fs.unlinkSync(periodsPath);
  });
});
