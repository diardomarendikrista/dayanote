const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const testEmail = `test_${Math.random().toString(36).substr(2, 9)}@example.com`;
const testPassword = 'password123';

describe('Auth Endpoints', () => {
  // Clean up before/after could be added here if using a real test DB

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        name: 'Test User'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should login the registered user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should fail to login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
  });
});
