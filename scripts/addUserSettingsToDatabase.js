import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addUserSettingsToDatabase() {
  console.log('🔧 Adding user settings to database...')
  
  try {
    // Check if profiles table exists and get current structure
    console.log('\n1. Checking current profiles table structure...')
    
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
      console.log('Columns data:', columns)
    }

    // Add user settings columns to profiles table
    console.log('\n2. Adding user settings columns...')
    
    const settingsColumns = [
      // Notification settings
      'notification_email BOOLEAN DEFAULT TRUE',
      'notification_prompt_reminders BOOLEAN DEFAULT TRUE', 
      'notification_usage_alerts BOOLEAN DEFAULT FALSE',
      'notification_security_alerts BOOLEAN DEFAULT TRUE',
      'notification_marketing_emails BOOLEAN DEFAULT FALSE',
      'notification_weekly_digest BOOLEAN DEFAULT TRUE',
      
      // Privacy settings
      'privacy_profile_visibility TEXT DEFAULT \'public\' CHECK (privacy_profile_visibility IN (\'public\', \'friends\', \'private\'))',
      'privacy_prompt_sharing TEXT DEFAULT \'friends\' CHECK (privacy_prompt_sharing IN (\'public\', \'friends\', \'private\'))',
      'privacy_data_analytics BOOLEAN DEFAULT TRUE',
      'privacy_third_party_sharing BOOLEAN DEFAULT FALSE',
      'privacy_search_visibility BOOLEAN DEFAULT TRUE',
      
      // Security settings
      'security_two_factor_enabled BOOLEAN DEFAULT FALSE',
      'security_two_factor_secret TEXT',
      'security_backup_codes TEXT[]',
      'security_last_login_at TIMESTAMP WITH TIME ZONE',
      'security_login_history JSONB DEFAULT \'[]\'',
      
      // Payment settings
      'payment_methods JSONB DEFAULT \'[]\'',
      'payment_default_method_id TEXT',
      'billing_history JSONB DEFAULT \'[]\'',
      
      // General preferences
      'preferences_timezone TEXT DEFAULT \'UTC\'',
      'preferences_language TEXT DEFAULT \'en\'',
      'preferences_theme TEXT DEFAULT \'light\' CHECK (preferences_theme IN (\'light\', \'dark\', \'auto\'))',
      'preferences_email_frequency TEXT DEFAULT \'weekly\' CHECK (preferences_email_frequency IN (\'daily\', \'weekly\', \'monthly\', \'never\'))',
      
      // Data export settings
      'export_preferences JSONB DEFAULT \'{"include_prompts": true, "include_usage": true, "include_profile": true, "include_settings": false, "format": "json"}\''
    ]

    // Add each column individually to handle errors gracefully
    for (const columnDef of settingsColumns) {
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

    // Create indexes for performance
    console.log('\n3. Creating performance indexes...')
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_profiles_notification_email ON profiles(notification_email);',
      'CREATE INDEX IF NOT EXISTS idx_profiles_privacy_profile_visibility ON profiles(privacy_profile_visibility);',
      'CREATE INDEX IF NOT EXISTS idx_profiles_security_two_factor_enabled ON profiles(security_two_factor_enabled);',
      'CREATE INDEX IF NOT EXISTS idx_profiles_preferences_theme ON profiles(preferences_theme);',
      'CREATE INDEX IF NOT EXISTS idx_profiles_security_last_login_at ON profiles(security_last_login_at DESC);'
    ]

    for (const indexSQL of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', {
        sql_query: indexSQL
      })
      
      if (indexError) {
        console.error('  ❌ Failed to create index:', indexError.message)
      } else {
        console.log('  ✅ Index created successfully')
      }
    }

    // Create functions for settings management
    console.log('\n4. Creating helper functions...')
    
    const functions = [
      {
        name: 'update_user_notification_settings',
        sql: `
          CREATE OR REPLACE FUNCTION update_user_notification_settings(
            user_id UUID,
            settings JSONB
          ) RETURNS BOOLEAN AS $$
          BEGIN
            UPDATE profiles 
            SET 
              notification_email = COALESCE((settings->>'email')::BOOLEAN, notification_email),
              notification_prompt_reminders = COALESCE((settings->>'promptReminders')::BOOLEAN, notification_prompt_reminders),
              notification_usage_alerts = COALESCE((settings->>'usageAlerts')::BOOLEAN, notification_usage_alerts),
              notification_security_alerts = COALESCE((settings->>'securityAlerts')::BOOLEAN, notification_security_alerts),
              notification_marketing_emails = COALESCE((settings->>'marketingEmails')::BOOLEAN, notification_marketing_emails),
              notification_weekly_digest = COALESCE((settings->>'weeklyDigest')::BOOLEAN, notification_weekly_digest),
              updated_at = NOW()
            WHERE id = user_id;
            
            RETURN FOUND;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      },
      {
        name: 'update_user_privacy_settings',
        sql: `
          CREATE OR REPLACE FUNCTION update_user_privacy_settings(
            user_id UUID,
            settings JSONB
          ) RETURNS BOOLEAN AS $$
          BEGIN
            UPDATE profiles 
            SET 
              privacy_profile_visibility = COALESCE(settings->>'profileVisibility', privacy_profile_visibility),
              privacy_prompt_sharing = COALESCE(settings->>'promptSharing', privacy_prompt_sharing),
              privacy_data_analytics = COALESCE((settings->>'dataAnalytics')::BOOLEAN, privacy_data_analytics),
              privacy_third_party_sharing = COALESCE((settings->>'thirdPartySharing')::BOOLEAN, privacy_third_party_sharing),
              privacy_search_visibility = COALESCE((settings->>'searchVisibility')::BOOLEAN, privacy_search_visibility),
              updated_at = NOW()
            WHERE id = user_id;
            
            RETURN FOUND;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      },
      {
        name: 'get_user_settings',
        sql: `
          CREATE OR REPLACE FUNCTION get_user_settings(user_id UUID)
          RETURNS JSONB AS $$
          DECLARE
            result JSONB;
          BEGIN
            SELECT jsonb_build_object(
              'notifications', jsonb_build_object(
                'email', notification_email,
                'promptReminders', notification_prompt_reminders,
                'usageAlerts', notification_usage_alerts,
                'securityAlerts', notification_security_alerts,
                'marketingEmails', notification_marketing_emails,
                'weeklyDigest', notification_weekly_digest
              ),
              'privacy', jsonb_build_object(
                'profileVisibility', privacy_profile_visibility,
                'promptSharing', privacy_prompt_sharing,
                'dataAnalytics', privacy_data_analytics,
                'thirdPartySharing', privacy_third_party_sharing,
                'searchVisibility', privacy_search_visibility
              ),
              'security', jsonb_build_object(
                'twoFactorEnabled', security_two_factor_enabled,
                'lastLoginAt', security_last_login_at
              ),
              'preferences', jsonb_build_object(
                'timezone', preferences_timezone,
                'language', preferences_language,
                'theme', preferences_theme,
                'emailFrequency', preferences_email_frequency
              ),
              'export', export_preferences
            ) INTO result
            FROM profiles
            WHERE id = user_id;
            
            RETURN COALESCE(result, '{}'::jsonb);
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

    // Update RLS policies to include new columns
    console.log('\n5. Updating RLS policies...')
    
    const rlsUpdates = [
      `DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;`,
      `CREATE POLICY "Users can view their own profile" ON profiles
         FOR SELECT USING (auth.uid() = id);`,
      `DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;`,
      `CREATE POLICY "Users can update their own profile" ON profiles
         FOR UPDATE USING (auth.uid() = id);`
    ]

    for (const rlsSQL of rlsUpdates) {
      const { error: rlsError } = await supabase.rpc('exec_sql', {
        sql_query: rlsSQL
      })
      
      if (rlsError) {
        console.error('  ❌ Failed to update RLS:', rlsError.message)
      } else {
        console.log('  ✅ RLS policy updated successfully')
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
        AND column_name LIKE '%notification%' 
           OR column_name LIKE '%privacy%' 
           OR column_name LIKE '%security%' 
           OR column_name LIKE '%preferences%'
           OR column_name LIKE '%export%'
        ORDER BY column_name;
      `
    })
    
    if (verifyError) {
      console.error('Failed to verify changes:', verifyError)
    } else {
      console.log('✅ New settings columns added:')
      if (newColumns && Array.isArray(newColumns)) {
        newColumns.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type}`)
        })
      } else {
        console.log('  Verification data:', newColumns)
      }
    }

    console.log('\n🎉 User settings database integration completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Update frontend components to use the new database functions')
    console.log('2. Test the settings modals with real data persistence')
    console.log('3. Add data migration for existing users if needed')

  } catch (error) {
    console.error('❌ Failed to add user settings to database:', error)
  }
}

// Run the function
addUserSettingsToDatabase() 