# CyberMart Backend (Scaffold Only)

This backend is intentionally scaffolded with **no implementation yet**.

## Folder Tree

```text
backend/
├── .env.example
├── db/
│   └── schema.sql
├── package.json
├── README.md
├── scripts/
│   └── .gitkeep
├── src/
│   ├── app.js                  # legacy entry placeholder
│   ├── config.js               # legacy config placeholder
│   ├── index.js
│   ├── server.js
│   ├── config/
│   │   ├── constants.js
│   │   └── env.js
│   ├── controllers/
│   │   └── v1/
│   │       └── tool.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── plugins/
│   │   ├── auth.js             # legacy plugin placeholder
│   │   ├── db.js               # legacy plugin placeholder
│   │   ├── db.plugin.js
│   │   └── jwt.plugin.js
│   ├── repositories/
│   │   └── v1/
│   │       └── tool.repository.js
│   ├── routes/
│   │   ├── categories.js       # legacy route placeholder
│   │   ├── health.js           # legacy route placeholder
│   │   ├── tools.js            # legacy route placeholder
│   │   └── v1/
│   │       └── index.routes.js
│   ├── schemas/
│   │   └── tool.schema.js
│   ├── services/
│   │   └── v1/
│   │       └── tool.service.js
│   ├── types/
│   │   └── fastify.d.ts
│   └── utils/
│       └── logger.js
└── tests/
    ├── integration/
    │   └── .gitkeep
    └── unit/
        └── .gitkeep
```

## Folder Purpose

- `src/routes/`: Route definitions and API versioning entry points.
- `src/controllers/`: HTTP layer handlers (request/response orchestration only).
- `src/services/`: Business logic and workflow rules.
- `src/repositories/`: PostgreSQL data-access layer (queries and persistence).
- `src/middlewares/`: Cross-cutting Fastify middleware (JWT auth, error handling).
- `src/plugins/`: Fastify plugins (PostgreSQL connection and JWT setup).
- `src/config/`: Environment variable loading/validation and app constants.
- `src/schemas/`: Request/response validation schemas.
- `src/utils/`: Shared utilities (e.g., logger helpers).
- `src/types/`: Type augmentation/contracts for Fastify and shared typing.
- `db/`: SQL schema and migration-oriented database assets.
- `tests/`: Unit and integration test suites.
- `scripts/`: Operational scripts (seed, migrate, maintenance).

## Environment Variable Support (Planned)

Environment values will be loaded from `.env` using `.env.example` as template, then validated in `src/config/env.js`.

## JWT Middleware (Planned)

JWT setup will live in `src/plugins/jwt.plugin.js`, while request protection middleware will live in `src/middlewares/auth.middleware.js`.

## PostgreSQL Setup (Planned)

PostgreSQL connection and lifecycle management will live in `src/plugins/db.plugin.js`.
