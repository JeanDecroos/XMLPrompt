# MCP RPC Functions Setup Guide

## 🎯 Enable Direct SQL Execution via MCP

This guide will enable your MCP (Model Context Protocol) to execute SQL directly through Supabase, giving your AI assistant full database management capabilities.

---

## 📋 **Step 1: Create RPC Functions**

### Execute in Supabase SQL Editor:

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy the entire contents** of `database-rpc-functions.sql`
3. **Paste and RUN** to create all RPC functions

**Expected Result**: 7 RPC functions created with proper security and permissions

---

## 🧪 **Step 2: Test RPC Functions**

Run the test script to verify everything works:

```bash
npm run test-rpc-functions
```

**Expected Output**: All 6 tests should pass, demonstrating MCP SQL capabilities

---

## 🚀 **Step 3: Use MCP for Database Operations**

Now your MCP can execute SQL directly! Here are the available functions:

### 🔧 **Core RPC Functions**

| Function | Purpose | Usage |
|----------|---------|-------|
| `exec_sql` | Execute any SQL statement | DDL, DML operations |
| `exec_query` | Execute SELECT queries safely | Data retrieval |
| `exec_migration` | Run tracked migrations | Schema changes |

### 📊 **Analysis Functions**

| Function | Purpose | Returns |
|----------|---------|---------|
| `get_database_stats` | Comprehensive DB stats | Table stats, index usage, sizes |
| `analyze_query_performance` | Query performance analysis | Execution plans, timing |

### 🛠️ **Utility Functions**

| Function | Purpose | Benefits |
|----------|---------|----------|
| `create_index_safe` | Create indexes safely | Prevents duplicates, handles errors |
| `cleanup_old_data` | Remove old records | Automated maintenance |

---

## 💡 **MCP Usage Examples**

### Create Database Indexes
```javascript
// Via MCP, your AI can now do this automatically:
await supabase.rpc('exec_sql', {
  sql_query: 'CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags)'
})
```

### Analyze Query Performance
```javascript
// MCP can analyze and optimize queries in real-time:
await supabase.rpc('analyze_query_performance', {
  query_text: 'SELECT * FROM prompts WHERE tags @> ["productivity"]'
})
```

### Execute Database Improvements
```javascript
// MCP can now apply the database improvements automatically:
await supabase.rpc('exec_migration', {
  migration_name: 'performance_indexes_phase1',
  sql_query: 'CREATE INDEX IF NOT EXISTS idx_prompts_user_created ON prompts(user_id, created_at DESC)'
})
```

### Monitor Database Health
```javascript
// MCP can monitor your database automatically:
const stats = await supabase.rpc('get_database_stats')
// Returns comprehensive table stats, index usage, and sizes
```

---

## 🔒 **Security Features**

### ✅ **Built-in Security**
- **Authentication Required**: All functions require authenticated users
- **SQL Injection Protection**: Parameterized queries and validation
- **Audit Trail**: All migrations are logged with user tracking
- **Error Handling**: Comprehensive error reporting and rollback

### ✅ **Function-Specific Security**
- `exec_query`: Only allows SELECT statements
- `exec_migration`: Prevents duplicate migrations
- `create_index_safe`: Checks for existing indexes
- `cleanup_old_data`: Validates table and column names

---

## 🎯 **Immediate Benefits**

### 🚀 **For Your AI Assistant**
- **Direct Database Management**: Create indexes, run migrations, analyze performance
- **Real-time Monitoring**: Monitor database health and performance automatically
- **Automated Optimization**: Apply performance improvements without manual intervention
- **Intelligent Analysis**: Analyze query performance and suggest optimizations

### 🚀 **For You**
- **Hands-free Database Management**: AI handles routine database tasks
- **Proactive Optimization**: AI can optimize performance before issues arise
- **Intelligent Monitoring**: AI alerts you to potential problems
- **Continuous Improvement**: AI learns and improves database performance over time

---

## 📊 **Now Execute Database Improvements via MCP**

With RPC functions enabled, let's apply the database improvements automatically:

```bash
# Test that RPC functions work
npm run test-rpc-functions

# If tests pass, MCP can now execute the improvements directly!
```

---

## 🔧 **MCP Integration Commands**

Your AI assistant can now use these commands directly:

### Create Essential Indexes
```sql
-- MCP can execute this automatically:
SELECT exec_sql('CREATE INDEX IF NOT EXISTS idx_prompts_tags_gin ON prompts USING GIN(tags)');
```

### Monitor Performance
```sql
-- MCP can monitor automatically:
SELECT get_database_stats();
SELECT analyze_query_performance('SELECT * FROM prompts WHERE tags @> ''["productivity"]''');
```

### Apply Migrations
```sql
-- MCP can run migrations automatically:
SELECT exec_migration('performance_indexes_v1', 'CREATE INDEX IF NOT EXISTS idx_prompts_user_created ON prompts(user_id, created_at DESC)');
```

---

## 🎉 **What This Enables**

### **Before RPC Functions:**
- ❌ Manual SQL execution in Supabase dashboard
- ❌ No automated database management
- ❌ Limited AI database interaction
- ❌ Manual performance monitoring

### **After RPC Functions:**
- ✅ **AI executes SQL directly through MCP**
- ✅ **Automated database optimization**
- ✅ **Real-time performance monitoring**
- ✅ **Intelligent database management**
- ✅ **Proactive issue detection**
- ✅ **Continuous performance improvement**

---

## 🚨 **Troubleshooting**

### If RPC Functions Fail to Create:
1. **Check Permissions**: Ensure you're using service role key
2. **Verify Authentication**: Confirm user authentication is working
3. **Review Logs**: Check Supabase logs for detailed error messages

### If Tests Fail:
1. **Verify RPC Creation**: Ensure all functions were created successfully
2. **Check Environment**: Verify environment variables are set correctly
3. **Test Authentication**: Confirm Supabase client authentication

### If MCP Can't Execute SQL:
1. **Restart Cursor**: Restart Cursor to refresh MCP connection
2. **Check MCP Config**: Verify MCP server configuration
3. **Test Manual RPC**: Test RPC functions manually in Supabase dashboard

---

## 🎯 **Next Steps**

1. **✅ Execute `database-rpc-functions.sql`** in Supabase SQL Editor
2. **✅ Run `npm run test-rpc-functions`** to verify functionality
3. **✅ Use MCP to apply database improvements automatically**
4. **✅ Enjoy AI-powered database management!**

---

**🚀 Your AI assistant can now manage your database directly through MCP!**

*This enables unprecedented automation and intelligence in database management, making your XMLPrompter application truly enterprise-ready.* 