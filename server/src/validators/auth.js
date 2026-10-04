const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email format').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password must be 72 characters or fewer'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email format'),
  password: z.string().min(1, 'Password is required').max(72),
});

module.exports = { registerSchema, loginSchema };
