import bcrypt from 'bcryptjs';

import { AUTH_MESSAGES } from '../../config/constants.js';
import { createUser, findUserByEmail } from '../../repositories/v1/user.repository.js';

const SALT_ROUNDS = 12;

export async function registerUser(db, payload) {
  const email = payload.email.trim().toLowerCase();

  const existing = await findUserByEmail(db, email);
  if (existing) {
    const error = new Error('Email already in use.');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);

  return createUser(db, {
    email,
    passwordHash,
    role: payload.role
  });
}

export async function loginUser(db, payload) {
  const email = payload.email.trim().toLowerCase();
  const user = await findUserByEmail(db, email);

  if (!user || !user.is_active) {
    const error = new Error(AUTH_MESSAGES.invalidCredentials);
    error.statusCode = 401;
    throw error;
  }

  const isValid = await bcrypt.compare(payload.password, user.password_hash);
  if (!isValid) {
    const error = new Error(AUTH_MESSAGES.invalidCredentials);
    error.statusCode = 401;
    throw error;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role
  };
}
