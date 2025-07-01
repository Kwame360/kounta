/*
  # Additional Database Features
  
  This migration adds advanced features for the census application:
  
  1. Advanced Search Functions
  2. Data Validation Functions
  3. Reporting Views
  4. Backup and Restore Functions
  5. Data Import/Export Helpers
*/

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