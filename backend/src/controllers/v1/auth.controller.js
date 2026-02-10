import { loginSchema, registerSchema } from '../../schemas/auth.schema.js';
import { loginUser, registerUser } from '../../services/v1/auth.service.js';

export function buildAuthController(fastify) {
  return {
    async register(request, reply) {
      const parsed = registerSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ message: 'Invalid registration payload.', issues: parsed.error.issues });
      }

      const user = await registerUser(fastify.db, parsed.data);

      return reply.code(201).send({
        user,
        message: 'User registered successfully.'
      });
    },

    async login(request, reply) {
      const parsed = loginSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ message: 'Invalid login payload.', issues: parsed.error.issues });
      }

      const user = await loginUser(fastify.db, parsed.data);

      const token = await reply.jwtSign({
        sub: user.id,
        email: user.email,
        role: user.role
      });

      return reply.send({
        token,
        tokenType: 'Bearer',
        user
      });
    },

    async me(request) {
      return {
        user: {
          id: request.user.sub,
          email: request.user.email,
          role: request.user.role
        }
      };
    },

    async adminOnly() {
      return { message: 'Admin-only protected route access granted.' };
    }
  };
}
