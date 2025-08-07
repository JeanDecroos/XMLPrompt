import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addDataRetentionColumns() {
  console.log('🔧 Adding data retention columns to database...\n')
  
  try {
    // Check current table structure
    console.log('1. Checking current table structure...')
    
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    })
    
    if (columnsError) {
      console.error('Failed to check table structure:', columnsError)
      return
    }
    
    console.log('Current profiles table columns:')
    if (columns && Array.isArray(columns)) {
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`)
      })
    } else {
      console.log('  No columns found or unexpected data structure')
    }

    // Add data retention columns
    console.log('\n2. Adding data retention columns...')
    
    const retentionColumns = [
      // Data retention policy
      'data_retention_policy TEXT DEFAULT \'standard\' CHECK (data_retention_policy IN (\'standard\', \'minimal\', \'extended\'))',
      
      // Privacy controls
      'data_analytics_opt_out BOOLEAN DEFAULT FALSE',
      'marketing_opt_out BOOLEAN DEFAULT FALSE',
      'data_export_consent BOOLEAN DEFAULT FALSE',
      'data_processing_consent BOOLEAN DEFAULT FALSE',
      
      // Deletion tracking
      'deleted_at TIMESTAMP WITH TIME ZONE',
      'deletion_requested_at TIMESTAMP WITH TIME ZONE',
      'deletion_reason TEXT',
      
      // Anonymization tracking
      'anonymized_at TIMESTAMP WITH TIME ZONE',
      'anonymization_reason TEXT',
      
      // GDPR compliance
      'gdpr_consent_given_at TIMESTAMP WITH TIME ZONE',
      'gdpr_consent_version TEXT DEFAULT \'1.0\'',
      'right_to_be_forgotten_requested BOOLEAN DEFAULT FALSE',
      'data_portability_requested BOOLEAN DEFAULT FALSE'
    ]

    // Add each column individually
    for (const columnDef of retentionColumns) {
      const columnName = columnDef.split(' ')[0]
      
      // Check if column already exists
      const columnExists = columns && Array.isArray(columns) && columns.some(col => col.column_name === columnName)
      
      if (columnExists) {
        console.log(`  ⏭️  Column ${columnName} already exists, skipping...`)
        continue
      }
      
      console.log(`  ➕ Adding column: ${columnName}`)
      
      const { error: addError } = await supabase.rpc('exec_sql', {
        sql_query: `ALTER TABLE profiles ADD COLUMN ${columnDef};`
      })
      
      if (addError) {
        console.error(`  ❌ Failed to add ${columnName}:`, addError.message)
      } else {
        console.log(`  ✅ Added ${columnName} successfully`)
      }
    }

    // Add retention columns to other tables
    console.log('\n3. Adding retention columns to other tables...')
    
    // Add to prompts table
    const promptRetentionColumns = [
      'retention_until TIMESTAMP WITH TIME ZONE',
      'anonymized_at TIMESTAMP WITH TIME ZONE',
      'deleted_at TIMESTAMP WITH TIME ZONE'
    ]

    for (const columnDef of promptRetentionColumns) {
      const columnName = columnDef.split(' ')[0]
      console.log(`  ➕ Adding ${columnName} to prompts table`)
      
      const { error: addError } = await supabase.rpc('exec_sql', {
        sql_query: `ALTER TABLE prompts ADD COLUMN IF NOT EXISTS ${columnDef};`
      })
      
      if (addError) {
        console.error(`  ❌ Failed to add ${columnName} to prompts:`, addError.message)
      } else {
        console.log(`  ✅ Added ${columnName} to prompts successfully`)
      }
    }

    // Add to session_history table (if it exists)
    const sessionRetentionColumns = [
      'anonymized_at TIMESTAMP WITH TIME ZONE',
      'deleted_at TIMESTAMP WITH TIME ZONE'
    ]

    for (const columnDef of sessionRetentionColumns) {
      const columnName = columnDef.split(' ')[0]
      console.log(`  ➕ Adding ${columnName} to session_history table`)
      
      const { error: addError } = await supabase.rpc('exec_sql', {
        sql_query: `ALTER TABLE session_history ADD COLUMN IF NOT EXISTS ${columnDef};`
      })
      
      if (addError) {
        console.log(`  ⚠️  session_history table may not exist: ${addError.message}`)
      } else {
        console.log(`  ✅ Added ${columnName} to session_history successfully`)
      }
    }

    // Add to user_analytics table (if it exists)
    const analyticsRetentionColumns = [
      'anonymized_at TIMESTAMP WITH TIME ZONE',
      'deleted_at TIMESTAMP WITH TIME ZONE'
    ]

    for (const columnDef of analyticsRetentionColumns) {
      const columnName = columnDef.split(' ')[0]
      console.log(`  ➕ Adding ${columnName} to user_analytics table`)
      
      const { error: addError } = await supabase.rpc('exec_sql', {
        sql_query: `ALTER TABLE user_analytics ADD COLUMN IF NOT EXISTS ${columnDef};`
      })
      
      if (addError) {
        console.log(`  ⚠️  user_analytics table may not exist: ${addError.message}`)
      } else {
        console.log(`  ✅ Added ${columnName} to user_analytics successfully`)
      }
    }

    // Create indexes for performance
    console.log('\n4. Creating retention-related indexes...')
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at);',
      'CREATE INDEX IF NOT EXISTS idx_profiles_anonymized_at ON profiles(anonymized_at);',
      'CREATE INDEX IF NOT EXISTS idx_profiles_data_retention_policy ON profiles(data_retention_policy);',
      'CREATE INDEX IF NOT EXISTS idx_prompts_retention_until ON prompts(retention_until);',
      'CREATE INDEX IF NOT EXISTS idx_prompts_deleted_at ON prompts(deleted_at);',
      'CREATE INDEX IF NOT EXISTS idx_session_history_anonymized_at ON session_history(anonymized_at);',
      'CREATE INDEX IF NOT EXISTS idx_user_analytics_anonymized_at ON user_analytics(anonymized_at);'
    ]

    for (const indexSQL of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', {
        sql_query: indexSQL
      })
      
      if (indexError) {
        console.log('  ⚠️  Index creation warning:', indexError.message)
      } else {
        console.log('  ✅ Index created successfully')
      }
    }

    // Create data retention functions
    console.log('\n5. Creating data retention functions...')
    
    const functions = [
      {
        name: 'cleanup_old_data',
        sql: `
          CREATE OR REPLACE FUNCTION cleanup_old_data()
          RETURNS JSONB AS $$
          DECLARE
            result JSONB;
            sessions_cleaned INTEGER := 0;
            analytics_cleaned INTEGER := 0;
            prompts_cleaned INTEGER := 0;
          BEGIN
            -- Clean up session history older than 12 months
            DELETE FROM session_history 
            WHERE created_at < NOW() - INTERVAL '12 months'
            AND anonymized_at IS NULL;
            GET DIAGNOSTICS sessions_cleaned = ROW_COUNT;
            
            -- Clean up analytics older than 12 months
            DELETE FROM user_analytics 
            WHERE created_at < NOW() - INTERVAL '12 months'
            AND anonymized_at IS NULL;
            GET DIAGNOSTICS analytics_cleaned = ROW_COUNT;
            
            -- Clean up prompts with expired retention
            DELETE FROM prompts 
            WHERE retention_until IS NOT NULL 
            AND retention_until < NOW()
            AND deleted_at IS NULL;
            GET DIAGNOSTICS prompts_cleaned = ROW_COUNT;
            
            result := jsonb_build_object(
              'sessions_cleaned', sessions_cleaned,
              'analytics_cleaned', analytics_cleaned,
              'prompts_cleaned', prompts_cleaned,
              'cleaned_at', NOW()
            );
            
            RETURN result;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      },
      {
        name: 'anonymize_old_data',
        sql: `
          CREATE OR REPLACE FUNCTION anonymize_old_data()
          RETURNS JSONB AS $$
          DECLARE
            result JSONB;
            sessions_anonymized INTEGER := 0;
            analytics_anonymized INTEGER := 0;
          BEGIN
            -- Anonymize session history older than 24 months
            UPDATE session_history 
            SET 
              user_id = NULL,
              data = jsonb_build_object('anonymized', true, 'original_user_id', 'anonymized'),
              anonymized_at = NOW()
            WHERE created_at < NOW() - INTERVAL '24 months'
            AND anonymized_at IS NULL;
            GET DIAGNOSTICS sessions_anonymized = ROW_COUNT;
            
            -- Anonymize analytics older than 24 months
            UPDATE user_analytics 
            SET 
              user_id = NULL,
              metadata = jsonb_build_object('anonymized', true, 'original_user_id', 'anonymized'),
              anonymized_at = NOW()
            WHERE created_at < NOW() - INTERVAL '24 months'
            AND anonymized_at IS NULL;
            GET DIAGNOSTICS analytics_anonymized = ROW_COUNT;
            
            result := jsonb_build_object(
              'sessions_anonymized', sessions_anonymized,
              'analytics_anonymized', analytics_anonymized,
              'anonymized_at', NOW()
            );
            
            RETURN result;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      }
    ]

    for (const func of functions) {
      console.log(`  ➕ Creating function: ${func.name}`)
      
      const { error: funcError } = await supabase.rpc('exec_sql', {
        sql_query: func.sql
      })
      
      if (funcError) {
        console.error(`  ❌ Failed to create ${func.name}:`, funcError.message)
      } else {
        console.log(`  ✅ Created ${func.name} successfully`)
      }
    }

    // Verify the changes
    console.log('\n6. Verifying changes...')
    
    const { data: newColumns, error: verifyError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT column_name, data_type
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public'
        AND (column_name LIKE '%retention%' 
             OR column_name LIKE '%anonymized%' 
             OR column_name LIKE '%deleted%'
             OR column_name LIKE '%gdpr%'
             OR column_name LIKE '%consent%')
        ORDER BY column_name;
      `
    })

    if (verifyError) {
      console.error('❌ Error verifying changes:', verifyError.message)
    } else {
      console.log('✅ New retention columns added:')
      if (newColumns && Array.isArray(newColumns)) {
        newColumns.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type}`)
        })
      } else {
        console.log('  No new columns found')
      }
    }

    console.log('\n🎉 Data retention columns added successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Update application code to use new retention columns')
    console.log('2. Implement scheduled cleanup jobs')
    console.log('3. Add privacy controls to user interface')
    console.log('4. Test data retention functions')
    console.log('5. Update privacy policy documentation')

  } catch (error) {
    console.error('❌ Failed to add data retention columns:', error.message)
  }
}

// Run the script
addDataRetentionColumns() 