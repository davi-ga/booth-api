const request = require('supertest');
const app = require('../app/server');

describe('API Endpoints', () => {
  // Test the root endpoint
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);
      
      expect(res.body.message).toBe('Bem-vindo à Booth API!');
      expect(res.body.status).toBe('running');
    });
  });

  // Test health endpoint
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(res.body.status).toBe('healthy');
      expect(res.body.uptime).toBeDefined();
    });
  });

  // Test users endpoints
  describe('Users API', () => {
    describe('GET /api/users', () => {
      it('should return list of users', async () => {
        const res = await request(app)
          .get('/api/users')
          .expect(200);
        
        expect(res.body.users).toBeDefined();
        expect(Array.isArray(res.body.users)).toBe(true);
        expect(res.body.pagination).toBeDefined();
      });

      it('should support pagination', async () => {
        const res = await request(app)
          .get('/api/users?page=1&limit=2')
          .expect(200);
        
        expect(res.body.pagination.per_page).toBe(2);
        expect(res.body.pagination.current_page).toBe(1);
      });

      it('should support search', async () => {
        const res = await request(app)
          .get('/api/users?search=João')
          .expect(200);
        
        expect(res.body.users.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('GET /api/users/:id', () => {
      it('should return user by id', async () => {
        const res = await request(app)
          .get('/api/users/1')
          .expect(200);
        
        expect(res.body.user).toBeDefined();
        expect(res.body.user.id).toBe(1);
      });

      it('should return 404 for non-existent user', async () => {
        const res = await request(app)
          .get('/api/users/999')
          .expect(404);
        
        expect(res.body.error).toBe('Usuário não encontrado');
      });

      it('should return 400 for invalid id', async () => {
        const res = await request(app)
          .get('/api/users/invalid')
          .expect(400);
        
        expect(res.body.error).toBe('ID deve ser um número válido');
      });
    });

    describe('POST /api/users', () => {
      it('should create a new user', async () => {
        const newUser = {
          name: 'Teste User',
          email: 'teste@example.com',
          age: 25
        };

        const res = await request(app)
          .post('/api/users')
          .send(newUser)
          .expect(201);
        
        expect(res.body.user.name).toBe(newUser.name);
        expect(res.body.user.email).toBe(newUser.email);
        expect(res.body.user.id).toBeDefined();
      });

      it('should validate required fields', async () => {
        const res = await request(app)
          .post('/api/users')
          .send({})
          .expect(400);
        
        expect(res.body.error).toBe('Dados inválidos');
        expect(res.body.details).toBeDefined();
      });

      it('should prevent duplicate emails', async () => {
        const user = {
          name: 'Test User',
          email: 'joao@example.com' // Email that already exists
        };

        const res = await request(app)
          .post('/api/users')
          .send(user)
          .expect(409);
        
        expect(res.body.error).toBe('Email já está em uso');
      });
    });
  });

  // Test 404 handler
  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await request(app)
        .get('/api/non-existent')
        .expect(404);
      
      expect(res.body.error).toBe('Rota não encontrada');
      expect(res.body.path).toBe('/api/non-existent');
    });
  });
});
