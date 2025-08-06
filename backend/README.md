# Promptr Backend API

> **Production-ready backend for Promptr** - A comprehensive Node.js API server with enterprise-grade features for prompt engineering and AI integration.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-blue.svg)](https://supabase.com/)
[![Redis](https://img.shields.io/badge/Redis-7+-red.svg)](https://redis.io/)

## 🚀 **Quick Start**

```bash
# 1. Navigate to backend directory
cd backend

# 2. Run automated setup
./scripts/setup.sh

# 3. Configure environment (edit .env file)
# Add your Supabase credentials, OpenAI API key, etc.

# 4. Start development server
npm run dev

# 5. Visit API documentation
open http://localhost:3001/api-docs
```

## 📋 **Features**

### **Core Functionality**
- ✅ **RESTful API** with 50+ endpoints
- ✅ **Authentication & Authorization** (JWT + API keys)
- ✅ **Prompt Management** (CRUD, versioning, categories)
- ✅ **AI Integration** (OpenAI, Anthropic, Google AI)
- ✅ **Prompt Enhancement** with multiple AI models
- ✅ **Sharing & Collaboration** (secure links, access controls)
- ✅ **User Management** (profiles, subscriptions, preferences)

### **Enterprise Features**
- ✅ **Rate Limiting** (Redis-backed, per-user limits)
- ✅ **Caching** (Redis with smart invalidation)
- ✅ **Background Jobs** (email, analytics, cleanup)
- ✅ **Comprehensive Logging** (Winston with rotation)
- ✅ **Error Handling** (structured errors, proper HTTP codes)
- ✅ **Input Validation** (Joi schemas with detailed messages)
- ✅ **Health Monitoring** (system status, metrics)
- ✅ **API Documentation** (Swagger/OpenAPI)

### **Security & Performance**
- ✅ **Row Level Security** (RLS) on all database tables
- ✅ **SQL Injection Protection** via Supabase
- ✅ **Request Sanitization** and validation
- ✅ **CORS Configuration** with origin whitelisting
- ✅ **Helmet.js** security headers
- ✅ **Response Compression** for better performance
- ✅ **Connection Pooling** for database efficiency

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Express.js)  │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │  (Cache & Jobs) │
                       └─────────────────┘
```

### **Technology Stack**
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Database**: Supabase (PostgreSQL)
- **Caching**: Redis 7+
- **Authentication**: Supabase Auth + JWT
- **Job Queue**: Bull (Redis-based)
- **Logging**: Winston with daily rotation
- **Validation**: Joi schemas
- **Testing**: Jest with Supertest
- **Documentation**: Swagger/OpenAPI

## 📁 **Project Structure**

```
backend/
├── src/
│   ├── config/           # Configuration management
│   │   ├── index.js      # Main config with validation
│   │   ├── database.js   # Supabase connection
│   │   └── redis.js      # Redis connection & caching
│   ├── middleware/       # Express middleware
│   │   ├── auth.js       # Authentication middleware
│   │   ├── errorHandler.js # Error handling
│   │   ├── rateLimit.js  # Rate limiting
│   │   └── analytics.js  # Usage tracking
│   ├── routes/           # API route handlers
│   │   ├── auth.js       # Authentication endpoints
│   │   ├── prompts.js    # Prompt management
│   │   ├── enrichment.js # AI enhancement
│   │   ├── sharing.js    # Prompt sharing
│   │   ├── users.js      # User management
│   │   ├── analytics.js  # Analytics & reporting
│   │   └── admin.js      # Admin endpoints
│   ├── services/         # Business logic services
│   │   ├── aiService.js  # AI provider integrations
│   │   ├── emailService.js # Email notifications
│   │   └── analyticsService.js # Analytics processing
│   ├── jobs/             # Background job definitions
│   │   ├── emailJobs.js  # Email sending jobs
│   │   ├── analyticsJobs.js # Data processing jobs
│   │   └── cleanupJobs.js # Maintenance jobs
│   ├── utils/            # Utility functions
│   │   ├── logger.js     # Logging utility
│   │   ├── validation.js # Input validation schemas
│   │   └── helpers.js    # Common helper functions
│   └── server.js         # Main server file
├── scripts/              # Deployment & maintenance scripts
│   ├── setup.sh          # Automated setup script
│   ├── migrate.js        # Database migrations
│   └── health-check.js   # Health monitoring
├── docs/                 # Documentation
│   ├── api/              # API documentation
│   └── deployment/       # Deployment guides
├── tests/                # Test suites
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── fixtures/         # Test data
├── package.json          # Dependencies & scripts
├── env.example           # Environment template
└── README.md             # This file
```

## 🔧 **Environment Configuration**

### **Required Variables**
```env
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=localhost

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services (OpenAI required, others optional)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GOOGLE_AI_API_KEY=your-google-ai-key

# Security
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
API_KEY_SECRET=your-api-key-encryption-secret

# Redis (for caching and jobs)
REDIS_URL=redis://localhost:6379
```

### **Optional Variables**
```env
# Payment Processing
STRIPE_SECRET_KEY=sk_test_your-stripe-key

# Email Services
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring
SENTRY_DSN=your-sentry-dsn

# Feature Flags
FEATURE_PROMPT_ENRICHMENT=true
FEATURE_PROMPT_SHARING=true
FEATURE_PUBLIC_GALLERY=true
```

## 🗄️ **Database Setup**

### **1. Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Create new project: `promptr-production`
3. Note your project URL and keys

### **2. Run Database Schema**
1. Copy content from `database-schema-v2.sql`
2. Paste into Supabase SQL Editor
3. Execute to create all tables, functions, and policies

### **3. Verify Setup**
```bash
# Test database connection
curl http://localhost:3001/health
```

## 📡 **API Endpoints**

### **Authentication**
```
POST   /api/v1/auth/register        # User registration
POST   /api/v1/auth/login           # User login
POST   /api/v1/auth/refresh         # Refresh tokens
POST   /api/v1/auth/logout          # User logout
```

### **Prompt Management**
```
GET    /api/v1/prompts              # List user prompts
POST   /api/v1/prompts              # Create new prompt
GET    /api/v1/prompts/:id          # Get specific prompt
PUT    /api/v1/prompts/:id          # Update prompt
DELETE /api/v1/prompts/:id          # Delete prompt
GET    /api/v1/prompts/public       # Browse public prompts
```

### **AI Enhancement**
```
POST   /api/v1/enrichment/enhance   # Enhance prompt with AI
GET    /api/v1/enrichment/models    # List available models
POST   /api/v1/enrichment/validate  # Validate prompt quality
```

### **Sharing & Collaboration**
```
POST   /api/v1/sharing/create       # Create shareable link
GET    /api/v1/sharing/:token       # Access shared prompt
PUT    /api/v1/sharing/:token       # Update sharing settings
DELETE /api/v1/sharing/:token       # Revoke sharing access
```

### **System**
```
GET    /health                      # Health check
GET    /api/v1/system/status        # System status
GET    /api-docs                    # API documentation (dev)
```

## 🧪 **Testing**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test suite
npm test -- --grep "authentication"

# Run integration tests
npm run test:integration
```

### **Example API Test**
```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User"}'

# Create prompt
curl -X POST http://localhost:3001/api/v1/prompts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Prompt","task":"Generate a creative story"}'
```

## 🚀 **Deployment**

### **Development**
```bash
# Start development server with auto-reload
npm run dev

# Start with debugging
npm run dev:debug
```

### **Production**
```bash
# Build for production
npm run build

# Start production server
npm start

# Using PM2 process manager
npm install -g pm2
pm2 start ecosystem.config.js
```

### **Docker**
```bash
# Build Docker image
docker build -t promptr-backend .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### **Health Monitoring**
```bash
# Check application health
curl http://localhost:3001/health

# Check system status
curl http://localhost:3001/api/v1/system/status

# Monitor logs
tail -f logs/app-$(date +%Y-%m-%d).log
```

## 📊 **Monitoring & Analytics**

### **Built-in Monitoring**
- **Health Checks**: `/health` endpoint with detailed service status
- **System Metrics**: Memory, CPU, connection counts
- **Database Health**: Connection status and response times
- **Redis Health**: Cache performance and memory usage
- **API Analytics**: Request counts, response times, error rates

### **Logging**
- **Structured Logging**: JSON format for production
- **Log Rotation**: Daily rotation with compression
- **Multiple Levels**: Error, Warn, Info, Debug
- **Request Tracing**: Unique request IDs for debugging

### **Performance Metrics**
```javascript
// Example health check response
{
  "status": "healthy",
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

## 🔒 **Security**

### **Authentication & Authorization**
- **JWT Tokens**: Secure user authentication
- **API Keys**: For programmatic access
- **Role-based Access**: User, Pro, Admin levels
- **Session Management**: Secure token refresh

### **Data Protection**
- **Row Level Security**: Database-level access control
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Input sanitization
- **CORS Configuration**: Origin whitelisting

### **Rate Limiting**
```javascript
// Rate limits by subscription tier
{
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

## 🛠️ **Development**

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run migrate      # Run database migrations
npm run seed         # Seed test data
```

### **Code Quality**
- **ESLint**: Code linting with Airbnb config
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Jest**: Unit and integration testing
- **Supertest**: API endpoint testing

### **Development Workflow**
1. **Feature Development**: Create feature branch
2. **Code Quality**: Run linting and tests
3. **Testing**: Write unit and integration tests
4. **Documentation**: Update API docs if needed
5. **Review**: Submit pull request
6. **Deployment**: Merge to main branch

## 📚 **Documentation**

- **API Documentation**: Available at `/api-docs` in development
- **Database Schema**: See `database-schema-v2.sql`
- **Deployment Guide**: See `docs/backend-implementation.md`
- **Security Policies**: See `docs/security.md`
- **Monitoring Setup**: See `docs/monitoring.md`

## 🤝 **Contributing**

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### **Development Guidelines**
- Follow existing code style and patterns
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: Check the `/docs` directory
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the development team

---

## 🎉 **What's Next?**

After setting up the backend, you can:

1. **Integrate with Frontend**: Update frontend API calls to use the new backend
2. **Set up Monitoring**: Configure production monitoring and alerting
3. **Scale Infrastructure**: Add load balancing and auto-scaling
4. **Enhance Features**: Add new AI models, collaboration features, etc.
5. **Optimize Performance**: Fine-tune caching and database queries

**Happy coding! 🚀** 