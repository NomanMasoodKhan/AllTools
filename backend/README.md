# CyberMart Backend

Fastify backend for CyberMart MVP.

## Admin Approval Workflow for Tools

### API Endpoints

- `POST /api/v1/tools` (authenticated `developer` only)
  - Submit a tool for moderation.
- `GET /api/v1/admin/tools/pending` (authenticated `admin` only)
  - View tools awaiting moderation.
- `POST /api/v1/tools/:toolId/approve` (authenticated `admin` only)
  - Moderate a tool with decision and reason (required on rejection).
- `GET /api/v1/tools/public` (public)
  - View only approved + published tools.

### Status Transitions

- On submission: `approval_status = pending`, `publication_status = draft`.
- On admin approval: `approval_status = approved`, `publication_status = published`, `published_at = NOW()`.
- On admin rejection: `approval_status = rejected`, `publication_status = draft`, `published_at = NULL`.
- Re-moderation is blocked once a tool leaves `pending` state.

### Database Updates

- Tool submission inserts into `tools` and `tool_categories` in a single transaction.
- Admin moderation inserts into `admin_approvals` with decision and reason/notes.
- Tool visibility fields are updated atomically during moderation transaction.
- Public listing query filters by `approval_status = approved` and `publication_status = published`.

### Access Control Logic

- Submission endpoint requires JWT + role `developer`.
- Pending review list and moderation endpoint require JWT + role `admin`.
- Public listing endpoint does not require authentication.

### Tool Submission Required Fields

- `name`
- `short_description`
- `long_description`
- `category_ids` (at least one)
- `tool_type`
- `supported_platforms`
- `deployment_type`
- `pricing_model`
- `documentation_url`
- `version`
