# CyberMart Backend

Fastify backend for CyberMart MVP.

## Authentication Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me` (protected)
- `GET /api/v1/protected/admin` (protected, admin only)

## Tool Submission & Moderation Endpoints

- `POST /api/v1/tools` (protected, developer only)
  - Creates tool in `pending` approval state and `draft` visibility.
- `POST /api/v1/tools/:toolId/approve` (protected, admin only)
  - Records moderation decision and updates visibility state.
- `GET /api/v1/tools/public`
  - Returns only approved + published tools.

## Security Practices Implemented

- Password hashing with `bcryptjs` and 12 salt rounds.
- JWT signed with secret, issuer, audience, and expiry.
- Generic login error message to avoid credential enumeration.
- Role guard middleware for RBAC (`buyer`, `developer`, `admin`).
- Input validation using `zod` for auth and tool submission payloads.
- `is_active` user check at login.
- Public tool visibility restricted to approved + published records.
