const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
let token;
let noteId;

describe('Note Endpoints', () => {
  beforeAll(async () => {
    // We need a valid user and token for most note operations
    const userRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test_user@example.com', // Assuming this exists or we create it
        password: 'password123'
      });

    if (userRes.statusCode !== 200) {
      // Create user if not exists for the test
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test_user@example.com',
          password: 'password123',
          name: 'Test Note User'
        });
      token = regRes.body.token;
    } else {
      token = userRes.body.token;
    }
  });

  it('should create a new note', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Integration Note'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.role).toEqual('OWNER');
    noteId = res.body.id;
  });

  it('should fetch the list of notes', async () => {
    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should fetch a specific note', async () => {
    const res = await request(app)
      .get(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(noteId);
  });

  it('should update a note', async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Title'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.title).toEqual('Updated Title');
  });

  it('should delete a note', async () => {
    const res = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Note deleted');
  });
});
