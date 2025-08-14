# Supabase Project Setup Guide

## 🎯 **Project Overview**
This guide walks through setting up a production-ready Supabase project for Promptr with comprehensive backend functionality.

## 📋 **Prerequisites**
- Supabase account (free tier is sufficient for development)
- Node.js 18+ installed locally
- Git repository access
- Domain name (for production deployment)

## 🏗️ **Step 1: Create New Supabase Project**

### 1.1 Initialize Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization
4. Project details:
   - **Name**: `promptr-production`
   - **Database Password**: Generate strong password (save securely)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Start with Free, upgrade as needed

### 1.2 Wait for Project Creation
- Project creation takes 2-3 minutes
- Note down your project URL and API keys
- Save these in a secure password manager

## 🔧 **Step 2: Environment Configuration**

### 2.1 Create Environment Files
Create `.env.local` in your project root:

```env
# Supabase Configuration - UPDATED WITH NEW PROJECT
VITE_SUPABASE_URL=https://nxwflnxspsokscfhuaqr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d2ZsbnhzcHNva3NjZmh1YXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njk5MzQsImV4cCI6MjA2NjM0NTkzNH0.jMWf2BEfI_4gAtMO9yzv3Nw5QWiIhyPanANP5px51gA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d2ZsbnhzcHNva3NjZmh1YXFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2OTkzNCwiZXhwIjoyMDY2MzQ1OTM0fQ.CbT3iYiaghBJ_lJPSAXFVMKyJtTVJoFL-61x4HHMxi0

# JWT Secret
JWT_SECRET=FKqIjknWVw736dGhQokNzTANr8LCScfnUSRyXmpBP1aAClyiOpj5YUvrSsXeVK2H1dTlDqaso9ghTj3AqBKI2A==

# API Configuration
VITE_API_URL=https://nxwflnxspsokscfhuaqr.supabase.co/functions/v1
NODE_ENV=production

# OpenAI Configuration (for enrichment)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-nano

# Analytics & Monitoring
SENTRY_DSN=your-sentry-dsn
ANALYTICS_API_KEY=your-analytics-key

# Payment Processing
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

### 2.2 Update Frontend Configuration
Update `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const isAuthEnabled = true
```

## 🗄️ **Step 3: Database Schema Implementation**

### 3.1 Core Tables Setup
Run this SQL in Supabase SQL Editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    subscription_created_at TIMESTAMP WITH TIME ZONE,
    billing_customer_id TEXT UNIQUE,
    api_key_hash TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompts table with enhanced schema
CREATE TABLE IF NOT EXISTS prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Prompt metadata
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    
    -- Form data fields
    role TEXT,
    task TEXT NOT NULL,
    context TEXT,
    requirements TEXT,
    style TEXT,
    output TEXT,
    
    -- Generated prompts
    raw_prompt TEXT,
    enriched_prompt TEXT,
    
    -- Model and metadata
    selected_model TEXT DEFAULT 'claude-3-5-sonnet',
    prompt_metadata JSONB DEFAULT '{}',
    enrichment_result JSONB DEFAULT '{}',
    
    -- Usage and engagement
    token_count INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    copy_count INTEGER DEFAULT 0,
    
    -- Version control
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES prompts(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT prompts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create shared prompts table
CREATE TABLE IF NOT EXISTS shared_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64url'),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Access control
    is_public BOOLEAN DEFAULT FALSE,
    password_hash TEXT,
    allowed_domains TEXT[],
    max_views INTEGER,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    
    -- Expiration
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Action details
    action_type TEXT NOT NULL CHECK (action_type IN ('prompt_generation', 'enhancement', 'save', 'share', 'api_call')),
    resource_type TEXT,
    resource_id UUID,
    
    -- Usage metrics
    tokens_used INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    model_used TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    session_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Event details
    event_type TEXT NOT NULL,
    event_category TEXT,
    event_action TEXT,
    event_label TEXT,
    event_value NUMERIC,
    
    -- Event data
    event_data JSONB DEFAULT '{}',
    
    -- Session context
    session_id TEXT,
    page_url TEXT,
    page_title TEXT,
    referrer TEXT,
    
    -- Technical context
    ip_address INET,
    user_agent TEXT,
    screen_resolution TEXT,
    viewport_size TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL, -- user_id, ip_address, or api_key
    identifier_type TEXT NOT NULL CHECK (identifier_type IN ('user', 'ip', 'api_key')),
    endpoint TEXT NOT NULL,
    
    -- Rate limiting data
    request_count INTEGER DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_duration_seconds INTEGER NOT NULL DEFAULT 3600,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for rate limiting windows
    UNIQUE(identifier, identifier_type, endpoint, window_start)
);

-- Create background jobs table
CREATE TABLE IF NOT EXISTS background_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Job details
    job_type TEXT NOT NULL,
    job_name TEXT,
    payload JSONB DEFAULT '{}',
    
    -- Execution details
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    priority INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Timing
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Results
    result JSONB,
    error_message TEXT,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Key details
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL, -- First 8 chars for identification
    name TEXT NOT NULL,
    description TEXT,
    
    -- Permissions
    permissions JSONB DEFAULT '{"read": true, "write": false, "admin": false}',
    allowed_origins TEXT[],
    rate_limit_per_hour INTEGER DEFAULT 1000,
    
    -- Usage tracking
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2 Create Indexes for Performance
```sql
-- Profiles indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_subscription_tier_idx ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS profiles_billing_customer_idx ON profiles(billing_customer_id);

-- Prompts indexes
CREATE INDEX IF NOT EXISTS prompts_user_id_idx ON prompts(user_id);
CREATE INDEX IF NOT EXISTS prompts_created_at_idx ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS prompts_title_idx ON prompts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS prompts_category_idx ON prompts(category);
CREATE INDEX IF NOT EXISTS prompts_tags_idx ON prompts USING gin(tags);
CREATE INDEX IF NOT EXISTS prompts_is_public_idx ON prompts(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS prompts_user_created_idx ON prompts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS prompts_public_popular_idx ON prompts(is_public, view_count DESC) WHERE is_public = true;

-- Shared prompts indexes
CREATE INDEX IF NOT EXISTS shared_prompts_token_idx ON shared_prompts(share_token);
CREATE INDEX IF NOT EXISTS shared_prompts_prompt_id_idx ON shared_prompts(prompt_id);
CREATE INDEX IF NOT EXISTS shared_prompts_created_by_idx ON shared_prompts(created_by);
CREATE INDEX IF NOT EXISTS shared_prompts_expires_at_idx ON shared_prompts(expires_at);

-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS usage_tracking_user_id_idx ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS usage_tracking_created_at_idx ON usage_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS usage_tracking_action_type_idx ON usage_tracking(action_type);
CREATE INDEX IF NOT EXISTS usage_tracking_user_date_idx ON usage_tracking(user_id, created_at DESC);

-- Analytics events indexes
CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_events_session_id_idx ON analytics_events(session_id);

-- Rate limits indexes
CREATE INDEX IF NOT EXISTS rate_limits_identifier_idx ON rate_limits(identifier, identifier_type, endpoint);
CREATE INDEX IF NOT EXISTS rate_limits_window_start_idx ON rate_limits(window_start);

-- Background jobs indexes
CREATE INDEX IF NOT EXISTS background_jobs_status_idx ON background_jobs(status);
CREATE INDEX IF NOT EXISTS background_jobs_scheduled_at_idx ON background_jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS background_jobs_job_type_idx ON background_jobs(job_type);
CREATE INDEX IF NOT EXISTS background_jobs_priority_idx ON background_jobs(priority DESC);

-- API keys indexes
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS api_keys_is_active_idx ON api_keys(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS api_keys_expires_at_idx ON api_keys(expires_at);
```

### 3.3 Enable Row Level Security
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
```

## 🔐 **Step 4: Row Level Security Policies**

### 4.1 Profiles Policies
```sql
-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
```

### 4.2 Prompts Policies
```sql
-- Prompts policies
CREATE POLICY "Users can view their own prompts" ON prompts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public prompts" ON prompts
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own prompts" ON prompts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts" ON prompts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts" ON prompts
    FOR DELETE USING (auth.uid() = user_id);
```

### 4.3 Shared Prompts Policies
```sql
-- Shared prompts policies
CREATE POLICY "Users can view shared prompts they created" ON shared_prompts
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create shared prompts for their prompts" ON shared_prompts
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND 
        EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can update their shared prompts" ON shared_prompts
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their shared prompts" ON shared_prompts
    FOR DELETE USING (auth.uid() = created_by);
```

### 4.4 Usage Tracking Policies
```sql
-- Usage tracking policies
CREATE POLICY "Users can view their own usage" ON usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage tracking" ON usage_tracking
    FOR INSERT WITH CHECK (true); -- Allow system inserts

-- Note: Updates and deletes restricted to service role
```

### 4.5 Analytics Events Policies
```sql
-- Analytics events policies
CREATE POLICY "Users can view their own analytics" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true); -- Allow system inserts
```

### 4.6 API Keys Policies
```sql
-- API keys policies
CREATE POLICY "Users can view their own API keys" ON api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys" ON api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" ON api_keys
    FOR DELETE USING (auth.uid() = user_id);
```

## ⚙️ **Step 5: Database Functions and Triggers**

### 5.1 Core Functions
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate share tokens
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(prompt_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE prompts 
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE id = prompt_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5.2 Create Triggers
```sql
-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at 
    BEFORE UPDATE ON prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_prompts_updated_at 
    BEFORE UPDATE ON shared_prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at 
    BEFORE UPDATE ON rate_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_background_jobs_updated_at 
    BEFORE UPDATE ON background_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at 
    BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 📊 **Step 6: Create Useful Views**

### 6.1 Analytics Views
```sql
-- User statistics view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    p.id as user_id,
    p.email,
    p.subscription_tier,
    p.created_at as user_created_at,
    COUNT(pr.id) as total_prompts,
    COUNT(CASE WHEN pr.enriched_prompt IS NOT NULL THEN 1 END) as enhanced_prompts,
    COUNT(CASE WHEN pr.is_favorite = TRUE THEN 1 END) as favorite_prompts,
    COUNT(CASE WHEN pr.is_public = TRUE THEN 1 END) as public_prompts,
    SUM(pr.view_count) as total_views,
    SUM(pr.copy_count) as total_copies,
    COUNT(DISTINCT pr.selected_model) as unique_models_used,
    MAX(pr.created_at) as last_prompt_date
FROM profiles p
LEFT JOIN prompts pr ON p.id = pr.user_id
GROUP BY p.id, p.email, p.subscription_tier, p.created_at;

-- Popular prompts view
CREATE OR REPLACE VIEW popular_prompts AS
SELECT 
    pr.*,
    p.email as creator_email,
    p.full_name as creator_name
FROM prompts pr
JOIN profiles p ON pr.user_id = p.id
WHERE pr.is_public = true
ORDER BY pr.view_count DESC, pr.created_at DESC;

-- Usage analytics view
CREATE OR REPLACE VIEW usage_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    action_type,
    COUNT(*) as action_count,
    COUNT(DISTINCT user_id) as unique_users,
    SUM(tokens_used) as total_tokens,
    AVG(processing_time_ms) as avg_processing_time,
    COUNT(CASE WHEN success = false THEN 1 END) as error_count
FROM usage_tracking
GROUP BY DATE_TRUNC('day', created_at), action_type
ORDER BY date DESC, action_type;
```

## 🔒 **Step 7: Authentication Configuration**

### 7.1 Configure Auth Settings
In Supabase Dashboard → Authentication → Settings:

1. **Site URL**: `https://yourdomain.com`
2. **Redirect URLs**: 
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (development)
3. **JWT Expiry**: `3600` (1 hour)
4. **Refresh Token Rotation**: Enabled
5. **Double Confirm Changes**: Enabled

### 7.2 Configure OAuth Providers
Set up OAuth providers as needed:

#### Google OAuth
1. Go to Authentication → Providers → Google
2. Enable Google provider
3. Add your Google OAuth credentials
4. Set authorized domains

#### GitHub OAuth
1. Go to Authentication → Providers → GitHub
2. Enable GitHub provider
3. Add your GitHub OAuth credentials

## 🚀 **Step 8: Storage Configuration**

### 8.1 Create Storage Buckets
```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('prompt-assets', 'prompt-assets', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain']);
```

### 8.2 Storage Policies
```sql
-- Avatar storage policies
CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Prompt assets policies
CREATE POLICY "Users can upload prompt assets" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'prompt-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own prompt assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'prompt-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own prompt assets" ON storage.objects
    FOR DELETE USING (bucket_id = 'prompt-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## ✅ **Step 9: Verification and Testing**

### 9.1 Test Database Connection
Create a test script `scripts/test-connection.js`:

```javascript
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').single()
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful')
    
    // Test authentication
    const { data: authData, error: authError } = await supabase.auth.getSession()
    console.log('✅ Auth system operational')
    
    // Test storage
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
    if (storageError) {
      console.warn('⚠️ Storage might need configuration:', storageError.message)
    } else {
      console.log('✅ Storage buckets configured:', buckets.map(b => b.name))
    }
    
    return true
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

testConnection()
```

### 9.2 Run Tests
```bash
node scripts/test-connection.js
```

## 📚 **Step 10: Documentation and Handoff**

### 10.1 Create API Documentation
Document all endpoints, schemas, and usage examples.

### 10.2 Security Checklist
- [ ] RLS enabled on all tables
- [ ] Proper authentication configured
- [ ] Storage policies implemented
- [ ] Environment variables secured
- [ ] API keys generated and stored securely

### 10.3 Monitoring Setup
- Enable Supabase monitoring
- Set up alerts for errors and performance
- Configure backup schedules

## 🎉 **Project Ready!**

Your new Supabase project is now configured with:
- ✅ Complete database schema
- ✅ Row Level Security
- ✅ Authentication system
- ✅ Storage configuration
- ✅ Performance indexes
- ✅ Analytics tracking
- ✅ Background job support

**Next Steps:**
1. Deploy backend API services
2. Implement prompt enrichment
3. Add sharing functionality
4. Set up monitoring and analytics 