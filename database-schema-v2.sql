-- XMLPrompter/PromptCraft AI - Production Database Schema v2.0
-- Complete backend schema with sharing, analytics, and advanced features
-- Created: January 2025

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- CORE USER MANAGEMENT
-- ============================================================================

-- Enhanced profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    
    -- Subscription management
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    subscription_created_at TIMESTAMP WITH TIME ZONE,
    billing_customer_id TEXT UNIQUE,
    
    -- API access
    api_key_hash TEXT,
    api_calls_remaining INTEGER DEFAULT 1000,
    api_calls_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month'),
    
    -- User preferences
    preferences JSONB DEFAULT '{
        "theme": "light",
        "notifications": true,
        "defaultModel": "claude-3-5-sonnet",
        "autoEnrichment": true,
        "publicProfile": false
    }',
    
    -- Profile stats
    total_prompts INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    profile_views INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PROMPT MANAGEMENT
-- ============================================================================

-- Enhanced prompts table with versioning and sharing
CREATE TABLE IF NOT EXISTS prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic metadata
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
    
    -- Model and AI metadata
    selected_model TEXT DEFAULT 'claude-3-5-sonnet',
    prompt_metadata JSONB DEFAULT '{}',
    enrichment_result JSONB DEFAULT '{}',
    quality_score DECIMAL(3,2),
    
    -- Engagement metrics
    token_count INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    copy_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- Version control
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES prompts(id),
    is_template BOOLEAN DEFAULT FALSE,
    
    -- Content moderation
    moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
    moderation_notes TEXT,
    moderated_at TIMESTAMP WITH TIME ZONE,
    moderated_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT prompts_quality_score_range CHECK (quality_score >= 0 AND quality_score <= 10)
);

-- Prompt categories lookup table
CREATE TABLE IF NOT EXISTS prompt_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO prompt_categories (id, name, description, icon, color, sort_order) VALUES
('writing', 'Writing & Content', 'Content creation, copywriting, and creative writing', 'PenTool', '#3B82F6', 1),
('coding', 'Development & Code', 'Programming, debugging, and technical documentation', 'Code', '#10B981', 2),
('analysis', 'Analysis & Research', 'Data analysis, research, and critical thinking', 'BarChart', '#8B5CF6', 3),
('design', 'Design & Creative', 'UI/UX design, creative projects, and visual content', 'Palette', '#F59E0B', 4),
('business', 'Business & Strategy', 'Business planning, strategy, and professional communication', 'Briefcase', '#EF4444', 5),
('education', 'Education & Learning', 'Teaching, learning, and educational content', 'GraduationCap', '#06B6D4', 6),
('marketing', 'Marketing & Sales', 'Marketing campaigns, sales copy, and promotional content', 'TrendingUp', '#EC4899', 7),
('general', 'General Purpose', 'Versatile prompts for various use cases', 'Zap', '#6B7280', 8)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SHARING & COLLABORATION
-- ============================================================================

-- Shared prompts table
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
    require_auth BOOLEAN DEFAULT FALSE,
    
    -- Sharing settings
    allow_copy BOOLEAN DEFAULT TRUE,
    allow_remix BOOLEAN DEFAULT TRUE,
    allow_comments BOOLEAN DEFAULT TRUE,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    copy_count INTEGER DEFAULT 0,
    remix_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    
    -- Expiration
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompt likes/reactions
CREATE TABLE IF NOT EXISTS prompt_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'useful', 'creative', 'clear')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(prompt_id, user_id, reaction_type)
);

-- Prompt comments
CREATE TABLE IF NOT EXISTS prompt_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES prompt_comments(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    -- Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS & TRACKING
-- ============================================================================

-- Enhanced usage tracking
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Action details
    action_type TEXT NOT NULL CHECK (action_type IN ('prompt_generation', 'enhancement', 'save', 'share', 'api_call', 'view', 'copy', 'remix')),
    resource_type TEXT,
    resource_id UUID,
    
    -- Usage metrics
    tokens_used INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    model_used TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    error_code TEXT,
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    session_id TEXT,
    country_code TEXT,
    
    -- A/B testing
    experiment_id TEXT,
    variant TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detailed analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Event identification
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
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Technical context
    ip_address INET,
    user_agent TEXT,
    screen_resolution TEXT,
    viewport_size TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions tracking
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    
    -- Session data
    ip_address INET,
    user_agent TEXT,
    country_code TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    
    -- Session metrics
    page_views INTEGER DEFAULT 0,
    actions_count INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(session_id)
);

-- ============================================================================
-- API MANAGEMENT
-- ============================================================================

-- API keys management
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Key details
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL, -- First 8 chars for identification
    name TEXT NOT NULL,
    description TEXT,
    
    -- Permissions
    permissions JSONB DEFAULT '{
        "read": true,
        "write": false,
        "admin": false,
        "analytics": false
    }',
    allowed_origins TEXT[],
    allowed_ips INET[],
    
    -- Rate limiting
    rate_limit_per_hour INTEGER DEFAULT 1000,
    rate_limit_per_day INTEGER DEFAULT 10000,
    rate_limit_per_month INTEGER DEFAULT 100000,
    
    -- Usage tracking
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    total_requests INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate limiting tracking
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

-- ============================================================================
-- BACKGROUND PROCESSING
-- ============================================================================

-- Background jobs queue
CREATE TABLE IF NOT EXISTS background_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Job identification
    job_type TEXT NOT NULL,
    job_name TEXT,
    queue_name TEXT DEFAULT 'default',
    
    -- Job data
    payload JSONB DEFAULT '{}',
    
    -- Execution details
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'retrying')),
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
    error_stack TEXT,
    
    -- Progress tracking
    progress_current INTEGER DEFAULT 0,
    progress_total INTEGER DEFAULT 1,
    progress_message TEXT,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS & COMMUNICATIONS
-- ============================================================================

-- User notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification details
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    
    -- Delivery channels
    send_email BOOLEAN DEFAULT FALSE,
    send_push BOOLEAN DEFAULT FALSE,
    send_in_app BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SYSTEM CONFIGURATION
-- ============================================================================

-- Feature flags
CREATE TABLE IF NOT EXISTS feature_flags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT FALSE,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    target_users UUID[],
    target_tiers TEXT[],
    conditions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_subscription_tier_idx ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS profiles_billing_customer_idx ON profiles(billing_customer_id);
CREATE INDEX IF NOT EXISTS profiles_last_active_idx ON profiles(last_active_at DESC);

-- Prompts indexes
CREATE INDEX IF NOT EXISTS prompts_user_id_idx ON prompts(user_id);
CREATE INDEX IF NOT EXISTS prompts_created_at_idx ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS prompts_title_search_idx ON prompts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS prompts_content_search_idx ON prompts USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(task, '')));
CREATE INDEX IF NOT EXISTS prompts_category_idx ON prompts(category);
CREATE INDEX IF NOT EXISTS prompts_tags_idx ON prompts USING gin(tags);
CREATE INDEX IF NOT EXISTS prompts_is_public_idx ON prompts(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS prompts_is_featured_idx ON prompts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS prompts_user_created_idx ON prompts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS prompts_public_popular_idx ON prompts(is_public, view_count DESC, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS prompts_quality_score_idx ON prompts(quality_score DESC) WHERE quality_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS prompts_moderation_status_idx ON prompts(moderation_status);

-- Shared prompts indexes
CREATE INDEX IF NOT EXISTS shared_prompts_token_idx ON shared_prompts(share_token);
CREATE INDEX IF NOT EXISTS shared_prompts_prompt_id_idx ON shared_prompts(prompt_id);
CREATE INDEX IF NOT EXISTS shared_prompts_created_by_idx ON shared_prompts(created_by);
CREATE INDEX IF NOT EXISTS shared_prompts_expires_at_idx ON shared_prompts(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS shared_prompts_public_idx ON shared_prompts(is_public) WHERE is_public = true;

-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS usage_tracking_user_id_idx ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS usage_tracking_created_at_idx ON usage_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS usage_tracking_action_type_idx ON usage_tracking(action_type);
CREATE INDEX IF NOT EXISTS usage_tracking_user_date_idx ON usage_tracking(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS usage_tracking_session_idx ON usage_tracking(session_id);

-- Analytics events indexes
CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_events_session_id_idx ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS analytics_events_event_category_idx ON analytics_events(event_category);

-- API keys indexes
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS api_keys_is_active_idx ON api_keys(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS api_keys_expires_at_idx ON api_keys(expires_at) WHERE expires_at IS NOT NULL;

-- Background jobs indexes
CREATE INDEX IF NOT EXISTS background_jobs_status_idx ON background_jobs(status);
CREATE INDEX IF NOT EXISTS background_jobs_scheduled_at_idx ON background_jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS background_jobs_job_type_idx ON background_jobs(job_type);
CREATE INDEX IF NOT EXISTS background_jobs_priority_idx ON background_jobs(priority DESC, created_at);
CREATE INDEX IF NOT EXISTS background_jobs_queue_idx ON background_jobs(queue_name, status, priority DESC);

-- Rate limits indexes
CREATE INDEX IF NOT EXISTS rate_limits_identifier_idx ON rate_limits(identifier, identifier_type, endpoint);
CREATE INDEX IF NOT EXISTS rate_limits_window_start_idx ON rate_limits(window_start);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(type);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Prompts policies
CREATE POLICY "Users can view their own prompts" ON prompts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public prompts" ON prompts
    FOR SELECT USING (is_public = true AND moderation_status = 'approved');

CREATE POLICY "Users can insert their own prompts" ON prompts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts" ON prompts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts" ON prompts
    FOR DELETE USING (auth.uid() = user_id);

-- Prompt categories policies (read-only for users)
CREATE POLICY "Anyone can view prompt categories" ON prompt_categories
    FOR SELECT USING (is_active = true);

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

-- Prompt reactions policies
CREATE POLICY "Users can view reactions on public prompts" ON prompt_reactions
    FOR SELECT USING (EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND (is_public = true OR user_id = auth.uid())));

CREATE POLICY "Users can add reactions to public prompts" ON prompt_reactions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND (is_public = true OR user_id = auth.uid()))
    );

CREATE POLICY "Users can delete their own reactions" ON prompt_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- Prompt comments policies
CREATE POLICY "Users can view comments on accessible prompts" ON prompt_comments
    FOR SELECT USING (
        is_deleted = false AND
        EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND (is_public = true OR user_id = auth.uid()))
    );

CREATE POLICY "Users can add comments to accessible prompts" ON prompt_comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND (is_public = true OR user_id = auth.uid()))
    );

CREATE POLICY "Users can update their own comments" ON prompt_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON prompt_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Usage tracking policies
CREATE POLICY "Users can view their own usage" ON usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage tracking" ON usage_tracking
    FOR INSERT WITH CHECK (true);

-- Analytics events policies
CREATE POLICY "Users can view their own analytics" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- User sessions policies
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user sessions" ON user_sessions
    FOR ALL USING (true);

-- API keys policies
CREATE POLICY "Users can view their own API keys" ON api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys" ON api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" ON api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- Rate limits policies (system managed)
CREATE POLICY "System manages rate limits" ON rate_limits
    FOR ALL USING (true);

-- Background jobs policies
CREATE POLICY "Users can view their own jobs" ON background_jobs
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "System can manage background jobs" ON background_jobs
    FOR ALL USING (true);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Email templates policies (admin only)
CREATE POLICY "Admins can manage email templates" ON email_templates
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND subscription_tier = 'enterprise')
    );

-- Feature flags policies (read-only for users)
CREATE POLICY "Anyone can view active feature flags" ON feature_flags
    FOR SELECT USING (is_enabled = true);

-- System settings policies (read-only for users, public settings only)
CREATE POLICY "Anyone can view public system settings" ON system_settings
    FOR SELECT USING (is_public = true);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

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
DECLARE
    fetched_email TEXT;
BEGIN
    -- Explicitly fetch the email from auth.users table using NEW.id
    SELECT email INTO fetched_email FROM auth.users WHERE id = NEW.id;

    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, fetched_email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- Function to generate share tokens
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count safely
CREATE OR REPLACE FUNCTION increment_view_count(prompt_uuid UUID, increment_amount INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
    UPDATE prompts 
    SET view_count = view_count + increment_amount,
        updated_at = NOW()
    WHERE id = prompt_uuid;
    
    -- Also update shared prompts view count if applicable
    UPDATE shared_prompts 
    SET view_count = view_count + increment_amount,
        last_accessed_at = NOW(),
        updated_at = NOW()
    WHERE prompt_id = prompt_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles 
        SET total_prompts = total_prompts + 1
        WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles 
        SET total_prompts = total_prompts - 1
        WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Clean expired shared prompts
    DELETE FROM shared_prompts 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean old analytics events (older than 1 year)
    DELETE FROM analytics_events 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Clean old usage tracking (older than 6 months)
    DELETE FROM usage_tracking 
    WHERE created_at < NOW() - INTERVAL '6 months';
    
    -- Clean completed background jobs (older than 1 week)
    DELETE FROM background_jobs 
    WHERE status = 'completed' AND completed_at < NOW() - INTERVAL '1 week';
    
    -- Clean old rate limit records (older than 1 day)
    DELETE FROM rate_limits 
    WHERE created_at < NOW() - INTERVAL '1 day';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at 
    BEFORE UPDATE ON prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_prompts_updated_at 
    BEFORE UPDATE ON shared_prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at 
    BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_background_jobs_updated_at 
    BEFORE UPDATE ON background_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at 
    BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at 
    BEFORE UPDATE ON feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update user stats when prompts are added/removed
CREATE TRIGGER update_user_stats_on_prompt_change
    AFTER INSERT OR DELETE ON prompts
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- ============================================================================
-- USEFUL VIEWS
-- ============================================================================

-- User statistics view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    p.subscription_tier,
    p.subscription_status,
    p.created_at as user_created_at,
    p.last_active_at,
    
    -- Prompt statistics
    COUNT(pr.id) as total_prompts,
    COUNT(CASE WHEN pr.enriched_prompt IS NOT NULL THEN 1 END) as enhanced_prompts,
    COUNT(CASE WHEN pr.is_favorite = TRUE THEN 1 END) as favorite_prompts,
    COUNT(CASE WHEN pr.is_public = TRUE THEN 1 END) as public_prompts,
    COUNT(CASE WHEN pr.is_template = TRUE THEN 1 END) as template_prompts,
    
    -- Engagement statistics
    COALESCE(SUM(pr.view_count), 0) as total_views,
    COALESCE(SUM(pr.copy_count), 0) as total_copies,
    COALESCE(SUM(pr.like_count), 0) as total_likes,
    
    -- Usage statistics
    COUNT(DISTINCT pr.selected_model) as unique_models_used,
    COALESCE(AVG(pr.quality_score), 0) as avg_quality_score,
    
    -- Dates
    MIN(pr.created_at) as first_prompt_date,
    MAX(pr.created_at) as last_prompt_date,
    
    -- Sharing statistics
    COUNT(sp.id) as total_shares
    
FROM profiles p
LEFT JOIN prompts pr ON p.id = pr.user_id
LEFT JOIN shared_prompts sp ON p.id = sp.created_by
GROUP BY p.id, p.email, p.full_name, p.subscription_tier, p.subscription_status, p.created_at, p.last_active_at;

-- Popular prompts view
CREATE OR REPLACE VIEW popular_prompts AS
SELECT 
    pr.*,
    p.email as creator_email,
    p.full_name as creator_name,
    pc.name as category_name,
    pc.color as category_color,
    pc.icon as category_icon,
    
    -- Engagement score calculation
    (pr.view_count * 1.0 + pr.copy_count * 2.0 + pr.like_count * 3.0) as engagement_score
    
FROM prompts pr
JOIN profiles p ON pr.user_id = p.id
LEFT JOIN prompt_categories pc ON pr.category = pc.id
WHERE pr.is_public = true 
  AND pr.moderation_status = 'approved'
ORDER BY engagement_score DESC, pr.created_at DESC;

-- Usage analytics view
CREATE OR REPLACE VIEW usage_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    action_type,
    COUNT(*) as action_count,
    COUNT(DISTINCT user_id) as unique_users,
    SUM(tokens_used) as total_tokens,
    AVG(processing_time_ms) as avg_processing_time,
    COUNT(CASE WHEN success = false THEN 1 END) as error_count,
    ROUND(COUNT(CASE WHEN success = true THEN 1 END)::DECIMAL / COUNT(*) * 100, 2) as success_rate
FROM usage_tracking
GROUP BY DATE_TRUNC('day', created_at), action_type
ORDER BY date DESC, action_type;

-- System health view
CREATE OR REPLACE VIEW system_health AS
SELECT 
    'prompts' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as records_last_24h,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as records_last_7d
FROM prompts

UNION ALL

SELECT 
    'users' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as records_last_24h,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as records_last_7d
FROM profiles

UNION ALL

SELECT 
    'usage_tracking' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as records_last_24h,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as records_last_7d
FROM usage_tracking;

-- ============================================================================
-- INITIAL DATA AND CONFIGURATION
-- ============================================================================

-- Insert default system settings
INSERT INTO system_settings (key, value, description, is_public) VALUES
('app_name', '"XMLPrompter"', 'Application name', true),
('app_version', '"2.0.0"', 'Current application version', true),
('maintenance_mode', 'false', 'Enable maintenance mode', false),
('registration_enabled', 'true', 'Allow new user registration', false),
('max_prompts_per_user', '1000', 'Maximum prompts per user', false),
('max_shares_per_user', '100', 'Maximum shares per user', false),
('default_rate_limit', '1000', 'Default API rate limit per hour', false),
('enrichment_enabled', 'true', 'Enable prompt enrichment', true),
('sharing_enabled', 'true', 'Enable prompt sharing', true),
('public_gallery_enabled', 'true', 'Enable public prompt gallery', true)
ON CONFLICT (key) DO NOTHING;

-- Insert default feature flags
INSERT INTO feature_flags (id, name, description, is_enabled, rollout_percentage) VALUES
('prompt_enrichment', 'Prompt Enrichment', 'AI-powered prompt enhancement', true, 100),
('prompt_sharing', 'Prompt Sharing', 'Share prompts with others', true, 100),
('public_gallery', 'Public Gallery', 'Browse public prompts', true, 100),
('advanced_analytics', 'Advanced Analytics', 'Detailed usage analytics', true, 50),
('api_access', 'API Access', 'REST API access', true, 25),
('collaborative_editing', 'Collaborative Editing', 'Real-time collaborative editing', false, 0),
('ai_suggestions', 'AI Suggestions', 'AI-powered prompt suggestions', false, 10)
ON CONFLICT (id) DO NOTHING;

-- Insert default email templates
INSERT INTO email_templates (id, name, subject, html_content, text_content) VALUES
('welcome', 'Welcome Email', 'Welcome to XMLPrompter!', 
 '<h1>Welcome to XMLPrompter!</h1><p>Thank you for joining our community of prompt engineers.</p>',
 'Welcome to XMLPrompter! Thank you for joining our community of prompt engineers.'),
('password_reset', 'Password Reset', 'Reset your XMLPrompter password',
 '<h1>Reset Your Password</h1><p>Click the link below to reset your password:</p>',
 'Reset Your Password. Click the link below to reset your password:'),
('prompt_shared', 'Prompt Shared', 'Someone shared a prompt with you',
 '<h1>New Prompt Shared</h1><p>A prompt has been shared with you on XMLPrompter.</p>',
 'New Prompt Shared. A prompt has been shared with you on XMLPrompter.')
ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON prompts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON prompt_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON shared_prompts TO authenticated;
GRANT SELECT, INSERT, DELETE ON prompt_reactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON prompt_comments TO authenticated;
GRANT SELECT, INSERT ON usage_tracking TO authenticated;
GRANT SELECT, INSERT ON analytics_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO authenticated;
GRANT SELECT ON rate_limits TO authenticated;
GRANT SELECT ON background_jobs TO authenticated;
GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT SELECT ON email_templates TO authenticated;
GRANT SELECT ON feature_flags TO authenticated;
GRANT SELECT ON system_settings TO authenticated;

-- Grant access to views
GRANT SELECT ON user_stats TO authenticated;
GRANT SELECT ON popular_prompts TO authenticated;
GRANT SELECT ON usage_analytics TO authenticated;
GRANT SELECT ON system_health TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- CLEANUP AND MAINTENANCE
-- ============================================================================

-- Create a scheduled job for cleanup (requires pg_cron extension)
-- This would typically be set up separately in production
-- SELECT cron.schedule('cleanup-expired-data', '0 2 * * *', 'SELECT cleanup_expired_data();');

-- Final success message
DO $$
BEGIN
    RAISE NOTICE 'XMLPrompter Database Schema v2.0 installed successfully!';
    RAISE NOTICE 'Tables created: %, Views created: %, Functions created: %', 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'),
        (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public'),
        (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION');
END $$; 