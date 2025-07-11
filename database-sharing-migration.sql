-- XMLPrompter Sharing System Migration
-- Add missing fields to shared_prompts table for complete sharing functionality

-- Add missing columns to shared_prompts table
ALTER TABLE shared_prompts 
ADD COLUMN IF NOT EXISTS share_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS prompt_content TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS allow_download BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE;

-- Update share_id for existing records if they don't have one
UPDATE shared_prompts 
SET share_id = encode(gen_random_bytes(16), 'hex')
WHERE share_id IS NULL;

-- Make share_id NOT NULL after updating existing records
ALTER TABLE shared_prompts 
ALTER COLUMN share_id SET NOT NULL;

-- Add constraints for data integrity
ALTER TABLE shared_prompts 
ADD CONSTRAINT shared_prompts_share_id_unique UNIQUE (share_id);

-- Update any records that have share_token instead of share_id
UPDATE shared_prompts 
SET share_id = share_token 
WHERE share_id IS NULL AND share_token IS NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shared_prompts_share_id ON shared_prompts(share_id);
CREATE INDEX IF NOT EXISTS idx_shared_prompts_created_by_date ON shared_prompts(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_prompts_public_views ON shared_prompts(is_public, view_count DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_shared_prompts_expires_at ON shared_prompts(expires_at) WHERE expires_at IS NOT NULL;

-- Add RLS policies for sharing
CREATE POLICY "Users can view their own shared prompts" ON shared_prompts
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create shared prompts" ON shared_prompts
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own shared prompts" ON shared_prompts
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own shared prompts" ON shared_prompts
    FOR DELETE USING (auth.uid() = created_by);

-- Allow public access to active shared prompts
CREATE POLICY "Public access to active shared prompts" ON shared_prompts
    FOR SELECT USING (is_active = true);

-- Enable RLS on shared_prompts table
ALTER TABLE shared_prompts ENABLE ROW LEVEL SECURITY;

-- Create function to cleanup expired shares
CREATE OR REPLACE FUNCTION cleanup_expired_shares()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE shared_prompts 
    SET is_active = false 
    WHERE expires_at IS NOT NULL 
      AND expires_at < NOW() 
      AND is_active = true;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to cleanup shares that have reached view limit
CREATE OR REPLACE FUNCTION cleanup_view_limited_shares()
RETURNS INTEGER AS $$
DECLARE
    limited_count INTEGER;
BEGIN
    UPDATE shared_prompts 
    SET is_active = false 
    WHERE max_views IS NOT NULL 
      AND view_count >= max_views 
      AND is_active = true;
    
    GET DIAGNOSTICS limited_count = ROW_COUNT;
    RETURN limited_count;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shared_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shared_prompts_updated_at_trigger
    BEFORE UPDATE ON shared_prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_shared_prompts_updated_at();

-- Create view for sharing analytics
CREATE OR REPLACE VIEW sharing_analytics AS
SELECT 
    sp.created_by,
    p.email as creator_email,
    p.full_name as creator_name,
    COUNT(*) as total_shares,
    COUNT(CASE WHEN sp.is_public THEN 1 END) as public_shares,
    COUNT(CASE WHEN sp.is_active THEN 1 END) as active_shares,
    SUM(sp.view_count) as total_views,
    AVG(sp.view_count) as avg_views_per_share,
    MAX(sp.view_count) as max_views_single_share,
    COUNT(CASE WHEN sp.password_hash IS NOT NULL THEN 1 END) as password_protected_shares,
    COUNT(CASE WHEN sp.expires_at IS NOT NULL THEN 1 END) as expiring_shares,
    COUNT(CASE WHEN sp.max_views IS NOT NULL THEN 1 END) as view_limited_shares
FROM shared_prompts sp
JOIN profiles p ON sp.created_by = p.id
GROUP BY sp.created_by, p.email, p.full_name;

-- Grant necessary permissions
GRANT SELECT ON sharing_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_shares() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_view_limited_shares() TO authenticated;

-- Insert some sample data for testing (optional)
-- This can be removed in production
/*
INSERT INTO shared_prompts (
    share_id, 
    prompt_id, 
    created_by, 
    prompt_content, 
    title, 
    description, 
    is_public, 
    is_active
) 
SELECT 
    encode(gen_random_bytes(16), 'hex'),
    p.id,
    p.user_id,
    COALESCE(p.enriched_prompt, p.raw_prompt, 'Sample prompt content'),
    COALESCE(p.title, 'Shared Prompt'),
    COALESCE(p.description, 'A shared prompt for testing'),
    false,
    true
FROM prompts p 
WHERE p.user_id IS NOT NULL 
LIMIT 5;
*/

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Sharing system migration completed successfully!';
    RAISE NOTICE 'Added missing columns, indexes, RLS policies, and helper functions.';
    RAISE NOTICE 'The sharing system is now ready for use.';
END $$; 