/*
  # Complete Census Database Setup
  
  This file contains all SQL code needed to set up the complete census database
  with all tables, functions, policies, and sample data.
  
  Execute this file in your Supabase SQL editor to create the entire database structure.
  
  Tables Created:
  - people (main census data)
  - notifications (system notifications)
  - user_sessions (user session tracking)
  - audit_logs (change tracking)
  
  Features:
  - Row Level Security (RLS) on all tables
  - Full-text search capabilities
  - Data validation functions
  - Statistics and reporting functions
  - Audit trail for all changes
  - Sample data for testing
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- TABLES
-- =============================================================================

-- Create people table (main census data)
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

-- Create notifications table
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

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

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

-- =============================================================================
-- INDEXES
-- =============================================================================

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

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

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

-- =============================================================================
-- SEARCH AND STATISTICS FUNCTIONS
-- =============================================================================

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

-- Create function for advanced people search with filters
CREATE OR REPLACE FUNCTION search_people_advanced(
  search_term text DEFAULT '',
  filter_region text DEFAULT '',
  filter_district text DEFAULT '',
  filter_clan text DEFAULT '',
  filter_citizenship text DEFAULT '',
  filter_gender text DEFAULT '',
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  gender text,
  age integer,
  citizenship text,
  region text,
  district text,
  electoral_area text,
  family_clan text,
  occupation text,
  created_at timestamptz,
  total_count bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_people AS (
    SELECT 
      p.id,
      p.name,
      p.gender,
      EXTRACT(YEAR FROM age(p.date_of_birth))::integer as age,
      p.citizenship,
      p.region,
      p.district,
      p.electoral_area,
      p.family_clan,
      p.occupation,
      p.created_at
    FROM people p
    WHERE 
      (search_term = '' OR (
        p.name ILIKE '%' || search_term || '%' OR
        p.hometown ILIKE '%' || search_term || '%' OR
        p.occupation ILIKE '%' || search_term || '%'
      )) AND
      (filter_region = '' OR p.region = filter_region) AND
      (filter_district = '' OR p.district = filter_district) AND
      (filter_clan = '' OR p.family_clan = filter_clan) AND
      (filter_citizenship = '' OR p.citizenship = filter_citizenship) AND
      (filter_gender = '' OR p.gender = filter_gender)
  )
  SELECT 
    fp.*,
    COUNT(*) OVER() as total_count
  FROM filtered_people fp
  ORDER BY fp.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
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

-- Create function to get regional statistics
CREATE OR REPLACE FUNCTION get_regional_statistics()
RETURNS TABLE (
  region text,
  total_people bigint,
  male_count bigint,
  female_count bigint,
  citizens bigint,
  non_citizens bigint,
  districts_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.region,
    COUNT(*) as total_people,
    COUNT(*) FILTER (WHERE p.gender = 'male') as male_count,
    COUNT(*) FILTER (WHERE p.gender = 'female') as female_count,
    COUNT(*) FILTER (WHERE p.citizenship = 'Ghanaian') as citizens,
    COUNT(*) FILTER (WHERE p.citizenship != 'Ghanaian' AND p.citizenship IS NOT NULL) as non_citizens,
    COUNT(DISTINCT p.district) as districts_count
  FROM people p
  WHERE p.region IS NOT NULL
  GROUP BY p.region
  ORDER BY total_people DESC;
END;
$$ language 'plpgsql';

-- Create function to get age distribution
CREATE OR REPLACE FUNCTION get_age_distribution()
RETURNS TABLE (
  age_group text,
  count bigint,
  percentage numeric
) AS $$
DECLARE
  total_with_age bigint;
BEGIN
  SELECT COUNT(*) INTO total_with_age 
  FROM people 
  WHERE date_of_birth IS NOT NULL;
  
  RETURN QUERY
  WITH age_groups AS (
    SELECT 
      CASE 
        WHEN EXTRACT(YEAR FROM age(date_of_birth)) < 18 THEN '0-17'
        WHEN EXTRACT(YEAR FROM age(date_of_birth)) BETWEEN 18 AND 24 THEN '18-24'
        WHEN EXTRACT(YEAR FROM age(date_of_birth)) BETWEEN 25 AND 34 THEN '25-34'
        WHEN EXTRACT(YEAR FROM age(date_of_birth)) BETWEEN 35 AND 44 THEN '35-44'
        WHEN EXTRACT(YEAR FROM age(date_of_birth)) BETWEEN 45 AND 54 THEN '45-54'
        WHEN EXTRACT(YEAR FROM age(date_of_birth)) BETWEEN 55 AND 64 THEN '55-64'
        ELSE '65+'
      END as age_group
    FROM people 
    WHERE date_of_birth IS NOT NULL
  )
  SELECT 
    ag.age_group,
    COUNT(*) as count,
    ROUND((COUNT(*)::numeric / total_with_age * 100), 2) as percentage
  FROM age_groups ag
  GROUP BY ag.age_group
  ORDER BY 
    CASE ag.age_group
      WHEN '0-17' THEN 1
      WHEN '18-24' THEN 2
      WHEN '25-34' THEN 3
      WHEN '35-44' THEN 4
      WHEN '45-54' THEN 5
      WHEN '55-64' THEN 6
      WHEN '65+' THEN 7
    END;
END;
$$ language 'plpgsql';

-- =============================================================================
-- DATA VALIDATION AND UTILITY FUNCTIONS
-- =============================================================================

-- Create function to validate person data
CREATE OR REPLACE FUNCTION validate_person_data(person_data jsonb)
RETURNS jsonb AS $$
DECLARE
  errors jsonb := '[]'::jsonb;
  warnings jsonb := '[]'::jsonb;
BEGIN
  -- Check required fields
  IF NOT (person_data ? 'first_name') OR (person_data->>'first_name') = '' THEN
    errors := errors || '["First name is required"]'::jsonb;
  END IF;
  
  IF NOT (person_data ? 'last_name') OR (person_data->>'last_name') = '' THEN
    errors := errors || '["Last name is required"]'::jsonb;
  END IF;
  
  -- Validate date of birth
  IF person_data ? 'date_of_birth' AND (person_data->>'date_of_birth') != '' THEN
    BEGIN
      PERFORM (person_data->>'date_of_birth')::date;
      -- Check if date is not in the future
      IF (person_data->>'date_of_birth')::date > CURRENT_DATE THEN
        errors := errors || '["Date of birth cannot be in the future"]'::jsonb;
      END IF;
      -- Check if person is not too old (over 150 years)
      IF (person_data->>'date_of_birth')::date < CURRENT_DATE - interval '150 years' THEN
        warnings := warnings || '["Person appears to be over 150 years old"]'::jsonb;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      errors := errors || '["Invalid date of birth format"]'::jsonb;
    END;
  END IF;
  
  -- Validate number of children
  IF person_data ? 'number_of_children' THEN
    BEGIN
      IF (person_data->>'number_of_children')::integer < 0 THEN
        errors := errors || '["Number of children cannot be negative"]'::jsonb;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      errors := errors || '["Invalid number of children"]'::jsonb;
    END;
  END IF;
  
  -- Validate contact number format (basic check)
  IF person_data ? 'contact_number' AND (person_data->>'contact_number') != '' THEN
    IF NOT (person_data->>'contact_number') ~ '^[0-9+\-\s()]+$' THEN
      warnings := warnings || '["Contact number format may be invalid"]'::jsonb;
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'valid', jsonb_array_length(errors) = 0,
    'errors', errors,
    'warnings', warnings
  );
END;
$$ language 'plpgsql';

-- Create function to export data as JSON
CREATE OR REPLACE FUNCTION export_people_data(
  include_personal_info boolean DEFAULT true,
  filter_region text DEFAULT '',
  filter_district text DEFAULT ''
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  IF include_personal_info THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', id,
        'name', name,
        'gender', gender,
        'date_of_birth', date_of_birth,
        'citizenship', citizenship,
        'region', region,
        'district', district,
        'electoral_area', electoral_area,
        'family_clan', family_clan,
        'occupation', occupation,
        'education_level', education_level,
        'created_at', created_at
      )
    ) INTO result
    FROM people
    WHERE 
      (filter_region = '' OR region = filter_region) AND
      (filter_district = '' OR district = filter_district);
  ELSE
    -- Export only non-personal statistical data
    SELECT jsonb_agg(
      jsonb_build_object(
        'region', region,
        'district', district,
        'electoral_area', electoral_area,
        'gender', gender,
        'age_group', 
          CASE 
            WHEN EXTRACT(YEAR FROM age(date_of_birth)) < 18 THEN '0-17'
            WHEN EXTRACT(YEAR FROM age(date_of_birth)) BETWEEN 18 AND 34 THEN '18-34'
            WHEN EXTRACT(YEAR FROM age(date_of_birth)) BETWEEN 35 AND 54 THEN '35-54'
            ELSE '55+'
          END,
        'citizenship', citizenship,
        'family_clan', family_clan,
        'education_level', education_level
      )
    ) INTO result
    FROM people
    WHERE 
      (filter_region = '' OR region = filter_region) AND
      (filter_district = '' OR district = filter_district);
  END IF;
  
  RETURN jsonb_build_object(
    'exported_at', now(),
    'total_records', jsonb_array_length(result),
    'includes_personal_info', include_personal_info,
    'data', result
  );
END;
$$ language 'plpgsql';

-- Create function to backup people data
CREATE OR REPLACE FUNCTION create_people_backup()
RETURNS jsonb AS $$
DECLARE
  backup_data jsonb;
  backup_id uuid;
BEGIN
  backup_id := gen_random_uuid();
  
  SELECT jsonb_build_object(
    'backup_id', backup_id,
    'created_at', now(),
    'total_records', COUNT(*),
    'data', jsonb_agg(to_jsonb(p))
  ) INTO backup_data
  FROM people p;
  
  -- Log the backup creation
  INSERT INTO notifications (type, message, details, metadata)
  VALUES (
    'system',
    'Data backup created',
    'Full backup of people data created',
    jsonb_build_object('backup_id', backup_id, 'record_count', backup_data->'total_records')
  );
  
  RETURN backup_data;
END;
$$ language 'plpgsql';

-- Create function to clean up old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep integer DEFAULT 90)
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM audit_logs 
  WHERE changed_at < now() - (days_to_keep || ' days')::interval;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  INSERT INTO notifications (type, message, details)
  VALUES (
    'system',
    'Audit logs cleaned up',
    'Removed ' || deleted_count || ' old audit log entries'
  );
  
  RETURN deleted_count;
END;
$$ language 'plpgsql';

-- =============================================================================
-- MATERIALIZED VIEWS
-- =============================================================================

-- Create materialized view for dashboard statistics (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
  COUNT(*) as total_people,
  COUNT(DISTINCT region) as total_regions,
  COUNT(DISTINCT district) as total_districts,
  COUNT(DISTINCT family_clan) as total_clans,
  COUNT(*) FILTER (WHERE citizenship = 'Ghanaian') as citizens,
  COUNT(*) FILTER (WHERE citizenship != 'Ghanaian' AND citizenship IS NOT NULL) as non_citizens,
  COUNT(*) FILTER (WHERE gender = 'male') as male_count,
  COUNT(*) FILTER (WHERE gender = 'female') as female_count,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - interval '7 days') as new_this_week,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - interval '30 days') as new_this_month,
  AVG(EXTRACT(YEAR FROM age(date_of_birth))) as average_age
FROM people;

-- Create unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS dashboard_stats_unique ON dashboard_stats ((1));

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ language 'plpgsql';

-- Create a scheduled job function (to be called by cron or similar)
CREATE OR REPLACE FUNCTION daily_maintenance()
RETURNS void AS $$
BEGIN
  -- Clean up expired notifications
  PERFORM cleanup_expired_notifications();
  
  -- Refresh dashboard stats
  PERFORM refresh_dashboard_stats();
  
  -- Clean up old audit logs (keep 90 days)
  PERFORM cleanup_old_audit_logs(90);
  
  -- Log maintenance completion
  INSERT INTO notifications (type, message, details)
  VALUES (
    'system',
    'Daily maintenance completed',
    'Automated maintenance tasks completed successfully'
  );
END;
$$ language 'plpgsql';

-- =============================================================================
-- VIEWS
-- =============================================================================

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

-- =============================================================================
-- PERMISSIONS
-- =============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =============================================================================
-- SAMPLE DATA
-- =============================================================================

-- Insert sample data for testing (only if no data exists)
DO $$
BEGIN
  -- Only insert if no data exists
  IF NOT EXISTS (SELECT 1 FROM people LIMIT 1) THEN
    
    -- Insert Person 1: Kwame Asante (Male, from Ashanti Region)
    INSERT INTO people (
      first_name, last_name, middle_name, gender, date_of_birth, place_of_birth,
      citizenship, hometown, region, district, electoral_area, marital_status,
      number_of_children, residential_address, gps_address, home_type,
      family_clan, clan_head, contact_number, father_name, mother_name,
      id_type, id_number, occupation, place_of_work, education_level,
      school_name, photo_url
    ) VALUES (
      'Kwame', 'Asante', 'Osei', 'male', '1985-03-15', 'Kumasi',
      'Ghanaian', 'Kumasi', 'Ashanti', 'KUMASI METROPOLITAN', 'ADUM', 'married',
      2, 'House No. 45, Adum Street, Kumasi', 'AK-123-4567', 'owned',
      'Asona', 'Nana Kwaku Asona', '+233244567890', 'Osei Kwame', 'Akosua Manu',
      'national_id', 'GHA-123456789-0', 'Teacher', 'Kumasi Senior High School', 'Bachelor''s Degree',
      'University of Cape Coast', 'https://example.com/photos/kwame_asante.jpg'
    );

    -- Insert Person 2: Akosua Mensah (Female, from Greater Accra Region)
    INSERT INTO people (
      first_name, last_name, middle_name, gender, date_of_birth, place_of_birth,
      citizenship, hometown, region, district, electoral_area, marital_status,
      number_of_children, residential_address, gps_address, home_type,
      landlord_name, landlord_contact, family_clan, clan_head, contact_number,
      father_name, mother_name, id_type, id_number, occupation, place_of_work,
      education_level, school_name, photo_url
    ) VALUES (
      'Akosua', 'Mensah', 'Ama', 'female', '1992-07-22', 'Accra',
      'Ghanaian', 'Tema', 'Greater Accra', 'TEMA METROPOLITAN', 'TEMA NEWTOWN', 'single',
      0, 'Apt 12B, Community 8, Tema', 'GA-789-1234', 'rented',
      'Mr. Joseph Tetteh', '+233201234567', 'Aduana', 'Nana Yaw Aduana', '+233277654321',
      'Kwame Mensah', 'Ama Serwaa', 'drivers_license', 'DL-987654321', 'Software Developer', 'Tech Solutions Ghana Ltd',
      'Master''s Degree', 'University of Ghana', 'https://example.com/photos/akosua_mensah.jpg'
    );

    -- Insert Person 3: Kofi Boateng (Male, from Western Region)
    INSERT INTO people (
      first_name, last_name, gender, date_of_birth, place_of_birth,
      citizenship, hometown, region, district, electoral_area, marital_status,
      number_of_children, residential_address, gps_address, home_type,
      family_clan, clan_head, contact_number, father_name, mother_name,
      id_type, id_number, occupation, place_of_work, education_level,
      school_name, photo_url
    ) VALUES (
      'Kofi', 'Boateng', 'male', '1978-11-08', 'Takoradi',
      'Ghanaian', 'Sekondi', 'Western', 'SEKONDI-TAKORADI METROPOLITAN', 'SEKONDI', 'divorced',
      1, 'Block 5, Sekondi Estate', 'WR-456-7890', 'family',
      'Bretuo', 'Nana Kofi Bretuo', '+233208765432', 'Yaw Boateng', 'Efua Adjei',
      'national_id', 'GHA-987654321-1', 'Fisherman', 'Sekondi Fishing Harbor', 'Junior High School',
      'Sekondi Methodist JHS', 'https://example.com/photos/kofi_boateng.jpg'
    );

    -- Insert additional sample people
    INSERT INTO people (
      first_name, last_name, gender, citizenship, region, district, family_clan
    ) VALUES 
    ('Ama', 'Serwaa', 'female', 'Ghanaian', 'Greater Accra', 'GA CENTRAL', 'Aduana'),
    ('Yaw', 'Osei', 'male', 'Ghanaian', 'Ashanti', 'KUMASI METROPOLITAN', 'Asona'),
    ('Efua', 'Adjei', 'female', 'Ghanaian', 'Western', 'SHAMA', 'Bretuo'),
    ('Kojo', 'Mensah', 'male', 'Ghanaian', 'Central', 'CAPE COAST', 'Ekuona'),
    ('Adwoa', 'Nyong', 'female', 'Ghanaian', 'Volta', 'HO MUNICIPAL', 'Oyoko');
    
    -- Add a sample notification
    INSERT INTO notifications (type, message, details) VALUES 
    ('system', 'Database initialized', 'Census database has been set up successfully with sample data');
    
  END IF;
END $$;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- Log successful setup
INSERT INTO notifications (type, message, details) VALUES 
('system', 'Complete database setup executed', 'All tables, functions, policies, and sample data have been created successfully');

-- Display completion message
DO $$
BEGIN
  RAISE NOTICE 'Census database setup completed successfully!';
  RAISE NOTICE 'Tables created: people, notifications, user_sessions, audit_logs';
  RAISE NOTICE 'Sample data inserted: % people', (SELECT COUNT(*) FROM people);
  RAISE NOTICE 'You can now connect your application to this database.';
END $$;