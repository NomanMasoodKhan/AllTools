-- CyberMart MVP PostgreSQL schema
-- Naming conventions:
--   - snake_case for all identifiers
--   - plural table names
--   - *_id foreign key columns

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'developer', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS developer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  company_name TEXT,
  website_url TEXT,
  contact_email TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_profile_id UUID NOT NULL REFERENCES developer_profiles(id) ON DELETE RESTRICT,

  -- Required listing fields
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  tool_type TEXT NOT NULL CHECK (tool_type IN ('script', 'saas', 'rule_pack', 'framework')),
  supported_platforms TEXT[] NOT NULL,
  deployment_type TEXT NOT NULL,
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('free', 'paid', 'freemium')),
  developer_profile_link TEXT NOT NULL,

  -- Trust fields
  mitre_attack_techniques TEXT[],
  use_cases TEXT[] NOT NULL,
  known_limitations TEXT[] NOT NULL,
  tested_environments TEXT[] NOT NULL,
  demo_links TEXT[] NOT NULL,
  documentation_link TEXT NOT NULL,

  -- Meta fields
  version TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Moderation / publishing fields
  approval_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  publication_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (publication_status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Only approved tools can be public
  CONSTRAINT tools_published_requires_approved CHECK (
    publication_status <> 'published' OR approval_status = 'approved'
  ),
  CONSTRAINT tools_published_at_consistency CHECK (
    (publication_status = 'published' AND published_at IS NOT NULL)
    OR
    (publication_status = 'draft' AND published_at IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS tool_categories (
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tool_id, category_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One review per user per tool
  UNIQUE (tool_id, user_id)
);

CREATE TABLE IF NOT EXISTS admin_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  notes TEXT,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tools_developer_profile_id ON tools(developer_profile_id);
CREATE INDEX IF NOT EXISTS idx_tools_approval_status ON tools(approval_status);
CREATE INDEX IF NOT EXISTS idx_tools_publication_status ON tools(publication_status);
CREATE INDEX IF NOT EXISTS idx_tools_last_updated_desc ON tools(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_tool_categories_category_id ON tool_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_reviews_tool_id ON reviews(tool_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_approvals_tool_id ON admin_approvals(tool_id);
CREATE INDEX IF NOT EXISTS idx_admin_approvals_admin_user_id ON admin_approvals(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_approvals_decided_at_desc ON admin_approvals(decided_at DESC);

CREATE INDEX IF NOT EXISTS idx_tools_public_filters
  ON tools(approval_status, publication_status, tool_type, pricing_model, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_categories_category_id_tool_id
  ON tool_categories(category_id, tool_id);
CREATE INDEX IF NOT EXISTS idx_tools_public_search_tsv
  ON tools USING GIN (
    to_tsvector('simple', COALESCE(name, '') || ' ' || COALESCE(short_description, '') || ' ' || COALESCE(long_description, ''))
  );

-- Ensure admin approvals are recorded only by users with admin role.
CREATE OR REPLACE FUNCTION enforce_admin_role_for_approvals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = NEW.admin_user_id
      AND u.role = 'admin'
      AND u.is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'admin_user_id must reference an active admin user';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_admin_role_for_approvals ON admin_approvals;
CREATE TRIGGER trg_enforce_admin_role_for_approvals
BEFORE INSERT OR UPDATE ON admin_approvals
FOR EACH ROW
EXECUTE FUNCTION enforce_admin_role_for_approvals();

-- Keep tool approval_status aligned with latest admin decision.
CREATE OR REPLACE FUNCTION sync_tool_approval_status_from_admin_approvals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE tools
  SET
    approval_status = NEW.decision,
    updated_at = NOW()
  WHERE id = NEW.tool_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_tool_approval_status_from_admin_approvals ON admin_approvals;
CREATE TRIGGER trg_sync_tool_approval_status_from_admin_approvals
AFTER INSERT ON admin_approvals
FOR EACH ROW
EXECUTE FUNCTION sync_tool_approval_status_from_admin_approvals();

-- Enforce: tools must belong to at least one category.
-- Deferrable constraint trigger allows tool + categories to be inserted in one transaction.
CREATE OR REPLACE FUNCTION enforce_tool_has_category()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_tool_id UUID;
BEGIN
  v_tool_id := COALESCE(NEW.id, OLD.id);

  IF EXISTS (SELECT 1 FROM tools t WHERE t.id = v_tool_id)
     AND NOT EXISTS (SELECT 1 FROM tool_categories tc WHERE tc.tool_id = v_tool_id) THEN
    RAISE EXCEPTION 'tool % must belong to at least one category', v_tool_id;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_tool_requires_category_on_tools ON tools;
CREATE CONSTRAINT TRIGGER trg_tool_requires_category_on_tools
AFTER INSERT OR UPDATE ON tools
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION enforce_tool_has_category();

DROP TRIGGER IF EXISTS trg_tool_requires_category_on_tool_categories ON tool_categories;
CREATE CONSTRAINT TRIGGER trg_tool_requires_category_on_tool_categories
AFTER DELETE OR UPDATE ON tool_categories
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION enforce_tool_has_category();

-- Enforce: admin approval record required before publishing a tool.
CREATE OR REPLACE FUNCTION enforce_approval_record_before_publish()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.publication_status = 'published' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM admin_approvals aa
      WHERE aa.tool_id = NEW.id
        AND aa.decision = 'approved'
    ) THEN
      RAISE EXCEPTION 'tool % cannot be published without an admin approval record', NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_approval_record_before_publish ON tools;
CREATE TRIGGER trg_enforce_approval_record_before_publish
BEFORE INSERT OR UPDATE OF publication_status ON tools
FOR EACH ROW
EXECUTE FUNCTION enforce_approval_record_before_publish();


-- Enforce: reviews can only be created for approved and published tools.
CREATE OR REPLACE FUNCTION enforce_review_on_public_tool()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM tools t
    WHERE t.id = NEW.tool_id
      AND t.approval_status = 'approved'
      AND t.publication_status = 'published'
  ) THEN
    RAISE EXCEPTION 'reviews are allowed only for approved and published tools';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_review_on_public_tool ON reviews;
CREATE TRIGGER trg_enforce_review_on_public_tool
BEFORE INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION enforce_review_on_public_tool();
