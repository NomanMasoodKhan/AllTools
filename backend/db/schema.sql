CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'developer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS developer_profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  website_url TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY,
  developer_profile_id UUID NOT NULL REFERENCES developer_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  tool_type TEXT NOT NULL CHECK (tool_type IN ('script', 'saas', 'rule-pack', 'framework')),
  supported_platforms TEXT[] NOT NULL,
  deployment_type TEXT NOT NULL,
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('free', 'paid', 'freemium')),
  developer_profile_link TEXT NOT NULL,
  mitre_attack_techniques TEXT[],
  use_cases TEXT[] NOT NULL,
  known_limitations TEXT[] NOT NULL,
  tested_environments TEXT[] NOT NULL,
  demo_links TEXT[] NOT NULL,
  documentation_link TEXT NOT NULL,
  version TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tool_categories (
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  PRIMARY KEY (tool_id, category_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  buyer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tool_id, buyer_user_id)
);

CREATE TABLE IF NOT EXISTS saved_tools (
  buyer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (buyer_user_id, tool_id)
);
