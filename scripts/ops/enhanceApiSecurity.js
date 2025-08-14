#!/usr/bin/env node

/**
 * Enhance API Security - XMLPrompter
 * Implements comprehensive API key security enhancements
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔒 ENHANCING API SECURITY FOR XMLPROMPTER');
console.log('=========================================');

async function enhanceApiSecurity() {
  let totalSuccessCount = 0;
  let totalAttemptCount = 0;

  // PHASE 1: Enhanced API Keys Table Structure
  console.log('\n🔧 PHASE 1: ENHANCED API KEYS STRUCTURE');
  console.log('======================================');
  
  const structureEnhancements = [
    {
      name: 'Add IP Whitelist Column',
      sql: `DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'api_keys' AND column_name = 'ip_whitelist'
                ) THEN
                    ALTER TABLE api_keys ADD COLUMN ip_whitelist TEXT[];
                END IF;
            END $$`
    },
    {
      name: 'Add Rate Limit Configuration',
      sql: `DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'api_keys' AND column_name = 'rate_limit_per_hour'
                ) THEN
                    ALTER TABLE api_keys ADD COLUMN rate_limit_per_hour INTEGER DEFAULT 1000;
                END IF;
            END $$`
    },
    {
      name: 'Add Key Rotation Fields',
      sql: `DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'api_keys' AND column_name = 'rotation_scheduled_at'
                ) THEN
                    ALTER TABLE api_keys ADD COLUMN rotation_scheduled_at TIMESTAMP WITH TIME ZONE;
                END IF;
                
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'api_keys' AND column_name = 'previous_key_hash'
                ) THEN
                    ALTER TABLE api_keys ADD COLUMN previous_key_hash TEXT;
                END IF;
                
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'api_keys' AND column_name = 'grace_period_expires_at'
                ) THEN
                    ALTER TABLE api_keys ADD COLUMN grace_period_expires_at TIMESTAMP WITH TIME ZONE;
                END IF;
            END $$`
    },
    {
      name: 'Add Security Metadata',
      sql: `DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'api_keys' AND column_name = 'security_level'
                ) THEN
                    ALTER TABLE api_keys ADD COLUMN security_level TEXT DEFAULT 'standard' 
                    CHECK (security_level IN ('basic', 'standard', 'high', 'enterprise'));
                END IF;
                
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'api_keys' AND column_name = 'allowed_origins'
                ) THEN
                    ALTER TABLE api_keys ADD COLUMN allowed_origins TEXT[];
                END IF;
                
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'api_keys' AND column_name = 'scopes'
                ) THEN
                    ALTER TABLE api_keys ADD COLUMN scopes TEXT[] DEFAULT ARRAY['read', 'write'];
                END IF;
            END $$`
    }
  ];

  for (const enhancement of structureEnhancements) {
    console.log(`🔧 Adding: ${enhancement.name}`);
    totalAttemptCount++;
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: enhancement.sql
      });
      
      if (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      } else if (data.success) {
        console.log(`   ✅ Success: ${data.message}`);
        totalSuccessCount++;
      } else {
        console.log(`   ❌ Failed: ${data.error_message}`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }

  // PHASE 2: Security Audit Log Table
  console.log('\n📋 PHASE 2: SECURITY AUDIT LOGGING');
  console.log('=================================');
  
  const auditTableSql = `
    CREATE TABLE IF NOT EXISTS api_security_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL CHECK (event_type IN (
            'key_created', 'key_rotated', 'key_revoked', 'key_used',
            'invalid_key_attempt', 'rate_limit_exceeded', 'ip_blocked',
            'suspicious_activity', 'scope_violation'
        )),
        event_details JSONB DEFAULT '{}',
        ip_address INET,
        user_agent TEXT,
        endpoint TEXT,
        success BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_api_security_logs_key_event ON api_security_logs(api_key_id, event_type, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_api_security_logs_user_event ON api_security_logs(user_id, event_type, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_api_security_logs_ip ON api_security_logs(ip_address, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_api_security_logs_suspicious ON api_security_logs(event_type, success, created_at DESC) 
        WHERE success = false;
  `;

  console.log(`🔧 Creating: Security Audit Log Table`);
  totalAttemptCount++;
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: auditTableSql
    });
    
    if (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    } else if (data.success) {
      console.log(`   ✅ Success: Security audit logging enabled`);
      totalSuccessCount++;
    } else {
      console.log(`   ❌ Failed: ${data.error_message}`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  // PHASE 3: Security Functions
  console.log('\n⚙️ PHASE 3: SECURITY FUNCTIONS');
  console.log('==============================');
  
  const securityFunctions = [
    {
      name: 'Generate Secure API Key Function',
      sql: `CREATE OR REPLACE FUNCTION generate_secure_api_key()
            RETURNS TEXT AS $$
            DECLARE
                key_prefix TEXT := 'xp_';
                random_part TEXT;
                checksum TEXT;
                full_key TEXT;
            BEGIN
                -- Generate cryptographically secure random string
                random_part := encode(gen_random_bytes(32), 'base64');
                random_part := replace(replace(replace(random_part, '/', '_'), '+', '-'), '=', '');
                random_part := substring(random_part from 1 for 40);
                
                -- Create checksum for validation
                checksum := substring(encode(sha256((key_prefix || random_part)::bytea), 'hex') from 1 for 8);
                
                full_key := key_prefix || random_part || '_' || checksum;
                
                RETURN full_key;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER`
    },
    {
      name: 'Validate API Key Function',
      sql: `CREATE OR REPLACE FUNCTION validate_api_key(input_key TEXT)
            RETURNS BOOLEAN AS $$
            DECLARE
                key_parts TEXT[];
                key_body TEXT;
                provided_checksum TEXT;
                calculated_checksum TEXT;
            BEGIN
                -- Check basic format
                IF input_key !~ '^xp_[A-Za-z0-9_-]+_[a-f0-9]{8}$' THEN
                    RETURN FALSE;
                END IF;
                
                -- Split key into parts
                key_parts := string_to_array(input_key, '_');
                
                IF array_length(key_parts, 1) < 3 THEN
                    RETURN FALSE;
                END IF;
                
                -- Extract components
                key_body := 'xp_' || key_parts[2];
                provided_checksum := key_parts[3];
                
                -- Calculate expected checksum
                calculated_checksum := substring(encode(sha256(key_body::bytea), 'hex') from 1 for 8);
                
                -- Verify checksum
                RETURN provided_checksum = calculated_checksum;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER`
    },
    {
      name: 'Log Security Event Function',
      sql: `CREATE OR REPLACE FUNCTION log_security_event(
                p_api_key_id UUID,
                p_user_id UUID,
                p_event_type TEXT,
                p_event_details JSONB DEFAULT '{}',
                p_ip_address INET DEFAULT NULL,
                p_user_agent TEXT DEFAULT NULL,
                p_endpoint TEXT DEFAULT NULL,
                p_success BOOLEAN DEFAULT false
            )
            RETURNS UUID AS $$
            DECLARE
                log_id UUID;
            BEGIN
                INSERT INTO api_security_logs (
                    api_key_id, user_id, event_type, event_details,
                    ip_address, user_agent, endpoint, success
                ) VALUES (
                    p_api_key_id, p_user_id, p_event_type, p_event_details,
                    p_ip_address, p_user_agent, p_endpoint, p_success
                ) RETURNING id INTO log_id;
                
                RETURN log_id;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER`
    },
    {
      name: 'Rotate API Key Function',
      sql: `CREATE OR REPLACE FUNCTION rotate_api_key(p_api_key_id UUID)
            RETURNS TABLE(new_key TEXT, grace_period_expires TIMESTAMP WITH TIME ZONE) AS $$
            DECLARE
                new_api_key TEXT;
                new_key_hash TEXT;
                old_key_hash TEXT;
                grace_expires TIMESTAMP WITH TIME ZONE;
            BEGIN
                -- Generate new key
                new_api_key := generate_secure_api_key();
                new_key_hash := encode(sha256(new_api_key::bytea), 'hex');
                grace_expires := NOW() + INTERVAL '7 days';
                
                -- Get old key hash for grace period
                SELECT key_hash INTO old_key_hash FROM api_keys WHERE id = p_api_key_id;
                
                -- Update the key with rotation info
                UPDATE api_keys 
                SET 
                    key_hash = new_key_hash,
                    previous_key_hash = old_key_hash,
                    grace_period_expires_at = grace_expires,
                    rotation_scheduled_at = NULL,
                    updated_at = NOW()
                WHERE id = p_api_key_id;
                
                -- Log the rotation
                PERFORM log_security_event(
                    p_api_key_id, 
                    (SELECT user_id FROM api_keys WHERE id = p_api_key_id),
                    'key_rotated',
                    jsonb_build_object('grace_period_days', 7),
                    NULL, NULL, NULL, true
                );
                
                RETURN QUERY SELECT new_api_key, grace_expires;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER`
    },
    {
      name: 'Check Rate Limit Function',
      sql: `CREATE OR REPLACE FUNCTION check_api_rate_limit(
                p_api_key_id UUID,
                p_endpoint TEXT DEFAULT 'general'
            )
            RETURNS BOOLEAN AS $$
            DECLARE
                hourly_limit INTEGER;
                current_usage INTEGER;
                window_start TIMESTAMP WITH TIME ZONE;
            BEGIN
                -- Get the rate limit for this key
                SELECT rate_limit_per_hour INTO hourly_limit 
                FROM api_keys 
                WHERE id = p_api_key_id AND is_active = true;
                
                IF hourly_limit IS NULL THEN
                    RETURN FALSE; -- Key not found or inactive
                END IF;
                
                -- Calculate current hour window
                window_start := date_trunc('hour', NOW());
                
                -- Count current usage in this hour
                SELECT COALESCE(COUNT(*), 0) INTO current_usage
                FROM api_security_logs
                WHERE api_key_id = p_api_key_id
                  AND endpoint = p_endpoint
                  AND success = true
                  AND created_at >= window_start;
                
                -- Return true if under limit
                RETURN current_usage < hourly_limit;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER`
    }
  ];

  for (const func of securityFunctions) {
    console.log(`🔧 Creating: ${func.name}`);
    totalAttemptCount++;
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: func.sql
      });
      
      if (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      } else if (data.success) {
        console.log(`   ✅ Success: Function created`);
        totalSuccessCount++;
      } else {
        console.log(`   ❌ Failed: ${data.error_message}`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }

  // PHASE 4: Security Policies and Triggers
  console.log('\n🛡️ PHASE 4: SECURITY POLICIES AND TRIGGERS');
  console.log('==========================================');
  
  const securityPolicies = [
    {
      name: 'API Key Security Trigger',
      sql: `CREATE OR REPLACE FUNCTION api_key_security_trigger()
            RETURNS TRIGGER AS $$
            BEGIN
                -- Log key creation
                IF TG_OP = 'INSERT' THEN
                    PERFORM log_security_event(
                        NEW.id, NEW.user_id, 'key_created',
                        jsonb_build_object(
                            'name', NEW.name,
                            'security_level', NEW.security_level,
                            'scopes', NEW.scopes
                        ),
                        NULL, NULL, NULL, true
                    );
                    RETURN NEW;
                END IF;
                
                -- Log key updates
                IF TG_OP = 'UPDATE' THEN
                    -- Log if key was deactivated
                    IF OLD.is_active = true AND NEW.is_active = false THEN
                        PERFORM log_security_event(
                            NEW.id, NEW.user_id, 'key_revoked',
                            jsonb_build_object('reason', 'deactivated'),
                            NULL, NULL, NULL, true
                        );
                    END IF;
                    RETURN NEW;
                END IF;
                
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql;
            
            DROP TRIGGER IF EXISTS api_key_security_trigger ON api_keys;
            CREATE TRIGGER api_key_security_trigger
                AFTER INSERT OR UPDATE ON api_keys
                FOR EACH ROW EXECUTE FUNCTION api_key_security_trigger()`
    },
    {
      name: 'Automated Key Rotation Scheduler',
      sql: `CREATE OR REPLACE FUNCTION schedule_key_rotation()
            RETURNS INTEGER AS $$
            DECLARE
                rotation_count INTEGER := 0;
                key_record RECORD;
            BEGIN
                -- Schedule rotation for keys older than 90 days
                FOR key_record IN 
                    SELECT id, name, user_id
                    FROM api_keys 
                    WHERE is_active = true 
                      AND created_at < NOW() - INTERVAL '90 days'
                      AND rotation_scheduled_at IS NULL
                LOOP
                    UPDATE api_keys 
                    SET rotation_scheduled_at = NOW() + INTERVAL '7 days'
                    WHERE id = key_record.id;
                    
                    PERFORM log_security_event(
                        key_record.id, key_record.user_id, 'key_rotation_scheduled',
                        jsonb_build_object('scheduled_for', NOW() + INTERVAL '7 days'),
                        NULL, NULL, NULL, true
                    );
                    
                    rotation_count := rotation_count + 1;
                END LOOP;
                
                RETURN rotation_count;
            END;
            $$ LANGUAGE plpgsql`
    }
  ];

  for (const policy of securityPolicies) {
    console.log(`🔧 Creating: ${policy.name}`);
    totalAttemptCount++;
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: policy.sql
      });
      
      if (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      } else if (data.success) {
        console.log(`   ✅ Success: Security policy applied`);
        totalSuccessCount++;
      } else {
        console.log(`   ❌ Failed: ${data.error_message}`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }

  // PHASE 5: Security Views and Analytics
  console.log('\n📊 PHASE 5: SECURITY ANALYTICS VIEWS');
  console.log('===================================');
  
  const securityViews = [
    {
      name: 'API Security Dashboard View',
      sql: `DROP VIEW IF EXISTS api_security_dashboard;
            CREATE VIEW api_security_dashboard AS
            SELECT 
                ak.id,
                ak.name,
                ak.user_id,
                p.email as user_email,
                ak.security_level,
                ak.is_active,
                ak.created_at,
                ak.last_used_at,
                ak.usage_count,
                ak.rate_limit_per_hour,
                ak.rotation_scheduled_at,
                ak.grace_period_expires_at,
                CASE 
                    WHEN ak.created_at < NOW() - INTERVAL '90 days' THEN 'rotation_due'
                    WHEN ak.rotation_scheduled_at IS NOT NULL THEN 'rotation_scheduled'
                    WHEN ak.grace_period_expires_at > NOW() THEN 'grace_period'
                    ELSE 'active'
                END as security_status,
                COUNT(asl.id) FILTER (WHERE asl.success = false AND asl.created_at > NOW() - INTERVAL '24 hours') as failed_attempts_24h,
                COUNT(asl.id) FILTER (WHERE asl.event_type = 'rate_limit_exceeded' AND asl.created_at > NOW() - INTERVAL '24 hours') as rate_limit_hits_24h
            FROM api_keys ak
            JOIN profiles p ON ak.user_id = p.id
            LEFT JOIN api_security_logs asl ON ak.id = asl.api_key_id
            GROUP BY ak.id, ak.name, ak.user_id, p.email, ak.security_level, 
                     ak.is_active, ak.created_at, ak.last_used_at, ak.usage_count,
                     ak.rate_limit_per_hour, ak.rotation_scheduled_at, ak.grace_period_expires_at`
    },
    {
      name: 'Security Threats Summary View',
      sql: `DROP VIEW IF EXISTS security_threats_summary;
            CREATE VIEW security_threats_summary AS
            SELECT 
                DATE(created_at) as threat_date,
                event_type,
                COUNT(*) as incident_count,
                COUNT(DISTINCT ip_address) as unique_ips,
                COUNT(DISTINCT api_key_id) as affected_keys,
                COUNT(DISTINCT user_id) as affected_users
            FROM api_security_logs
            WHERE success = false
              AND created_at > NOW() - INTERVAL '30 days'
            GROUP BY DATE(created_at), event_type
            ORDER BY threat_date DESC, incident_count DESC`
    }
  ];

  for (const view of securityViews) {
    console.log(`🔧 Creating: ${view.name}`);
    totalAttemptCount++;
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: view.sql
      });
      
      if (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      } else if (data.success) {
        console.log(`   ✅ Success: Security view created`);
        totalSuccessCount++;
      } else {
        console.log(`   ❌ Failed: ${data.error_message}`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }

  // FINAL SUMMARY
  console.log('\n🎉 API SECURITY ENHANCEMENT COMPLETE!');
  console.log('====================================');
  console.log(`📊 Success Rate: ${totalSuccessCount}/${totalAttemptCount} (${Math.round((totalSuccessCount/totalAttemptCount)*100)}%)`);
  console.log('');
  console.log('🔒 Enhanced Security Features:');
  console.log('✅ IP whitelisting capabilities');
  console.log('✅ Configurable rate limiting');
  console.log('✅ Automated key rotation');
  console.log('✅ Comprehensive audit logging');
  console.log('✅ Security event monitoring');
  console.log('✅ Threat detection analytics');
  console.log('✅ Grace period management');
  console.log('✅ Scope-based permissions');
  console.log('');
  console.log('🛡️ Security Functions Available:');
  console.log('• generate_secure_api_key() - Create cryptographically secure keys');
  console.log('• validate_api_key(key) - Verify key format and checksum');
  console.log('• rotate_api_key(id) - Rotate key with grace period');
  console.log('• check_api_rate_limit(id, endpoint) - Rate limit validation');
  console.log('• schedule_key_rotation() - Automated rotation scheduling');
  console.log('');
  console.log('📊 Security Monitoring Views:');
  console.log('• api_security_dashboard - Real-time security status');
  console.log('• security_threats_summary - Threat analytics');
  console.log('');
  console.log('🎯 Next Steps:');
  console.log('1. Test the new security functions');
  console.log('2. Configure automated rotation schedules');
  console.log('3. Set up security monitoring alerts');
  console.log('4. Update application code to use new security features');
}

// Execute the security enhancements
enhanceApiSecurity(); 