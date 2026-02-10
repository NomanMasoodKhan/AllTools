# CyberMart Frontend (Next.js App Router)

## Folder Structure

```text
frontend/
├── app/
│   ├── layout.js
│   ├── (public)/
│   │   ├── page.js
│   │   ├── categories/
│   │   │   └── page.js
│   │   └── tools/
│   │       ├── page.js
│   │       └── [toolId]/
│   │           └── page.js
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.js
│   │   └── register/
│   │       └── page.js
│   └── (dashboard)/
│       └── dashboard/
│           ├── developer/
│           │   └── page.js
│           └── admin/
│               └── page.js
├── components/
│   ├── layout/
│   │   ├── page-shell.js
│   │   ├── site-header.js
│   │   └── site-footer.js
│   ├── home/
│   │   └── home-page-content.js
│   ├── categories/
│   │   └── categories-page-content.js
│   ├── tools/
│   │   ├── tool-listing-page-content.js
│   │   └── tool-details-page-content.js
│   ├── auth/
│   │   ├── login-page-content.js
│   │   └── register-page-content.js
│   └── dashboard/
│       ├── developer-dashboard-page-content.js
│       └── admin-dashboard-page-content.js
├── lib/
│   └── api.js
├── next.config.mjs
└── package.json
```

## Component Breakdown

- `components/layout/*`
  - Shared shell primitives for all pages (header, footer, page wrapper).
- `components/home/*`
  - Home hero and marketplace overview content.
- `components/categories/*`
  - Categories page-level content and future category list modules.
- `components/tools/*`
  - Tool listing and tool detail page content wrappers.
- `components/auth/*`
  - Login/register form page containers.
- `components/dashboard/*`
  - Developer and admin dashboard page containers.

## Routing Explanation

- `app/(public)/page.js` -> `/`
  - Public landing page.
- `app/(public)/categories/page.js` -> `/categories`
  - Public categories catalog page.
- `app/(public)/tools/page.js` -> `/tools`
  - Public approved tool listing page.
- `app/(public)/tools/[toolId]/page.js` -> `/tools/:toolId`
  - Dynamic tool details page by tool ID.
- `app/(auth)/login/page.js` -> `/login`
  - Authentication login route.
- `app/(auth)/register/page.js` -> `/register`
  - Registration route.
- `app/(dashboard)/dashboard/developer/page.js` -> `/dashboard/developer`
  - Developer dashboard route (JWT + developer role guard to be applied in future auth middleware integration).
- `app/(dashboard)/dashboard/admin/page.js` -> `/dashboard/admin`
  - Admin dashboard route (JWT + admin role guard to be applied in future auth middleware integration).

Route groups (`(public)`, `(auth)`, `(dashboard)`) keep code organized by domain without changing URL paths.

## Notes

- This structure intentionally contains no styling and no UI framework bindings yet.
- It provides clear separation between routing and page-level components for maintainability.
