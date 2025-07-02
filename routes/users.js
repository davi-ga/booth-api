const express = require('express');
const Joi = require('joi');
const router = express.Router();

// Validation schemas
const userSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(18).max(120).optional()
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  age: Joi.number().integer().min(18).max(120).optional()
});

// Mock database
let users = [
  { id: 1, name: 'João Silva', email: 'joao@example.com', age: 25, createdAt: new Date().toISOString() },
  { id: 2, name: 'Maria Santos', email: 'maria@example.com', age: 30, createdAt: new Date().toISOString() },
  { id: 3, name: 'Pedro Oliveira', email: 'pedro@example.com', age: 28, createdAt: new Date().toISOString() }
];

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// GET /api/users - List all users with pagination
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  
  let filteredUsers = users;
  
  // Search functionality
  if (search) {
    filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  res.json({
    message: 'Lista de usuários',
    users: paginatedUsers,
    pagination: {
      current_page: page,
      per_page: limit,
      total: filteredUsers.length,
      total_pages: Math.ceil(filteredUsers.length / limit)
    }
  });
});

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({
      error: 'ID deve ser um número válido'
    });
  }
  
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({
      error: 'Usuário não encontrado'
    });
  }
  
  res.json({
    message: 'Usuário encontrado',
    user
  });
});

// POST /api/users - Create new user
router.post('/', validate(userSchema), (req, res) => {
  const { name, email, age } = req.body;
  
  // Check if email already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({
      error: 'Email já está em uso'
    });
  }
  
  const newUser = {
    id: Math.max(...users.map(u => u.id)) + 1,
    name,
    email,
    age: age || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  res.status(201).json({
    message: 'Usuário criado com sucesso',
    user: newUser
  });
});

// PUT /api/users/:id - Update user
router.put('/:id', validate(updateUserSchema), (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({
      error: 'ID deve ser um número válido'
    });
  }
  
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'Usuário não encontrado'
    });
  }
  
  const { name, email, age } = req.body;
  
  // Check if email already exists (excluding current user)
  if (email) {
    const existingUser = users.find(u => u.email === email && u.id !== id);
    if (existingUser) {
      return res.status(409).json({
        error: 'Email já está em uso'
      });
    }
  }
  
  // Update user
  users[userIndex] = {
    ...users[userIndex],
    ...(name && { name }),
    ...(email && { email }),
    ...(age !== undefined && { age }),
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    message: 'Usuário atualizado com sucesso',
    user: users[userIndex]
  });
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({
      error: 'ID deve ser um número válido'
    });
  }
  
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'Usuário não encontrado'
    });
  }
  
  const deletedUser = users.splice(userIndex, 1)[0];
  
  res.json({
    message: 'Usuário removido com sucesso',
    user: deletedUser
  });
});

module.exports = router;
