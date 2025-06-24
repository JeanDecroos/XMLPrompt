-- Database schema for XMLPrompter / PromptCraft AI
-- This file contains the SQL schema for the prompts table and user profiles
-- Updated: December 2024

-- Create profiles table for user subscription and metadata
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    subscription_created_at TIMESTAMP WITH TIME ZONE,
    billing_customer_id TEXT, -- For Stripe/payment processor integration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for profiles table
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_subscription_tier_idx ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS profiles_billing_customer_idx ON profiles(billing_customer_id);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to automatically create profile on user signup
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Prompt metadata
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Form data fields
    role TEXT,
    task TEXT,
    context TEXT,
    requirements TEXT,
    style TEXT,
    output TEXT,
    
    -- Generated prompts
    raw_prompt TEXT,
    enriched_prompt TEXT,
    
    -- Model and metadata
    selected_model TEXT,
    prompt_metadata JSONB,
    enrichment_result JSONB,
    
    -- Usage tracking
    token_count INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT FALSE,
    
    -- Constraints
    CONSTRAINT prompts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS prompts_user_id_idx ON prompts(user_id);
CREATE INDEX IF NOT EXISTS prompts_created_at_idx ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS prompts_title_idx ON prompts(title);
CREATE INDEX IF NOT EXISTS prompts_role_idx ON prompts(role);
CREATE INDEX IF NOT EXISTS prompts_selected_model_idx ON prompts(selected_model);
CREATE INDEX IF NOT EXISTS prompts_is_favorite_idx ON prompts(is_favorite);
CREATE INDEX IF NOT EXISTS prompts_user_created_idx ON prompts(user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own prompts
CREATE POLICY "Users can view their own prompts" ON prompts
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own prompts
CREATE POLICY "Users can insert their own prompts" ON prompts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own prompts
CREATE POLICY "Users can update their own prompts" ON prompts
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own prompts
CREATE POLICY "Users can delete their own prompts" ON prompts
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for prompt statistics (useful for analytics)
CREATE OR REPLACE VIEW prompt_stats AS
SELECT 
    user_id,
    COUNT(*) as total_prompts,
    COUNT(CASE WHEN enriched_prompt IS NOT NULL THEN 1 END) as enhanced_prompts,
    COUNT(DISTINCT selected_model) as unique_models_used,
    SUM(token_count) as total_tokens_used,
    COUNT(CASE WHEN is_favorite = TRUE THEN 1 END) as favorite_prompts,
    MIN(created_at) as first_prompt_date,
    MAX(created_at) as last_prompt_date
FROM prompts
GROUP BY user_id;

-- Create usage tracking table for subscription limits
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('prompt_generation', 'enhancement', 'save')),
    tokens_used INTEGER DEFAULT 0,
    model_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT usage_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for usage tracking
CREATE INDEX IF NOT EXISTS usage_tracking_user_id_idx ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS usage_tracking_created_at_idx ON usage_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS usage_tracking_action_type_idx ON usage_tracking(action_type);
CREATE INDEX IF NOT EXISTS usage_tracking_user_date_idx ON usage_tracking(user_id, created_at DESC);

-- Enable RLS for usage tracking
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for usage tracking
CREATE POLICY "Users can view their own usage" ON usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" ON usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a view for usage statistics
CREATE OR REPLACE VIEW usage_stats AS
SELECT 
    user_id,
    DATE_TRUNC('day', created_at) as date,
    action_type,
    COUNT(*) as action_count,
    SUM(tokens_used) as total_tokens,
    COUNT(DISTINCT model_used) as unique_models
FROM usage_tracking
GROUP BY user_id, DATE_TRUNC('day', created_at), action_type;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON prompts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON prompt_stats TO authenticated;
GRANT SELECT, INSERT ON usage_tracking TO authenticated;
GRANT SELECT ON usage_stats TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 