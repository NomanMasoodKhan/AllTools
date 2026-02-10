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

## Review System (MVP)

### Rules Enforced

- Only authenticated users can create reviews.
- A user can submit only one review per tool.
- Reviews include both a numeric rating and written content.
- Reviews are visible only for approved and published tools.

### API Endpoints

- `GET /api/v1/tools/:toolId/reviews` (public)
  - Returns reviews only when the target tool is approved and published.
- `POST /api/v1/tools/:toolId/reviews` (authenticated)
  - Creates one review per user for the tool.

### Validation Rules

- `toolId` must be a valid UUID.
- `rating` must be an integer from `1` to `5`.
- `title` is optional, `3..140` chars when provided.
- `content` is required, `10..4000` chars.

### Database Logic

- `reviews` table already enforces one review per user per tool using `UNIQUE (tool_id, user_id)`.
- Service layer checks tool moderation/publication state before insert and before listing.
- DB trigger `enforce_review_on_public_tool` blocks insert/update reviews unless tool is `approved` + `published`.

## Developer Analytics (MVP, Read-only)

### API Endpoint

- `GET /api/v1/developer/analytics` (authenticated `developer` only)

### Metrics

- `tool_views`: sourced from `tools.view_count`
- `review_count`: total reviews per tool
- `average_rating`: average review rating per tool

### SQL Queries

Per-tool aggregation query:

```sql
SELECT
  t.id AS tool_id,
  t.name AS tool_name,
  t.approval_status,
  t.publication_status,
  t.view_count AS tool_views,
  COUNT(r.id)::INT AS review_count,
  COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)::FLOAT8 AS average_rating
FROM developer_profiles dp
INNER JOIN tools t ON t.developer_profile_id = dp.id
LEFT JOIN reviews r ON r.tool_id = t.id
WHERE dp.user_id = $1
GROUP BY t.id
ORDER BY t.created_at DESC;
```

Summary aggregation query:

```sql
SELECT
  COUNT(t.id)::INT AS tool_count,
  COALESCE(SUM(t.view_count), 0)::INT AS total_views,
  COUNT(r.id)::INT AS total_reviews,
  COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)::FLOAT8 AS average_rating
FROM developer_profiles dp
LEFT JOIN tools t ON t.developer_profile_id = dp.id
LEFT JOIN reviews r ON r.tool_id = t.id
WHERE dp.user_id = $1;
```

### Constraints

- Read-only endpoint: no mutations.
- No tracking scripts are used.
- Aggregations are computed with simple SQL queries.
