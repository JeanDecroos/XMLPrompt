-- XMLPrompter Database RPC Functions
-- Enable MCP to execute SQL directly through Supabase
-- Execute this in Supabase SQL Editor to enable MCP SQL execution

-- =============================================================================
-- PART 1: CORE RPC FUNCTIONS FOR MCP INTEGRATION
-- =============================================================================

-- Function to execute arbitrary SQL (admin use only)
CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    row_count integer;
BEGIN
    -- Security check: only allow for authenticated users with proper role
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Execute the SQL
    EXECUTE sql_query;
    
    -- Get row count for DML operations
    GET DIAGNOSTICS row_count = ROW_COUNT;
    
    -- Return success result
    result := jsonb_build_object(
        'success', true,
        'rows_affected', row_count,
        'message', 'Query executed successfully'
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    -- Return error information
    result := jsonb_build_object(
        'success', false,
        'error_code', SQLSTATE,
        'error_message', SQLERRM,
        'rows_affected', 0
    );
    
    RETURN result;
END;
$$;

-- Function to execute SELECT queries and return results
CREATE OR REPLACE FUNCTION public.exec_query(sql_query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    query_result jsonb;
BEGIN
    -- Security check
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Only allow SELECT statements for safety
    IF UPPER(TRIM(sql_query)) NOT LIKE 'SELECT%' THEN
        RAISE EXCEPTION 'Only SELECT queries are allowed. Use exec_sql for other operations.';
    END IF;

    -- Execute the query and convert to JSON
    EXECUTE format('SELECT jsonb_agg(row_to_json(t)) FROM (%s) t', sql_query) INTO query_result;
    
    result := jsonb_build_object(
        'success', true,
        'data', COALESCE(query_result, '[]'::jsonb),
        'message', 'Query executed successfully'
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    result := jsonb_build_object(
        'success', false,
        'error_code', SQLSTATE,
        'error_message', SQLERRM,
        'data', '[]'::jsonb
    );
    
    RETURN result;
END;
$$;

-- Function to safely execute database migrations
CREATE OR REPLACE FUNCTION public.exec_migration(migration_name text, sql_query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    row_count integer;
    migration_id uuid;
BEGIN
    -- Security check
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Create migrations table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.migrations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text UNIQUE NOT NULL,
        sql_content text NOT NULL,
        executed_at timestamp with time zone DEFAULT now(),
        executed_by uuid REFERENCES auth.users(id),
        success boolean DEFAULT true,
        error_message text
    );

    -- Check if migration already exists
    IF EXISTS (SELECT 1 FROM public.migrations WHERE name = migration_name) THEN
        RAISE EXCEPTION 'Migration % already exists', migration_name;
    END IF;

    -- Execute the migration
    BEGIN
        EXECUTE sql_query;
        GET DIAGNOSTICS row_count = ROW_COUNT;
        
        -- Record successful migration
        INSERT INTO public.migrations (name, sql_content, executed_by, success)
        VALUES (migration_name, sql_query, auth.uid(), true)
        RETURNING id INTO migration_id;
        
        result := jsonb_build_object(
            'success', true,
            'migration_id', migration_id,
            'migration_name', migration_name,
            'rows_affected', row_count,
            'message', 'Migration executed successfully'
        );
        
    EXCEPTION WHEN OTHERS THEN
        -- Record failed migration
        INSERT INTO public.migrations (name, sql_content, executed_by, success, error_message)
        VALUES (migration_name, sql_query, auth.uid(), false, SQLERRM)
        RETURNING id INTO migration_id;
        
        result := jsonb_build_object(
            'success', false,
            'migration_id', migration_id,
            'migration_name', migration_name,
            'error_code', SQLSTATE,
            'error_message', SQLERRM,
            'rows_affected', 0
        );
    END;
    
    RETURN result;
END;
$$;

-- =============================================================================
-- PART 2: DATABASE ANALYSIS FUNCTIONS FOR MCP
-- =============================================================================

-- Function to get comprehensive database stats
CREATE OR REPLACE FUNCTION public.get_database_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    -- Security check
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    WITH table_stats AS (
        SELECT 
            schemaname,
            tablename,
            n_tup_ins as inserts,
            n_tup_upd as updates,
            n_tup_del as deletes,
            n_live_tup as live_rows,
            n_dead_tup as dead_rows
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
    ),
    index_stats AS (
        SELECT 
            schemaname,
            tablename,
            indexname,
            idx_scan as scans,
            idx_tup_read as tuples_read,
            idx_tup_fetch as tuples_fetched
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
    ),
    size_stats AS (
        SELECT 
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
            pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
        FROM information_schema.tables
        WHERE table_schema = 'public'
    )
    SELECT jsonb_build_object(
        'table_stats', (SELECT jsonb_agg(row_to_json(t)) FROM table_stats t),
        'index_stats', (SELECT jsonb_agg(row_to_json(i)) FROM index_stats i),
        'size_stats', (SELECT jsonb_agg(row_to_json(s)) FROM size_stats s),
        'generated_at', now()
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Function to get slow query analysis
CREATE OR REPLACE FUNCTION public.analyze_query_performance(query_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    plan_result text;
BEGIN
    -- Security check
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Only allow SELECT statements
    IF UPPER(TRIM(query_text)) NOT LIKE 'SELECT%' THEN
        RAISE EXCEPTION 'Only SELECT queries are allowed for analysis';
    END IF;

    -- Get query plan
    EXECUTE format('EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) %s', query_text) INTO plan_result;
    
    result := jsonb_build_object(
        'success', true,
        'query', query_text,
        'execution_plan', plan_result::jsonb,
        'analyzed_at', now()
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    result := jsonb_build_object(
        'success', false,
        'query', query_text,
        'error_code', SQLSTATE,
        'error_message', SQLERRM,
        'analyzed_at', now()
    );
    
    RETURN result;
END;
$$;

-- =============================================================================
-- PART 3: UTILITY FUNCTIONS FOR DATABASE MANAGEMENT
-- =============================================================================

-- Function to create indexes safely
CREATE OR REPLACE FUNCTION public.create_index_safe(
    index_name text,
    table_name text,
    column_definition text,
    index_type text DEFAULT 'btree'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    sql_command text;
BEGIN
    -- Security check
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Check if index already exists
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname = index_name
    ) THEN
        result := jsonb_build_object(
            'success', true,
            'message', format('Index %s already exists', index_name),
            'index_name', index_name,
            'action', 'skipped'
        );
        RETURN result;
    END IF;

    -- Build SQL command
    IF index_type = 'gin' THEN
        sql_command := format('CREATE INDEX %s ON %s USING GIN(%s)', 
                             index_name, table_name, column_definition);
    ELSIF index_type = 'partial' THEN
        sql_command := format('CREATE INDEX %s ON %s (%s)', 
                             index_name, table_name, column_definition);
    ELSE
        sql_command := format('CREATE INDEX %s ON %s (%s)', 
                             index_name, table_name, column_definition);
    END IF;

    -- Execute index creation
    EXECUTE sql_command;
    
    result := jsonb_build_object(
        'success', true,
        'message', format('Index %s created successfully', index_name),
        'index_name', index_name,
        'table_name', table_name,
        'sql_executed', sql_command,
        'action', 'created'
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    result := jsonb_build_object(
        'success', false,
        'error_code', SQLSTATE,
        'error_message', SQLERRM,
        'index_name', index_name,
        'sql_attempted', sql_command,
        'action', 'failed'
    );
    
    RETURN result;
END;
$$;

-- Function to cleanup old data safely
CREATE OR REPLACE FUNCTION public.cleanup_old_data(
    table_name text,
    date_column text,
    days_to_keep integer DEFAULT 365
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    sql_command text;
    deleted_count integer;
BEGIN
    -- Security check
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Build and execute cleanup command
    sql_command := format(
        'DELETE FROM %s WHERE %s < NOW() - INTERVAL ''%s days''',
        table_name, date_column, days_to_keep
    );
    
    EXECUTE sql_command;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    result := jsonb_build_object(
        'success', true,
        'table_name', table_name,
        'date_column', date_column,
        'days_kept', days_to_keep,
        'rows_deleted', deleted_count,
        'message', format('Cleaned up %s old records from %s', deleted_count, table_name)
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    result := jsonb_build_object(
        'success', false,
        'error_code', SQLSTATE,
        'error_message', SQLERRM,
        'table_name', table_name,
        'sql_attempted', sql_command
    );
    
    RETURN result;
END;
$$;

-- =============================================================================
-- PART 4: GRANT PERMISSIONS FOR MCP ACCESS
-- =============================================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_query(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_migration(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_database_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.analyze_query_performance(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_index_safe(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_data(text, text, integer) TO authenticated;

-- Grant permissions on migrations table
GRANT ALL ON TABLE public.migrations TO authenticated;

-- =============================================================================
-- VERIFICATION AND TESTING
-- =============================================================================

-- Test the RPC functions
SELECT 'RPC Functions Created Successfully!' as status;

-- Verify functions exist
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE 'exec_%' 
  OR routine_name IN ('get_database_stats', 'analyze_query_performance', 'create_index_safe', 'cleanup_old_data')
ORDER BY routine_name;

-- Show available RPC functions for MCP
SELECT 
    'Available RPC Functions for MCP:' as info,
    string_agg(routine_name, ', ' ORDER BY routine_name) as functions
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND (routine_name LIKE 'exec_%' 
       OR routine_name IN ('get_database_stats', 'analyze_query_performance', 'create_index_safe', 'cleanup_old_data'));

-- Test basic functionality
SELECT public.exec_query('SELECT ''RPC Functions Working!'' as test_result') as test; 