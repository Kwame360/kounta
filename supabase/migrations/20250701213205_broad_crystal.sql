/*
  # Complete Database Schema Setup
  
  This migration creates a comprehensive database schema for the census application
  with all necessary tables, indexes, policies, and functions.
  
  1. Tables Created:
     - people (main census data)
     - notifications (system notifications)
     - user_sessions (optional user session tracking)
     
  2. Security:
     - Row Level Security enabled on all tables
     - Policies for authenticated users
     - Secure functions for data operations
     
  3. Performance:
     - Indexes on frequently queried columns
     - Full-text search capabilities
     
  4. Data Integrity:
     - Constraints and validations
     - Triggers for automatic timestamps
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create people table (enhanced version)
CREATE TABLE IF NOT EXISTS people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Personal Information
  first_name text NOT NULL,
  last_name text NOT NULL,
  middle_name text,
  name text GENERATED ALWAYS AS (
    CASE 
      WHEN middle_name IS NOT NULL AND middle_name != '' 
      THEN first_name || ' ' || middle_name || ' ' || last_name
      ELSE first_name || ' ' || last_name
    END
  ) STORED,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth date,
  place_of_birth text,
  citizenship text,
  
  -- Location Information
  hometown text,
  region text,
  district text,
  electoral_area text,
  residential_address text,
  gps_address text,
  home_type text CHECK (home_type IN ('rented', 'owned', 'family')),
  landlord_name text,
  landlord_contact text,
  
  -- Family Information
  family_clan text,
  clan_head text,
  father_name text,
  mother_name text,
  marital_status text CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  number_of_children integer DEFAULT 0 CHECK (number_of_children >= 0),
  
  -- Contact Information
  contact_number text,
  id_type text CHECK (id_type IN ('drivers_license', 'national_id', 'passport', 'voter_id')),
  id_number text,
  
  -- Work & Education
  occupation text,
  place_of_work text,
  education_level text CHECK (education_level IN (
    'No formal education', 'Primary', 'Junior High School', 'Senior High School',
    'Technical/Vocational', 'Bachelor''s Degree', 'Master''s Degree', 'Doctorate', 'Other'
  )),
  school_name text,
  
  -- Media
  photo_url text,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Create notifications table (enhanced version)
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('create', 'update', 'delete', 'print', 'export', 'import', 'system')),
  message text NOT NULL,
  details text,
  metadata jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

-- Create user sessions table for tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  ip_address inet,
  user_agent text,
  actions_performed integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create audit log table for tracking changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for people table
CREATE POLICY "Allow authenticated users to view all people"
  ON people FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert people"
  ON people FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update people"
  ON people FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete people"
  ON people FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for notifications table
CREATE POLICY "Allow authenticated users to view all notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for user_sessions table
CREATE POLICY "Users can view their own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON user_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON user_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for audit_logs table
CREATE POLICY "Allow authenticated users to view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_people_name ON people USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_people_region ON people(region);
CREATE INDEX IF NOT EXISTS idx_people_district ON people(district);
CREATE INDEX IF NOT EXISTS idx_people_electoral_area ON people(electoral_area);
CREATE INDEX IF NOT EXISTS idx_people_family_clan ON people(family_clan);
CREATE INDEX IF NOT EXISTS idx_people_citizenship ON people(citizenship);
CREATE INDEX IF NOT EXISTS idx_people_created_at ON people(created_at);
CREATE INDEX IF NOT EXISTS idx_people_updated_at ON people(updated_at);

CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit_logs(changed_at);

-- Create functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications 
  WHERE expires_at < now() AND expires_at IS NOT NULL;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER people_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON people
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Create a function to search people
CREATE OR REPLACE FUNCTION search_people(search_term text)
RETURNS TABLE (
  id uuid,
  name text,
  region text,
  district text,
  family_clan text,
  citizenship text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.region,
    p.district,
    p.family_clan,
    p.citizenship,
    p.created_at
  FROM people p
  WHERE 
    p.name ILIKE '%' || search_term || '%' OR
    p.region ILIKE '%' || search_term || '%' OR
    p.district ILIKE '%' || search_term || '%' OR
    p.family_clan ILIKE '%' || search_term || '%' OR
    p.hometown ILIKE '%' || search_term || '%'
  ORDER BY p.created_at DESC;
END;
$$ language 'plpgsql';

-- Create a function to get statistics
CREATE OR REPLACE FUNCTION get_census_statistics()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_people', (SELECT COUNT(*) FROM people),
    'total_regions', (SELECT COUNT(DISTINCT region) FROM people WHERE region IS NOT NULL),
    'total_districts', (SELECT COUNT(DISTINCT district) FROM people WHERE district IS NOT NULL),
    'total_clans', (SELECT COUNT(DISTINCT family_clan) FROM people WHERE family_clan IS NOT NULL),
    'citizens', (SELECT COUNT(*) FROM people WHERE citizenship = 'Ghanaian'),
    'non_citizens', (SELECT COUNT(*) FROM people WHERE citizenship != 'Ghanaian' AND citizenship IS NOT NULL),
    'male_count', (SELECT COUNT(*) FROM people WHERE gender = 'male'),
    'female_count', (SELECT COUNT(*) FROM people WHERE gender = 'female'),
    'recent_registrations', (SELECT COUNT(*) FROM people WHERE created_at >= now() - interval '30 days')
  ) INTO result;
  
  RETURN result;
END;
$$ language 'plpgsql';

-- Insert some sample data for testing (optional)
DO $$
BEGIN
  -- Only insert if no data exists
  IF NOT EXISTS (SELECT 1 FROM people LIMIT 1) THEN
    INSERT INTO people (
      first_name, last_name, gender, citizenship, region, district, family_clan
    ) VALUES 
    ('John', 'Doe', 'male', 'Ghanaian', 'Greater Accra', 'GA CENTRAL', 'Aduana'),
    ('Jane', 'Smith', 'female', 'Ghanaian', 'Ashanti', 'KUMASI METROPOLITAN', 'Asona'),
    ('Michael', 'Johnson', 'male', 'Ghanaian', 'Western', 'SHAMA', 'Bretuo');
    
    -- Add a sample notification
    INSERT INTO notifications (type, message, details) VALUES 
    ('system', 'Database initialized', 'Census database has been set up successfully with sample data');
  END IF;
END $$;

-- Create a view for easy reporting
CREATE OR REPLACE VIEW people_summary AS
SELECT 
  id,
  name,
  gender,
  date_of_birth,
  EXTRACT(YEAR FROM age(date_of_birth)) as age,
  citizenship,
  region,
  district,
  electoral_area,
  family_clan,
  marital_status,
  number_of_children,
  occupation,
  education_level,
  created_at
FROM people
ORDER BY created_at DESC;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;