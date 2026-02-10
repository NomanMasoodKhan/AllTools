# CyberMart Backend

Fastify backend for CyberMart MVP.

## Authentication Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me` (protected)
- `GET /api/v1/protected/admin` (protected, admin only)

## Security Practices Implemented

- Password hashing with `bcryptjs` and 12 salt rounds.
- JWT signed with secret, issuer, audience, and expiry.
- Generic login error message to avoid credential enumeration.
- Role guard middleware for RBAC (`buyer`, `developer`, `admin`).
- Input validation using `zod` for registration and login payloads.
- `is_active` user check at login.
