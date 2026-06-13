-- =============================================
-- AMBOVOX PLATFORM — INITIAL SCHEMA
-- Core tables: schools, users, profiles
-- =============================================

-- Enable UUID extension


-- =============================================
-- SCHOOLS
-- =============================================
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  subdomain VARCHAR(100) UNIQUE,
  subscription_status VARCHAR(50) DEFAULT 'trial',
  timezone VARCHAR(100) DEFAULT 'America/New_York',
  logo_url VARCHAR(500),
  primary_color VARCHAR(7) DEFAULT '#5B2C83',
  accent_color VARCHAR(7) DEFAULT '#C9A33A',
  motto VARCHAR(255),
  contact_email VARCHAR(255),
  features_enabled JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =============================================
-- USERS (extends Supabase Auth)
-- =============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id),
  username VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('operator','admin','teacher','parent','student')),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  must_change_password BOOLEAN DEFAULT FALSE,
  notification_preferences JSONB DEFAULT '{}',
  avatar_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =============================================
-- STUDENT PROFILES
-- =============================================
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id),
  student_id_number VARCHAR(50),
  grade INTEGER NOT NULL CHECK (grade >= 0 AND grade <= 12),
  ui_tier VARCHAR(10) NOT NULL CHECK (ui_tier IN ('k2','35','middle','high')),
  enrollment_date DATE,
  enrollment_status VARCHAR(50) DEFAULT 'active',
  founding_family BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TEACHER PROFILES
-- =============================================
CREATE TABLE teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id),
  employee_id VARCHAR(50),
  department VARCHAR(255),
  hire_date DATE,
  employment_status VARCHAR(50) DEFAULT 'active',
  pd_hours_completed DECIMAL(5,1) DEFAULT 0,
  pd_hours_required DECIMAL(5,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PARENT PROFILES
-- =============================================
CREATE TABLE parent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id),
  relationship_to_student VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PARENT STUDENT LINKS (sibling support)
-- =============================================
CREATE TABLE parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id),
  parent_user_id UUID NOT NULL REFERENCES users(id),
  student_user_id UUID NOT NULL REFERENCES users(id),
  relationship VARCHAR(100),
  is_primary_guardian BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_user_id, student_user_id)
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;

-- Schools: users can only see their own school
CREATE POLICY "users_see_own_school" ON schools
  FOR SELECT USING (
    id = (SELECT school_id FROM users WHERE id = auth.uid())
  );

-- Users: school isolation
CREATE POLICY "school_isolation_users" ON users
  FOR SELECT USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
    OR id = auth.uid()
  );

-- Student profiles: school isolation
CREATE POLICY "school_isolation_students" ON student_profiles
  FOR SELECT USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  );

-- Teacher profiles: school isolation
CREATE POLICY "school_isolation_teachers" ON teacher_profiles
  FOR SELECT USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  );

-- Parent profiles: school isolation
CREATE POLICY "school_isolation_parents" ON parent_profiles
  FOR SELECT USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  );

-- Parent student links: school isolation
CREATE POLICY "school_isolation_links" ON parent_student_links
  FOR SELECT USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  );

-- =============================================
-- HELPER FUNCTION: get UI tier from grade
-- =============================================
CREATE OR REPLACE FUNCTION get_ui_tier(grade INTEGER)
RETURNS VARCHAR AS $$
BEGIN
  IF grade <= 2 THEN RETURN 'k2';
  ELSIF grade <= 5 THEN RETURN '35';
  ELSIF grade <= 8 THEN RETURN 'middle';
  ELSE RETURN 'high';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- AUTO UPDATE updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_teacher_profiles_updated_at
  BEFORE UPDATE ON teacher_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_parent_profiles_updated_at
  BEFORE UPDATE ON parent_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();