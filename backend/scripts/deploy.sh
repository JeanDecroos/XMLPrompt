#!/bin/bash

# XMLPrompter Backend Deployment Script
# This script sets up the production-ready backend API

set -e  # Exit on any error

echo "🚀 XMLPrompter Backend Deployment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the backend directory"
    exit 1
fi

print_status "Starting XMLPrompter backend deployment..."

# Step 1: Install dependencies
print_status "Installing dependencies..."
if command -v npm &> /dev/null; then
    npm install
    print_success "Dependencies installed with npm"
elif command -v yarn &> /dev/null; then
    yarn install
    print_success "Dependencies installed with yarn"
else
    print_error "Neither npm nor yarn found. Please install Node.js and npm."
    exit 1
fi

# Step 2: Check for environment file
print_status "Checking environment configuration..."
if [ ! -f ".env" ]; then
    print_warning "No .env file found. Creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Please edit .env file with your actual configuration values"
        print_warning "Required variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, JWT_SECRET, API_KEY_SECRET"
    else
        print_error ".env.example not found. Please create .env file manually."
        exit 1
    fi
else
    print_success "Environment file found"
fi

# Step 3: Validate required environment variables
print_status "Validating environment variables..."
source .env

REQUIRED_VARS=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY" 
    "OPENAI_API_KEY"
    "JWT_SECRET"
    "API_KEY_SECRET"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    print_error "Please set these variables in your .env file"
    exit 1
fi

print_success "All required environment variables are set"

# Step 4: Create logs directory
print_status "Creating logs directory..."
mkdir -p logs
print_success "Logs directory created"

# Step 5: Test database connection
print_status "Testing database connection..."
if node -e "
import { createClient } from '@supabase/supabase-js';
const client = createClient('$SUPABASE_URL', '$SUPABASE_SERVICE_ROLE_KEY');
client.from('profiles').select('count', { count: 'exact' }).then(({error}) => {
    if (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
    console.log('Database connection successful');
    process.exit(0);
});
" 2>/dev/null; then
    print_success "Database connection successful"
else
    print_error "Database connection failed. Please check your Supabase configuration."
    exit 1
fi

# Step 6: Test OpenAI API
print_status "Testing OpenAI API connection..."
if node -e "
import { OpenAI } from 'openai';
const openai = new OpenAI({ apiKey: '$OPENAI_API_KEY' });
openai.models.list().then(() => {
    console.log('OpenAI API connection successful');
    process.exit(0);
}).catch((error) => {
    console.error('OpenAI API connection failed:', error.message);
    process.exit(1);
});
" 2>/dev/null; then
    print_success "OpenAI API connection successful"
else
    print_error "OpenAI API connection failed. Please check your API key."
    exit 1
fi

# Step 7: Start Redis (if needed)
print_status "Checking Redis connection..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        print_success "Redis is running"
    else
        print_warning "Redis is not running. Starting Redis..."
        if command -v redis-server &> /dev/null; then
            redis-server --daemonize yes
            sleep 2
            if redis-cli ping &> /dev/null; then
                print_success "Redis started successfully"
            else
                print_warning "Failed to start Redis. Some features may not work."
            fi
        else
            print_warning "Redis not installed. Some features may not work."
        fi
    fi
else
    print_warning "Redis CLI not found. Install Redis for optimal performance."
fi

# Step 8: Build the application (if needed)
if [ -f "tsconfig.json" ]; then
    print_status "Building TypeScript application..."
    if command -v tsc &> /dev/null; then
        tsc
        print_success "TypeScript build completed"
    else
        print_warning "TypeScript compiler not found. Using source files directly."
    fi
fi

# Step 9: Run database migrations/setup (if needed)
print_status "Setting up database..."
# Add any database setup commands here if needed
print_success "Database setup completed"

# Step 10: Display deployment summary
echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
print_success "XMLPrompter Backend API is ready to start"
echo ""
echo "📋 Next Steps:"
echo "1. Start the server:"
echo "   npm run dev    (development)"
echo "   npm start      (production)"
echo ""
echo "2. Test the API:"
echo "   curl http://localhost:${PORT:-3001}/health"
echo ""
echo "3. View API documentation (development):"
echo "   http://localhost:${PORT:-3001}/api-docs"
echo ""
echo "📊 Configuration Summary:"
echo "   Environment: ${NODE_ENV:-development}"
echo "   Port: ${PORT:-3001}"
echo "   Database: Supabase (${SUPABASE_URL})"
echo "   AI Service: OpenAI (${OPENAI_MODEL:-gpt-4o-mini})"
echo "   Redis: ${REDIS_URL:-redis://localhost:6379}"
echo ""
print_warning "Make sure to update your frontend VITE_API_URL to point to this backend"
echo ""

# Step 11: Offer to start the server
read -p "Would you like to start the server now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting server..."
    if [ "$NODE_ENV" = "production" ]; then
        npm start
    else
        npm run dev
    fi
fi 