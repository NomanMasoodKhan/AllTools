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

## Tool Search and Filtering API

### API Endpoint

- `GET /api/v1/tools/public`

### Supported Query Parameters

- `search` (optional): keyword search across `name`, `short_description`, and `long_description`
- `category_id` (optional): UUID category filter
- `tool_type` (optional): `script | saas | rule_pack | framework`
- `pricing_model` (optional): `free | paid | freemium`
- `limit` (optional): `1..100`, default `20`
- `offset` (optional): `>=0`, default `0`

### Query Logic

- Only tools with `approval_status = approved` and `publication_status = published` are returned.
- Full-text search is implemented with `to_tsvector(...) @@ plainto_tsquery(...)`.
- Category filtering uses `tool_categories` joins.
- Pagination uses `LIMIT/OFFSET`.
- Total count is returned using `COUNT(*) OVER()` for efficient paginated UIs.

### Example Request

`GET /api/v1/tools/public?search=wazuh&category_id=11111111-1111-1111-1111-111111111111&tool_type=saas&pricing_model=freemium&limit=10&offset=0`

### Example Response

```json
{
  "tools": [
    {
      "id": "9f9f3f7d-b9ec-4f46-a6f0-1bfbfcb4f3e0",
      "name": "Wazuh Cloud Monitor",
      "short_description": "Continuous posture and detection monitoring for cloud workloads.",
      "tool_type": "saas",
      "pricing_model": "freemium",
      "version": "1.4.2",
      "published_at": "2026-02-10T12:00:00.000Z",
      "developer_name": "SecOps Labs",
      "categories": [
        "Wazuh / Open-Source SIEM Ecosystem",
        "Cloud Security Scanning Tools"
      ]
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```
