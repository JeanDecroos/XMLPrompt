-- XMLPrompter Templates Database Schema
-- Comprehensive template management system with user contributions and analytics

-- =============================================================================
-- TEMPLATES CORE TABLES
-- =============================================================================

-- Template Categories
CREATE TABLE IF NOT EXISTS template_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT, -- Icon name for frontend
    color TEXT, -- CSS color class
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template Tags
CREATE TABLE IF NOT EXISTS template_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT, -- Group tags by category
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main Templates Table
CREATE TABLE IF NOT EXISTS templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Basic Information
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES template_categories(id),
    
    -- Template Content (JSONB for flexibility)
    template_data JSONB NOT NULL DEFAULT '{}', -- {role, task, context, requirements, style, output}
    preview_text TEXT, -- Short preview for display
    
    -- Metadata
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for system templates
    author_name TEXT, -- Fallback for system templates
    tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
    
    -- Status & Visibility
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived', 'pending_review')),
    is_featured BOOLEAN DEFAULT FALSE,
    is_system_template BOOLEAN DEFAULT FALSE, -- System vs user-created
    
    -- Analytics
    usage_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    copy_count INTEGER DEFAULT 0,
    
    -- Version Control
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES templates(id), -- For template variations
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT templates_title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
    CONSTRAINT templates_description_length CHECK (char_length(description) <= 1000)
);

-- Template-Tag Junction Table
CREATE TABLE IF NOT EXISTS template_tags_junction (
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES template_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (template_id, tag_id)
);

-- Template Usage Tracking
CREATE TABLE IF NOT EXISTS template_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Usage Details
    action_type TEXT NOT NULL CHECK (action_type IN ('view', 'copy', 'use', 'rate', 'share')),
    session_id TEXT,
    
    -- Context
    source_page TEXT, -- Where the template was accessed from
    search_query TEXT, -- What was searched to find this template
    filters_applied JSONB, -- Category, tags, etc. used in search
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template Ratings & Reviews
CREATE TABLE IF NOT EXISTS template_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Rating Details
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    is_helpful BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(template_id, user_id) -- One rating per user per template
);

-- Template Favorites
CREATE TABLE IF NOT EXISTS template_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(template_id, user_id)
);

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================

-- Template Categories
CREATE INDEX IF NOT EXISTS idx_template_categories_active ON template_categories(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_template_categories_name ON template_categories(name);

-- Template Tags
CREATE INDEX IF NOT EXISTS idx_template_tags_active ON template_tags(is_active);
CREATE INDEX IF NOT EXISTS idx_template_tags_category ON template_tags(category);
CREATE INDEX IF NOT EXISTS idx_template_tags_usage ON template_tags(usage_count DESC);

-- Templates
CREATE INDEX IF NOT EXISTS idx_templates_status_tier ON templates(status, tier);
CREATE INDEX IF NOT EXISTS idx_templates_category_status ON templates(category_id, status);
CREATE INDEX IF NOT EXISTS idx_templates_featured ON templates(is_featured, status) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_templates_usage_popular ON templates(usage_count DESC, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_templates_rating_popular ON templates(rating_average DESC, rating_count DESC, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_templates_author ON templates(author_id, status);
CREATE INDEX IF NOT EXISTS idx_templates_created_date ON templates(created_at DESC, status) WHERE status = 'active';

-- Full-text search on templates
CREATE INDEX IF NOT EXISTS idx_templates_search ON templates 
  USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(preview_text, '')));

-- Template Tags Junction
CREATE INDEX IF NOT EXISTS idx_template_tags_junction_template ON template_tags_junction(template_id);
CREATE INDEX IF NOT EXISTS idx_template_tags_junction_tag ON template_tags_junction(tag_id);

-- Template Usage
CREATE INDEX IF NOT EXISTS idx_template_usage_template ON template_usage(template_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_template_usage_user ON template_usage(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_template_usage_action ON template_usage(action_type, created_at DESC);

-- Template Ratings
CREATE INDEX IF NOT EXISTS idx_template_ratings_template ON template_ratings(template_id, rating);
CREATE INDEX IF NOT EXISTS idx_template_ratings_user ON template_ratings(user_id, created_at DESC);

-- Template Favorites
CREATE INDEX IF NOT EXISTS idx_template_favorites_user ON template_favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_template_favorites_template ON template_favorites(template_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_tags_junction ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_favorites ENABLE ROW LEVEL SECURITY;

-- Template Categories Policies
CREATE POLICY "Anyone can view active categories" ON template_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON template_categories
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Template Tags Policies
CREATE POLICY "Anyone can view active tags" ON template_tags
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tags" ON template_tags
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Templates Policies
CREATE POLICY "Anyone can view active templates" ON templates
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view their own templates" ON templates
    FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can create templates" ON templates
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own templates" ON templates
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all templates" ON templates
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Template Tags Junction Policies
CREATE POLICY "Anyone can view template tags" ON template_tags_junction
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage template tags" ON template_tags_junction
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Template Usage Policies
CREATE POLICY "Users can view their own usage" ON template_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create usage records" ON template_usage
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all usage" ON template_usage
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Template Ratings Policies
CREATE POLICY "Anyone can view ratings" ON template_ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own ratings" ON template_ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON template_ratings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all ratings" ON template_ratings
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Template Favorites Policies
CREATE POLICY "Users can view their own favorites" ON template_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON template_favorites
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function to update template usage count
CREATE OR REPLACE FUNCTION update_template_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE templates 
        SET usage_count = usage_count + 1,
            updated_at = NOW()
        WHERE id = NEW.template_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update usage count
CREATE TRIGGER trigger_update_template_usage_count
    AFTER INSERT ON template_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_template_usage_count();

-- Function to update template rating average
CREATE OR REPLACE FUNCTION update_template_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        UPDATE templates 
        SET 
            rating_average = (
                SELECT COALESCE(AVG(rating), 0)
                FROM template_ratings 
                WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
            ),
            rating_count = (
                SELECT COUNT(*)
                FROM template_ratings 
                WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
            ),
            updated_at = NOW()
        WHERE id = COALESCE(NEW.template_id, OLD.template_id);
        
        RETURN COALESCE(NEW, OLD);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update rating stats
CREATE TRIGGER trigger_update_template_rating_stats
    AFTER INSERT OR UPDATE OR DELETE ON template_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_template_rating_stats();

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE template_tags 
        SET usage_count = usage_count + 1,
            updated_at = NOW()
        WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE template_tags 
        SET usage_count = GREATEST(usage_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update tag usage count
CREATE TRIGGER trigger_update_tag_usage_count
    AFTER INSERT OR DELETE ON template_tags_junction
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_usage_count();

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

-- Insert default categories
INSERT INTO template_categories (name, description, icon, color, sort_order) VALUES
('All Templates', 'Browse all available templates', 'Grid', 'bg-gray-500', 0),
('Marketing & Sales', 'Email campaigns, social media, advertising', 'TrendingUp', 'bg-red-500', 1),
('Development', 'Code documentation, API specs, technical writing', 'Zap', 'bg-blue-500', 2),
('Content Creation', 'Blog posts, articles, newsletters, copywriting', 'BookOpen', 'bg-green-500', 3),
('Analytics & Research', 'Data analysis, market research, insights', 'BarChart3', 'bg-purple-500', 4),
('Customer Support', 'Customer service, help documentation', 'Users', 'bg-orange-500', 5),
('Business & Strategy', 'Business plans, strategy, planning', 'Crown', 'bg-indigo-500', 6),
('Education', 'Lesson plans, training materials, academic', 'GraduationCap', 'bg-teal-500', 7),
('Creative', 'Creative writing, storytelling, design', 'Palette', 'bg-pink-500', 8)
ON CONFLICT (name) DO NOTHING;

-- Insert popular tags
INSERT INTO template_tags (name, description, category) VALUES
-- Business & Industry
('SMEs', 'Small and Medium Enterprises', 'business'),
('startups', 'Startup companies and entrepreneurs', 'business'),
('enterprise', 'Large enterprise organizations', 'business'),
('B2B', 'Business-to-Business', 'business'),
('B2C', 'Business-to-Consumer', 'business'),
('e-commerce', 'E-commerce and online retail', 'business'),
('SaaS', 'Software as a Service', 'business'),
('fintech', 'Financial technology', 'business'),
('healthcare', 'Healthcare industry', 'business'),
('education', 'Education sector', 'business'),

-- Marketing & Sales
('email-marketing', 'Email marketing campaigns', 'marketing'),
('social-media', 'Social media content', 'marketing'),
('content-marketing', 'Content marketing strategies', 'marketing'),
('SEO', 'Search Engine Optimization', 'marketing'),
('PPC', 'Pay-Per-Click advertising', 'marketing'),
('influencer-marketing', 'Influencer marketing', 'marketing'),
('branding', 'Brand development and management', 'marketing'),
('lead-generation', 'Lead generation strategies', 'marketing'),

-- Development & Tech
('javascript', 'JavaScript development', 'development'),
('python', 'Python development', 'development'),
('react', 'React framework', 'development'),
('nodejs', 'Node.js development', 'development'),
('api', 'API development and documentation', 'development'),
('documentation', 'Technical documentation', 'development'),
('code-review', 'Code review processes', 'development'),
('testing', 'Software testing', 'development'),
('deployment', 'Deployment and DevOps', 'development'),
('devops', 'DevOps practices', 'development'),

-- Content Types
('blog-posts', 'Blog post creation', 'content'),
('newsletters', 'Newsletter content', 'content'),
('whitepapers', 'Whitepaper creation', 'content'),
('case-studies', 'Case study development', 'content'),
('tutorials', 'Tutorial creation', 'content'),
('guides', 'How-to guides', 'content'),
('reports', 'Report writing', 'content'),
('presentations', 'Presentation creation', 'content'),

-- Target Audiences
('developers', 'Developer audience', 'audience'),
('marketers', 'Marketing professionals', 'audience'),
('managers', 'Management and executives', 'audience'),
('executives', 'C-level executives', 'audience'),
('customers', 'Customer-facing content', 'audience'),
('partners', 'Partner communications', 'audience'),
('investors', 'Investor relations', 'audience'),
('employees', 'Internal communications', 'audience'),

-- Use Cases
('onboarding', 'User onboarding processes', 'use-case'),
('product-launch', 'Product launch campaigns', 'use-case'),
('customer-support', 'Customer support responses', 'use-case'),
('sales-pitch', 'Sales presentations', 'use-case'),
('project-management', 'Project management', 'use-case'),
('strategy', 'Strategic planning', 'use-case'),
('analysis', 'Data analysis and insights', 'use-case'),

-- Formats
('email', 'Email format', 'format'),
('social-post', 'Social media post', 'format'),
('documentation', 'Documentation format', 'format'),
('presentation', 'Presentation format', 'format'),
('report', 'Report format', 'format'),
('proposal', 'Proposal format', 'format'),
('plan', 'Planning document', 'format')
ON CONFLICT (name) DO NOTHING; 