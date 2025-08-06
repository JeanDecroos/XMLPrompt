/**
 * Template Migration Script
 * Migrates existing template data from frontend to database
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)
import { templates as frontendTemplates, templateCategories as frontendCategories, templateTags as frontendTags } from '../src/data/templates.js'

async function migrateTemplatesToDatabase() {
  console.log('🚀 Starting template migration to database...')
  
  try {
    // Step 1: Migrate categories
    console.log('\n1. Migrating categories...')
    const categoryMap = new Map()
    
    for (const category of frontendCategories) {
      const { data: existingCategory, error: fetchError } = await supabase
        .from('template_categories')
        .select('id')
        .eq('name', category.name)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error(`Error checking category ${category.name}:`, fetchError)
        continue
      }
      
      if (existingCategory) {
        categoryMap.set(category.name, existingCategory.id)
        console.log(`✅ Category "${category.name}" already exists`)
        continue
      }
      
      const { data: newCategory, error: insertError } = await supabase
        .from('template_categories')
        .insert({
          name: category.name,
          description: category.description,
          icon: category.icon,
          color: category.color,
          sort_order: category.sort_order || 0
        })
        .select('id')
        .single()
      
      if (insertError) {
        console.error(`❌ Failed to create category "${category.name}":`, insertError)
        continue
      }
      
      categoryMap.set(category.name, newCategory.id)
      console.log(`✅ Created category "${category.name}" with ID ${newCategory.id}`)
    }
    
    // Step 2: Migrate tags
    console.log('\n2. Migrating tags...')
    const tagMap = new Map()
    
    for (const tag of frontendTags) {
      const { data: existingTag, error: fetchError } = await supabase
        .from('template_tags')
        .select('id')
        .eq('name', tag)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error(`Error checking tag ${tag}:`, fetchError)
        continue
      }
      
      if (existingTag) {
        tagMap.set(tag, existingTag.id)
        console.log(`✅ Tag "${tag}" already exists`)
        continue
      }
      
      // Determine category based on tag name
      let category = 'general'
      if (['SMEs', 'startups', 'enterprise', 'B2B', 'B2C', 'e-commerce', 'SaaS', 'fintech', 'healthcare', 'education'].includes(tag)) {
        category = 'business'
      } else if (['email-marketing', 'social-media', 'content-marketing', 'SEO', 'PPC', 'influencer-marketing', 'branding', 'lead-generation'].includes(tag)) {
        category = 'marketing'
      } else if (['javascript', 'python', 'react', 'nodejs', 'api', 'documentation', 'code-review', 'testing', 'deployment', 'devops'].includes(tag)) {
        category = 'development'
      } else if (['blog-posts', 'newsletters', 'whitepapers', 'case-studies', 'tutorials', 'guides', 'reports', 'presentations'].includes(tag)) {
        category = 'content'
      } else if (['developers', 'marketers', 'managers', 'executives', 'customers', 'partners', 'investors', 'employees'].includes(tag)) {
        category = 'audience'
      } else if (['onboarding', 'product-launch', 'customer-support', 'sales-pitch', 'project-management', 'strategy', 'analysis'].includes(tag)) {
        category = 'use-case'
      } else if (['email', 'social-post', 'documentation', 'presentation', 'report', 'proposal', 'plan'].includes(tag)) {
        category = 'format'
      }
      
      const { data: newTag, error: insertError } = await supabase
        .from('template_tags')
        .insert({
          name: tag,
          description: `${tag} related templates`,
          category: category
        })
        .select('id')
        .single()
      
      if (insertError) {
        console.error(`❌ Failed to create tag "${tag}":`, insertError)
        continue
      }
      
      tagMap.set(tag, newTag.id)
      console.log(`✅ Created tag "${tag}" with ID ${newTag.id}`)
    }
    
    // Step 3: Migrate templates
    console.log('\n3. Migrating templates...')
    
    for (const template of frontendTemplates) {
      // Check if template already exists
      const { data: existingTemplate, error: fetchError } = await supabase
        .from('templates')
        .select('id')
        .eq('title', template.title)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error(`Error checking template ${template.title}:`, fetchError)
        continue
      }
      
      if (existingTemplate) {
        console.log(`✅ Template "${template.title}" already exists`)
        continue
      }
      
      // Get category ID
      const categoryId = categoryMap.get(template.category)
      if (!categoryId) {
        console.error(`❌ Category "${template.category}" not found for template "${template.title}"`)
        continue
      }
      
      // Create template
      const { data: newTemplate, error: insertError } = await supabase
        .from('templates')
        .insert({
          title: template.title,
          description: template.description,
          category_id: categoryId,
          template_data: template.template,
          preview_text: template.preview,
          tier: template.tier,
          author_name: template.author,
          status: 'active',
          is_system_template: true,
          usage_count: template.usage,
          rating_average: template.rating,
          rating_count: Math.floor(template.usage * 0.1), // Estimate rating count
          view_count: template.usage * 2, // Estimate view count
          copy_count: template.usage * 0.3, // Estimate copy count
          published_at: new Date(template.lastUpdated).toISOString()
        })
        .select('id')
        .single()
      
      if (insertError) {
        console.error(`❌ Failed to create template "${template.title}":`, insertError)
        continue
      }
      
      console.log(`✅ Created template "${template.title}" with ID ${newTemplate.id}`)
      
      // Add tags to template
      if (template.tags && template.tags.length > 0) {
        const tagInserts = template.tags
          .map(tagName => {
            const tagId = tagMap.get(tagName)
            return tagId ? { template_id: newTemplate.id, tag_id: tagId } : null
          })
          .filter(Boolean)
        
        if (tagInserts.length > 0) {
          const { error: tagError } = await supabase
            .from('template_tags_junction')
            .insert(tagInserts)
          
          if (tagError) {
            console.error(`⚠️ Failed to add tags to template "${template.title}":`, tagError)
          } else {
            console.log(`✅ Added ${tagInserts.length} tags to template "${template.title}"`)
          }
        }
      }
    }
    
    console.log('\n🎉 Template migration completed successfully!')
    
    // Step 4: Verify migration
    console.log('\n4. Verifying migration...')
    
    const { data: templateCount, error: countError } = await supabase
      .from('templates')
      .select('id', { count: 'exact' })
    
    if (countError) {
      console.error('❌ Error counting templates:', countError)
    } else {
      console.log(`✅ Database now contains ${templateCount.length} templates`)
    }
    
    const { data: categoryCount, error: categoryCountError } = await supabase
      .from('template_categories')
      .select('id', { count: 'exact' })
    
    if (categoryCountError) {
      console.error('❌ Error counting categories:', categoryCountError)
    } else {
      console.log(`✅ Database now contains ${categoryCount.length} categories`)
    }
    
    const { data: tagCount, error: tagCountError } = await supabase
      .from('template_tags')
      .select('id', { count: 'exact' })
    
    if (tagCountError) {
      console.error('❌ Error counting tags:', tagCountError)
    } else {
      console.log(`✅ Database now contains ${tagCount.length} tags`)
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateTemplatesToDatabase()
}

export { migrateTemplatesToDatabase } 