#!/bin/bash

# Promptr Backend Setup Script
# This script automates the setup process for the Promptr backend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js version
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        REQUIRED_VERSION="18.0.0"
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            log_success "Node.js $NODE_VERSION is installed ✓"
        else
            log_error "Node.js $REQUIRED_VERSION or higher is required. Found: $NODE_VERSION"
            exit 1
        fi
    else
        log_error "Node.js is not installed. Please install Node.js 18.0.0 or higher."
        exit 1
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        log_success "npm $NPM_VERSION is installed ✓"
    else
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check if Redis is available
    if command_exists redis-cli; then
        if redis-cli ping >/dev/null 2>&1; then
            log_success "Redis is running ✓"
        else
            log_warning "Redis is installed but not running. You may need to start it manually."
        fi
    else
        log_warning "Redis is not installed. You'll need to install and configure Redis."
        echo "  macOS: brew install redis && brew services start redis"
        echo "  Ubuntu: sudo apt install redis-server && sudo systemctl start redis"
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        log_success "Dependencies installed ✓"
    else
        log_error "package.json not found. Are you in the backend directory?"
        exit 1
    fi
}

# Setup environment file
setup_environment() {
    log_info "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            log_success "Environment file created from template ✓"
            log_warning "Please edit .env file with your actual configuration values"
        else
            log_error "env.example file not found"
            exit 1
        fi
    else
        log_info "Environment file already exists"
    fi
}

# Create required directories
create_directories() {
    log_info "Creating required directories..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p temp
    
    log_success "Directories created ✓"
}

# Validate environment configuration
validate_environment() {
    log_info "Validating environment configuration..."
    
    if [ -f ".env" ]; then
        # Check for required variables
        REQUIRED_VARS=(
            "SUPABASE_URL"
            "SUPABASE_ANON_KEY"
            "SUPABASE_SERVICE_ROLE_KEY"
            "OPENAI_API_KEY"
            "JWT_SECRET"
            "API_KEY_SECRET"
        )
        
        MISSING_VARS=()
        
        for var in "${REQUIRED_VARS[@]}"; do
            if ! grep -q "^${var}=" .env || grep -q "^${var}=your-" .env || grep -q "^${var}=$" .env; then
                MISSING_VARS+=("$var")
            fi
        done
        
        if [ ${#MISSING_VARS[@]} -eq 0 ]; then
            log_success "Environment configuration is valid ✓"
            return 0
        else
            log_warning "The following environment variables need to be configured:"
            for var in "${MISSING_VARS[@]}"; do
                echo "  - $var"
            done
            return 1
        fi
    else
        log_error ".env file not found"
        return 1
    fi
}

# Test database connection
test_database_connection() {
    log_info "Testing database connection..."
    
    # This would require the server to be running
    # For now, just check if the environment variables are set
    if validate_environment; then
        log_success "Database configuration appears valid ✓"
    else
        log_warning "Database configuration incomplete"
    fi
}

# Run database migrations/setup
setup_database() {
    log_info "Database setup information..."
    
    echo ""
    echo "To set up your database:"
    echo "1. Go to https://supabase.com and create a new project"
    echo "2. Copy the database-schema-v2.sql content"
    echo "3. Paste and execute it in the Supabase SQL Editor"
    echo "4. Update your .env file with the project URL and keys"
    echo ""
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    if npm test; then
        log_success "All tests passed ✓"
    else
        log_warning "Some tests failed. Check the output above."
    fi
}

# Start development server
start_dev_server() {
    log_info "Starting development server..."
    
    if validate_environment; then
        log_info "Starting server on http://localhost:3001"
        log_info "Press Ctrl+C to stop the server"
        npm run dev
    else
        log_error "Cannot start server: environment configuration is incomplete"
        exit 1
    fi
}

# Display help
show_help() {
    echo "Promptr Backend Setup Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  --install     Install dependencies and setup environment"
    echo "  --validate    Validate environment configuration"
    echo "  --test        Run tests"
    echo "  --start       Start development server"
    echo "  --help        Show this help message"
    echo ""
    echo "Without options, runs the full setup process."
}

# Main setup process
main_setup() {
    echo ""
    echo "🚀 Promptr Backend Setup"
    echo "=============================="
    echo ""
    
    check_prerequisites
    install_dependencies
    setup_environment
    create_directories
    
    echo ""
    echo "📋 Next Steps:"
    echo "=============="
    setup_database
    
    if validate_environment; then
        echo "✅ Setup completed successfully!"
        echo ""
        echo "You can now:"
        echo "  - Run tests: npm test"
        echo "  - Start development server: npm run dev"
        echo "  - View API docs: http://localhost:3001/api-docs (when server is running)"
    else
        echo "⚠️  Setup completed with warnings"
        echo ""
        echo "Please complete the environment configuration and database setup before starting the server."
    fi
    
    echo ""
}

# Parse command line arguments
case "${1:-}" in
    --install)
        check_prerequisites
        install_dependencies
        setup_environment
        create_directories
        ;;
    --validate)
        validate_environment
        ;;
    --test)
        run_tests
        ;;
    --start)
        start_dev_server
        ;;
    --help)
        show_help
        ;;
    "")
        main_setup
        ;;
    *)
        log_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac 