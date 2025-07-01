# Database Setup Instructions

This document provides comprehensive instructions for setting up the census application database.

## Prerequisites

1. Supabase project created and configured
2. Environment variables set in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Migration Files

The database setup consists of several migration files:

### 1. Core Schema (20250701211440_divine_lab.sql)
- Creates the basic `people` table
- Sets up initial RLS policies
- Creates basic triggers

### 2. Notifications (20250701211451_winter_dew.sql)
- Creates the `notifications` table
- Sets up notification policies

### 3. Complete Schema (20250101000001_complete_schema_setup.sql)
- Enhanced `people` table with all fields and constraints
- Additional tables: `user_sessions`, `audit_logs`
- Comprehensive indexes for performance
- Advanced RLS policies
- Utility functions for search and statistics
- Sample data insertion

### 4. Advanced Features (20250101000002_additional_features.sql)
- Advanced search functions
- Data validation functions
- Reporting views and statistics
- Export/import helpers
- Maintenance functions

## Setup Steps

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run each migration file in order:
   - First: `20250701211440_divine_lab.sql`
   - Second: `20250701211451_winter_dew.sql`
   - Third: `20250101000001_complete_schema_setup.sql`
   - Fourth: `20250101000002_additional_features.sql`

### Option 2: Using Supabase CLI (if available)

```bash
# Apply migrations
supabase db push

# Or apply specific migration
supabase db reset
```

### Option 3: Manual SQL Execution

Copy and paste the SQL content from each migration file into your Supabase SQL editor and execute them in order.

## Database Schema Overview

### Tables Created

1. **people** - Main census data table
   - Personal information (name, gender, date of birth, etc.)
   - Location data (region, district, electoral area, etc.)
   - Family information (clan, parents, marital status, etc.)
   - Contact and identification details
   - Work and education information
   - Metadata (created_at, updated_at, etc.)

2. **notifications** - System notifications
   - Activity tracking
   - User notifications
   - System messages

3. **user_sessions** - User session tracking
   - Login/logout tracking
   - Activity monitoring

4. **audit_logs** - Change tracking
   - All data modifications
   - User attribution
   - Historical records

### Key Features

1. **Row Level Security (RLS)**
   - All tables protected
   - Authenticated user access only
   - Granular permissions

2. **Full-Text Search**
   - Optimized search across people data
   - Trigram indexes for fuzzy matching

3. **Data Validation**
   - Constraint checks
   - Custom validation functions
   - Data integrity enforcement

4. **Performance Optimization**
   - Strategic indexes
   - Materialized views for dashboards
   - Query optimization

5. **Audit Trail**
   - Complete change tracking
   - User attribution
   - Historical data preservation

## Useful Functions

### Search Functions
```sql
-- Basic search
SELECT * FROM search_people('John');

-- Advanced search with filters
SELECT * FROM search_people_advanced(
  search_term := 'John',
  filter_region := 'Greater Accra',
  limit_count := 20
);
```

### Statistics Functions
```sql
-- Get overall statistics
SELECT get_census_statistics();

-- Get regional breakdown
SELECT * FROM get_regional_statistics();

-- Get age distribution
SELECT * FROM get_age_distribution();
```

### Data Management
```sql
-- Validate person data
SELECT validate_person_data('{"first_name": "John", "last_name": "Doe"}'::jsonb);

-- Create backup
SELECT create_people_backup();

-- Refresh dashboard stats
SELECT refresh_dashboard_stats();

-- Run maintenance
SELECT daily_maintenance();
```

## Maintenance

### Regular Tasks

1. **Daily Maintenance** (automated)
   - Clean expired notifications
   - Refresh dashboard statistics
   - Clean old audit logs

2. **Weekly Tasks**
   - Review audit logs
   - Check data integrity
   - Monitor performance

3. **Monthly Tasks**
   - Full data backup
   - Performance analysis
   - Security review

### Manual Maintenance Commands

```sql
-- Clean up expired notifications
SELECT cleanup_expired_notifications();

-- Clean up old audit logs (keep 90 days)
SELECT cleanup_old_audit_logs(90);

-- Refresh materialized views
REFRESH MATERIALIZED VIEW dashboard_stats;
```

## Security Considerations

1. **Row Level Security** is enabled on all tables
2. **Authenticated users only** can access data
3. **Audit logging** tracks all changes
4. **Data validation** prevents invalid entries
5. **Backup functions** ensure data safety

## Troubleshooting

### Common Issues

1. **Migration Errors**
   - Check if previous migrations completed
   - Verify user permissions
   - Check for conflicting data

2. **Performance Issues**
   - Run `ANALYZE` on tables
   - Check index usage
   - Monitor query performance

3. **RLS Issues**
   - Verify user authentication
   - Check policy definitions
   - Test with different user roles

### Useful Queries

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats 
WHERE schemaname = 'public';

-- Check index usage
SELECT 
  indexrelname,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes;

-- Monitor active queries
SELECT 
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

## Support

For additional support:
1. Check Supabase documentation
2. Review migration logs
3. Test with sample data
4. Monitor application logs