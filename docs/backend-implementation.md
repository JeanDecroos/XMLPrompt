# Promptr Backend Implementation Guide

## 🎯 **Overview**

This document provides a comprehensive guide to the Promptr production-ready backend implementation. The backend is built with Node.js, Express, and Supabase, featuring enterprise-grade architecture with comprehensive API endpoints, authentication, caching, job queues, and monitoring.

## 📋 **Table of Contents**

1. [Architecture Overview](#architecture-overview)
2. [Installation & Setup](#installation--setup)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Authentication & Authorization](#authentication--authorization)
6. [Caching & Performance](#caching--performance)
7. [Background Jobs](#background-jobs)
8. [Monitoring & Logging](#monitoring--logging)
9. [Deployment](#deployment)
10. [Development Workflow](#development-workflow)

---

## 🏗️ **Architecture Overview**

### **Technology Stack**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Caching**: Redis
- **Authentication**: Supabase Auth + JWT
- **Job Queue**: Bull (Redis-based)
- **Logging**: Winston
- **Validation**: Joi
- **Testing**: Jest
- **Documentation**: Swagger/OpenAPI

### **Core Components**

```
backend/
├── src/
│   ├── config/           # Configuration management
│   ├── middleware/       # Express middleware
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic services
│   ├── models/          # Data models
│   ├── jobs/            # Background job definitions
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── scripts/             # Deployment & maintenance scripts
├── docs/               # API documentation
└── tests/              # Test suites
```

### **Key Features**
- ✅ **RESTful API** with comprehensive endpoints
- ✅ **Authentication & Authorization** with role-based access
- ✅ **Rate Limiting** with Redis-backed tracking
- ✅ **Caching** for performance optimization
- ✅ **Background Jobs** for async processing
- ✅ **Comprehensive Logging** with structured output
- ✅ **Error Handling** with proper HTTP status codes
- ✅ **Input Validation** with detailed error messages
- ✅ **Database Migrations** and schema management
- ✅ **Health Checks** and monitoring endpoints
- ✅ **API Documentation** with Swagger UI

---

## 🚀 **Installation & Setup**

### **Prerequisites**
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Redis server
- Supabase account and project

### **Step 1: Environment Setup**

1. **Clone and Navigate**:
   ```bash
   cd backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

### **Step 2: Supabase Setup**

1. **Create New Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project: `promptr-production`
   - Note your project URL and keys

2. **Run Database Schema**:
   ```bash
   # Copy the database-schema-v2.sql content to Supabase SQL Editor
   # Execute the schema to create all tables, functions, and policies
   ```

3. **Configure Environment**:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### **Step 3: Redis Setup**

1. **Local Redis** (Development):
   ```bash
   # macOS
   brew install redis
   brew services start redis
   
   # Ubuntu
   sudo apt install redis-server
   sudo systemctl start redis
   ```

2. **Cloud Redis** (Production):
   - Use Redis Cloud, AWS ElastiCache, or similar
   - Update `REDIS_URL` in environment

### **Step 4: AI Services Setup**

1. **OpenAI API** (Required):
   ```env
   OPENAI_API_KEY=sk-your-openai-key
   ```

2. **Anthropic API** (Optional):
   ```env
   ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
   ```

3. **Google AI API** (Optional):
   ```env
   GOOGLE_AI_API_KEY=your-google-ai-key
   ```

### **Step 5: Start Development Server**

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Run tests
npm test

# Check health
curl http://localhost:3001/health
```

---

## 🗄️ **Database Schema**

### **Core Tables**

#### **Users & Profiles**
```sql
-- Enhanced user profiles with subscription management
profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'inactive',
  api_calls_remaining INTEGER DEFAULT 1000,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

#### **Prompts Management**
```sql
-- Comprehensive prompt storage with versioning
prompts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  role TEXT,
  task TEXT NOT NULL,
  context TEXT,
  requirements TEXT,
  style TEXT,
  output TEXT,
  raw_prompt TEXT,
  enriched_prompt TEXT,
  selected_model TEXT DEFAULT 'claude-3-5-sonnet',
  quality_score DECIMAL(3,2),
  is_public BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

#### **Sharing & Collaboration**
```sql
-- Secure prompt sharing with access controls
shared_prompts (
  id UUID PRIMARY KEY,
  prompt_id UUID REFERENCES prompts(id),
  share_token TEXT UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT FALSE,
  password_hash TEXT,
  max_views INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0
)
```

#### **Analytics & Tracking**
```sql
-- Comprehensive usage analytics
usage_tracking (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  resource_type TEXT,
  tokens_used INTEGER DEFAULT 0,
  processing_time_ms INTEGER,
  model_used TEXT,
  success BOOLEAN DEFAULT TRUE,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### **Key Features**
- **Row Level Security (RLS)** on all tables
- **Automatic triggers** for updated_at timestamps
- **Comprehensive indexes** for performance
- **Data validation** with check constraints
- **Audit trails** for sensitive operations

---

## 🔌 **API Endpoints**

### **Authentication Endpoints**
```
POST   /api/v1/auth/register        # User registration
POST   /api/v1/auth/login           # User login
POST   /api/v1/auth/refresh         # Refresh tokens
POST   /api/v1/auth/logout          # User logout
POST   /api/v1/auth/forgot-password # Password reset request
POST   /api/v1/auth/reset-password  # Password reset confirmation
```

### **Prompt Management**
```
GET    /api/v1/prompts              # List user prompts
POST   /api/v1/prompts              # Create new prompt
GET    /api/v1/prompts/:id          # Get specific prompt
PUT    /api/v1/prompts/:id          # Update prompt
DELETE /api/v1/prompts/:id          # Delete prompt
GET    /api/v1/prompts/public       # Browse public prompts
GET    /api/v1/prompts/categories   # Get prompt categories
```

### **Prompt Enhancement**
```
POST   /api/v1/enrichment/enhance   # Enhance prompt with AI
GET    /api/v1/enrichment/models    # List available AI models
POST   /api/v1/enrichment/validate  # Validate prompt quality
GET    /api/v1/enrichment/suggestions # Get improvement suggestions
```

### **Sharing & Collaboration**
```
POST   /api/v1/sharing/create       # Create shareable link
GET    /api/v1/sharing/:token       # Access shared prompt
PUT    /api/v1/sharing/:token       # Update sharing settings
DELETE /api/v1/sharing/:token       # Revoke sharing access
GET    /api/v1/sharing/my-shares    # List user's shared prompts
```

### **User Management**
```
GET    /api/v1/users/profile        # Get user profile
PUT    /api/v1/users/profile        # Update user profile
GET    /api/v1/users/stats          # Get user statistics
POST   /api/v1/users/export-data    # Export user data (GDPR)
DELETE /api/v1/users/delete-account # Delete user account
```

### **API Key Management**
```
GET    /api/v1/api-keys             # List user API keys
POST   /api/v1/api-keys             # Create new API key
PUT    /api/v1/api-keys/:id         # Update API key
DELETE /api/v1/api-keys/:id         # Delete API key
POST   /api/v1/api-keys/:id/rotate  # Rotate API key
```

### **Analytics & Reporting**
```
GET    /api/v1/analytics/usage      # Usage analytics
GET    /api/v1/analytics/prompts    # Prompt analytics
GET    /api/v1/analytics/models     # Model usage statistics
GET    /api/v1/analytics/trends     # Usage trends
```

### **Admin Endpoints**
```
GET    /api/v1/admin/users          # List all users
GET    /api/v1/admin/prompts        # Moderate prompts
PUT    /api/v1/admin/prompts/:id    # Update prompt status
GET    /api/v1/admin/analytics      # System analytics
POST   /api/v1/admin/broadcast      # Send notifications
```

### **System Endpoints**
```
GET    /health                      # Health check
GET    /api/v1/system/status        # System status
GET    /api/v1/system/features      # Feature flags
GET    /api-docs                    # API documentation (dev only)
```

---

## 🔐 **Authentication & Authorization**

### **Authentication Flow**

1. **User Registration/Login**:
   ```javascript
   // Registration
   POST /api/v1/auth/register
   {
     "email": "user@example.com",
     "password": "securePassword123",
     "fullName": "John Doe"
   }
   
   // Response
   {
     "user": { "id": "...", "email": "...", "fullName": "..." },
     "accessToken": "eyJ...",
     "refreshToken": "eyJ...",
     "expiresIn": 86400
   }
   ```

2. **API Authentication**:
   ```javascript
   // Using JWT token
   headers: {
     "Authorization": "Bearer eyJ..."
   }
   
   // Using API key
   headers: {
     "X-API-Key": "xmlp_..."
   }
   ```

### **Authorization Levels**

1. **Public** - No authentication required
2. **User** - Requires valid user authentication
3. **Pro** - Requires Pro subscription
4. **Admin** - Requires admin privileges

### **Rate Limiting**

```javascript
// Global rate limits
const rateLimits = {
  free: {
    requests: 100,      // per 15 minutes
    prompts: 100,       // per month
    enrichments: 20     // per month
  },
  pro: {
    requests: 1000,     // per 15 minutes
    prompts: 1000,      // per month
    enrichments: 500    // per month
  }
}
```

---

## ⚡ **Caching & Performance**

### **Redis Caching Strategy**

1. **User Data Caching**:
   ```javascript
   // Cache user profiles for 1 hour
   key: `user:profile:${userId}`
   ttl: 3600
   ```

2. **Prompt Caching**:
   ```javascript
   // Cache public prompts for 15 minutes
   key: `prompts:public:page:${page}`
   ttl: 900
   ```

3. **AI Model Responses**:
   ```javascript
   // Cache enhancement results for 24 hours
   key: `enhancement:${promptHash}`
   ttl: 86400
   ```

### **Cache Invalidation**

```javascript
// Tagged cache invalidation
await cache.invalidateByTag(`user:${userId}`)
await cache.invalidateByTag(`prompts:public`)
```

### **Performance Optimizations**

- **Database Connection Pooling**
- **Response Compression**
- **Static Asset Caching**
- **Query Optimization**
- **Background Processing**

---

## 🔄 **Background Jobs**

### **Job Types**

1. **Email Jobs**:
   - Welcome emails
   - Password reset emails
   - Notification emails

2. **Analytics Jobs**:
   - Usage aggregation
   - Trend calculation
   - Report generation

3. **Cleanup Jobs**:
   - Expired data removal
   - Cache cleanup
   - Log rotation

### **Job Configuration**

```javascript
// Example job definition
export const emailJob = {
  name: 'send-email',
  concurrency: 5,
  attempts: 3,
  backoff: 'exponential',
  delay: 0
}
```

### **Job Monitoring**

```bash
# View job queue status
GET /api/v1/admin/jobs

# Retry failed jobs
POST /api/v1/admin/jobs/retry

# Clear completed jobs
DELETE /api/v1/admin/jobs/completed
```

---

## 📊 **Monitoring & Logging**

### **Logging Levels**

- **Error**: System errors and exceptions
- **Warn**: Warning conditions
- **Info**: General information
- **Debug**: Detailed debugging information

### **Log Formats**

```javascript
// Development (console)
2024-01-15 10:30:45 [INFO]: HTTP Request {
  "method": "POST",
  "url": "/api/v1/prompts",
  "statusCode": 201,
  "responseTime": "45ms",
  "userId": "user123"
}

// Production (JSON)
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "message": "HTTP Request",
  "method": "POST",
  "url": "/api/v1/prompts",
  "statusCode": 201,
  "responseTime": "45ms",
  "userId": "user123",
  "requestId": "req_abc123"
}
```

### **Health Monitoring**

```javascript
// Health check endpoint response
GET /health
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "uptime": 86400,
  "services": {
    "database": { "status": "healthy", "responseTime": 12 },
    "redis": { "status": "healthy", "responseTime": 3 },
    "external_apis": { "status": "healthy" }
  },
  "metrics": {
    "memoryUsage": "45%",
    "cpuUsage": "12%",
    "activeConnections": 23
  }
}
```

---

## 🚀 **Deployment**

### **Environment Setup**

1. **Production Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=3001
   SUPABASE_URL=https://your-prod-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-prod-service-key
   REDIS_URL=redis://your-redis-instance:6379
   OPENAI_API_KEY=sk-your-production-key
   ```

2. **Build and Deploy**:
   ```bash
   # Build application
   npm run build
   
   # Start production server
   npm start
   
   # Or use PM2 for process management
   pm2 start ecosystem.config.js
   ```

### **Docker Deployment**

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    depends_on:
      - redis
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### **Production Checklist**

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Redis instance running
- [ ] SSL certificates installed
- [ ] Monitoring tools configured
- [ ] Backup strategies implemented
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Log aggregation setup

---

## 🔧 **Development Workflow**

### **Local Development**

1. **Start Services**:
   ```bash
   # Start Redis
   redis-server
   
   # Start backend in development mode
   npm run dev
   ```

2. **Run Tests**:
   ```bash
   # Run all tests
   npm test
   
   # Run tests in watch mode
   npm run test:watch
   
   # Run tests with coverage
   npm run test:coverage
   ```

3. **Code Quality**:
   ```bash
   # Lint code
   npm run lint
   
   # Fix linting issues
   npm run lint:fix
   
   # Format code
   npm run format
   ```

### **API Testing**

```bash
# Health check
curl http://localhost:3001/health

# Create user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User"}'

# Create prompt
curl -X POST http://localhost:3001/api/v1/prompts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Prompt","task":"Generate a creative story"}'
```

### **Database Operations**

```bash
# Run migrations
npm run migrate

# Seed test data
npm run seed

# Reset database (development only)
npm run db:reset
```

---

## 📚 **Additional Resources**

### **API Documentation**
- **Swagger UI**: `http://localhost:3001/api-docs` (development)
- **Postman Collection**: Available in `/docs/postman/`

### **Database Documentation**
- **Schema Diagram**: See `/docs/database-schema.png`
- **Migration Guide**: See `/docs/migrations.md`

### **Security Documentation**
- **Security Policies**: See `/docs/security.md`
- **Rate Limiting**: See `/docs/rate-limiting.md`

### **Monitoring & Alerting**
- **Metrics Dashboard**: Configure with your monitoring solution
- **Alert Rules**: See `/docs/alerting.md`

---

## 🎉 **Conclusion**

This backend implementation provides a robust, scalable foundation for the Promptr application. It includes:

- **Enterprise-grade architecture** with proper separation of concerns
- **Comprehensive API** covering all application features
- **Security best practices** with authentication and authorization
- **Performance optimization** through caching and background processing
- **Monitoring and observability** for production operations
- **Developer-friendly** setup and documentation

The backend is designed to scale from development to production, supporting thousands of users and millions of prompts while maintaining high performance and reliability.

For questions or support, refer to the documentation or contact the development team. 