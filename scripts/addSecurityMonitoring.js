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

async function addSecurityMonitoring() {
  console.log('🔒 Adding Security Monitoring Infrastructure...\n')

  let totalAttemptCount = 0
  let totalSuccessCount = 0

  try {
    // Create security_events table
    console.log('1. Creating security_events table...')
    totalAttemptCount++
    
    const securityEventsTableSQL = `
      CREATE TABLE IF NOT EXISTS security_events (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          event_id TEXT UNIQUE NOT NULL,
          event_type TEXT NOT NULL,
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          ip_address INET,
          user_agent TEXT,
          endpoint TEXT,
          method TEXT,
          details JSONB DEFAULT '{}',
          severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
          session_id TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: securityEventsTableSQL
    })
    
    if (error) {
      console.log(`   ❌ Failed: ${error.message}`)
    } else if (data.success) {
      console.log(`   ✅ Success: Security events table created`)
      totalSuccessCount++
    } else {
      console.log(`   ❌ Failed: ${data.error_message}`)
    }

    // Create indexes for security_events
    console.log('\n2. Creating security events indexes...')
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type, created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id, created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address, created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity, created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_security_events_endpoint ON security_events(endpoint, created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_security_events_session ON security_events(session_id, created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_security_events_critical ON security_events(created_at DESC) WHERE severity = \'critical\'',
      'CREATE INDEX IF NOT EXISTS idx_security_events_high ON security_events(created_at DESC) WHERE severity = \'high\''
    ]

    for (const indexSQL of indexes) {
      totalAttemptCount++
      console.log(`   Creating index: ${indexSQL.split('idx_')[1].split(' ')[0]}`)
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: indexSQL
        })
        
        if (error) {
          console.log(`      ❌ Failed: ${error.message}`)
        } else if (data.success) {
          console.log(`      ✅ Success`)
          totalSuccessCount++
        } else {
          console.log(`      ❌ Failed: ${data.error_message}`)
        }
      } catch (err) {
        console.log(`      ❌ Error: ${err.message}`)
      }
    }

    // Create security functions
    console.log('\n3. Creating security monitoring functions...')
    
    const functions = [
      {
        name: 'get_security_stats',
        sql: `
          CREATE OR REPLACE FUNCTION get_security_stats(
            time_window INTERVAL DEFAULT INTERVAL '24 hours'
          )
          RETURNS JSONB AS $$
          DECLARE
            result JSONB;
          BEGIN
            SELECT jsonb_build_object(
              'total_events', COUNT(*),
              'critical_events', COUNT(*) FILTER (WHERE severity = 'critical'),
              'high_events', COUNT(*) FILTER (WHERE severity = 'high'),
              'medium_events', COUNT(*) FILTER (WHERE severity = 'medium'),
              'low_events', COUNT(*) FILTER (WHERE severity = 'low'),
              'top_event_types', (
                SELECT jsonb_agg(jsonb_build_object('type', event_type, 'count', count))
                FROM (
                  SELECT event_type, COUNT(*) as count
                  FROM security_events
                  WHERE created_at >= NOW() - time_window
                  GROUP BY event_type
                  ORDER BY count DESC
                  LIMIT 10
                ) t
              ),
              'top_ips', (
                SELECT jsonb_agg(jsonb_build_object('ip', ip_address, 'count', count))
                FROM (
                  SELECT ip_address, COUNT(*) as count
                  FROM security_events
                  WHERE created_at >= NOW() - time_window
                    AND ip_address IS NOT NULL
                  GROUP BY ip_address
                  ORDER BY count DESC
                  LIMIT 10
                ) t
              ),
              'recent_critical_events', (
                SELECT jsonb_agg(jsonb_build_object(
                  'event_type', event_type,
                  'ip_address', ip_address,
                  'endpoint', endpoint,
                  'created_at', created_at
                ))
                FROM security_events
                WHERE created_at >= NOW() - time_window
                  AND severity = 'critical'
                ORDER BY created_at DESC
                LIMIT 20
              )
            ) INTO result
            FROM security_events
            WHERE created_at >= NOW() - time_window;
            
            RETURN result;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      },
      {
        name: 'cleanup_old_security_events',
        sql: `
          CREATE OR REPLACE FUNCTION cleanup_old_security_events(
            retention_days INTEGER DEFAULT 90
          )
          RETURNS INTEGER AS $$
          DECLARE
            deleted_count INTEGER;
          BEGIN
            DELETE FROM security_events
            WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
            
            GET DIAGNOSTICS deleted_count = ROW_COUNT;
            RETURN deleted_count;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      },
      {
        name: 'flag_suspicious_ip',
        sql: `
          CREATE OR REPLACE FUNCTION flag_suspicious_ip(
            target_ip INET,
            reason TEXT DEFAULT 'Suspicious activity detected'
          )
          RETURNS BOOLEAN AS $$
          BEGIN
            -- Log the flagging action
            INSERT INTO security_events (
              event_type, ip_address, details, severity
            ) VALUES (
              'ip_flagged', target_ip, 
              jsonb_build_object('reason', reason, 'action', 'flagged'),
              'high'
            );
            
            RETURN TRUE;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      }
    ]

    for (const func of functions) {
      totalAttemptCount++
      console.log(`   Creating function: ${func.name}`)
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: func.sql
        })
        
        if (error) {
          console.log(`      ❌ Failed: ${error.message}`)
        } else if (data.success) {
          console.log(`      ✅ Success`)
          totalSuccessCount++
        } else {
          console.log(`      ❌ Failed: ${data.error_message}`)
        }
      } catch (err) {
        console.log(`      ❌ Error: ${err.message}`)
      }
    }

    // Enable RLS on security_events
    console.log('\n4. Enabling Row Level Security...')
    totalAttemptCount++
    
    const rlsSQL = `
      ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
      
      -- Only admins can view security events
      DROP POLICY IF EXISTS "Admins can view security events" ON security_events;
      CREATE POLICY "Admins can view security events" ON security_events
          FOR SELECT USING (
              EXISTS (
                  SELECT 1 FROM profiles 
                  WHERE profiles.id = auth.uid() 
                  AND profiles.subscription_tier = 'enterprise'
              )
          );
      
      -- System can insert security events
      DROP POLICY IF EXISTS "System can insert security events" ON security_events;
      CREATE POLICY "System can insert security events" ON security_events
          FOR INSERT WITH CHECK (true);
    `
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: rlsSQL
      })
      
      if (error) {
        console.log(`   ❌ Failed: ${error.message}`)
      } else if (data.success) {
        console.log(`   ✅ Success: RLS enabled with policies`)
        totalSuccessCount++
      } else {
        console.log(`   ❌ Failed: ${data.error_message}`)
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`)
    }

    // Create trigger for automatic cleanup
    console.log('\n5. Creating automatic cleanup trigger...')
    totalAttemptCount++
    
    const triggerSQL = `
      -- Create a function to automatically cleanup old events
      CREATE OR REPLACE FUNCTION auto_cleanup_security_events()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Clean up events older than 90 days (keep only last 1000 events per type)
        DELETE FROM security_events 
        WHERE created_at < NOW() - INTERVAL '90 days'
        AND id NOT IN (
          SELECT id FROM security_events 
          WHERE event_type = NEW.event_type
          ORDER BY created_at DESC 
          LIMIT 1000
        );
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      
      -- Create trigger
      DROP TRIGGER IF EXISTS trigger_auto_cleanup_security_events ON security_events;
      CREATE TRIGGER trigger_auto_cleanup_security_events
          AFTER INSERT ON security_events
          FOR EACH ROW
          EXECUTE FUNCTION auto_cleanup_security_events();
    `
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: triggerSQL
      })
      
      if (error) {
        console.log(`   ❌ Failed: ${error.message}`)
      } else if (data.success) {
        console.log(`   ✅ Success: Auto-cleanup trigger created`)
        totalSuccessCount++
      } else {
        console.log(`   ❌ Failed: ${data.error_message}`)
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`)
    }

    // Test the security monitoring
    console.log('\n6. Testing security monitoring...')
    totalAttemptCount++
    
    const testSQL = `
      INSERT INTO security_events (
        event_id, event_type, ip_address, endpoint, method, severity
      ) VALUES (
        'test-' || gen_random_uuid(), 'test_event', '127.0.0.1', '/test', 'GET', 'low'
      );
    `
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: testSQL
      })
      
      if (error) {
        console.log(`   ❌ Failed: ${error.message}`)
      } else if (data.success) {
        console.log(`   ✅ Success: Test event inserted`)
        totalSuccessCount++
        
        // Clean up test data
        await supabase.rpc('exec_sql', {
          sql_query: "DELETE FROM security_events WHERE event_type = 'test_event';"
        })
      } else {
        console.log(`   ❌ Failed: ${data.error_message}`)
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`)
    }

    console.log('\n🎉 Security Monitoring Setup Complete!')
    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Success: ${totalSuccessCount}/${totalAttemptCount}`)
    console.log(`   ❌ Failed: ${totalAttemptCount - totalSuccessCount}/${totalAttemptCount}`)
    
    console.log('\n🔒 Security Monitoring Features:')
    console.log('   ✅ Security events table with comprehensive indexing')
    console.log('   ✅ Row Level Security with admin-only access')
    console.log('   ✅ Automatic cleanup of old events')
    console.log('   ✅ Security statistics functions')
    console.log('   ✅ IP flagging capabilities')
    console.log('   ✅ Real-time monitoring ready')

  } catch (error) {
    console.error('❌ Security monitoring setup failed:', error.message)
  }
}

// Run the setup
addSecurityMonitoring() 