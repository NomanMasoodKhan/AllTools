import { AUTH_MESSAGES } from '../config/constants.js';

export async function requireAuth(request, reply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.code(401).send({ message: AUTH_MESSAGES.unauthorized });
  }
}

export function requireRole(allowedRoles) {
  return async function roleGuard(request, reply) {
    const role = request.user?.role;

    if (!role || !allowedRoles.includes(role)) {
      return reply.code(403).send({ message: AUTH_MESSAGES.forbidden });
    }
  };
}
