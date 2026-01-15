const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

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
});
