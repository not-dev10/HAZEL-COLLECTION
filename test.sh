#!/bin/bash

# Cart & Wishlist Test Runner Script
# Supports: macOS, Linux
# Usage: ./test.sh [backend|frontend|all]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Main script
main() {
    local test_type="${1:-all}"
    
    print_header "Cart & Wishlist Test Suite"
    echo ""
    
    case $test_type in
        backend)
            run_backend_tests
            ;;
        frontend)
            run_frontend_tests
            ;;
        all)
            run_frontend_tests
            echo ""
            run_backend_tests
            ;;
        *)
            print_error "Unknown test type: $test_type"
            echo "Usage: ./test.sh [backend|frontend|all]"
            exit 1
            ;;
    esac
}

run_backend_tests() {
    print_header "Running Backend API Tests"
    echo ""
    
    # Check if backend is running
    if ! curl -s http://localhost:5000/api/cart > /dev/null 2>&1; then
        print_error "Backend is not running on http://localhost:5000"
        print_warning "Start the backend with: npm run backend:dev"
        exit 1
    fi
    
    print_success "Backend is running"
    echo ""
    
    # Run tests
    if [ ! -f "test-wishlist-cart.js" ]; then
        print_error "test-wishlist-cart.js not found"
        echo "Make sure you're running from the root directory"
        exit 1
    fi
    
    print_info "Running tests..."
    node test-wishlist-cart.js
    
    local exit_code=$?
    echo ""
    
    if [ $exit_code -eq 0 ]; then
        print_success "Backend tests completed successfully!"
    else
        print_error "Backend tests failed"
        exit 1
    fi
}

run_frontend_tests() {
    print_header "Running Frontend Integration Tests"
    echo ""
    
    # Check if frontend directory exists
    if [ ! -d "frontend" ]; then
        print_error "frontend directory not found"
        exit 1
    fi
    
    # Check if test file exists
    if [ ! -f "test-frontend-integration.js" ]; then
        print_error "test-frontend-integration.js not found"
        exit 1
    fi
    
    print_info "Validating frontend code..."
    cd frontend
    node ../test-frontend-integration.js
    local exit_code=$?
    cd ..
    
    echo ""
    
    if [ $exit_code -eq 0 ]; then
        print_success "Frontend tests completed successfully!"
    else
        print_error "Frontend tests failed"
        exit 1
    fi
}

# Show help
show_help() {
    echo "Cart & Wishlist Test Runner"
    echo ""
    echo "Usage: ./test.sh [option]"
    echo ""
    echo "Options:"
    echo "  backend     Run backend API tests (requires backend running)"
    echo "  frontend    Run frontend integration tests"
    echo "  all         Run all tests (default)"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./test.sh                # Run all tests"
    echo "  ./test.sh backend        # Run only backend tests"
    echo "  ./test.sh frontend       # Run only frontend tests"
    echo ""
    echo "Before running backend tests, make sure the backend is running:"
    echo "  npm run backend:dev"
}

# Run main
if [ "$1" == "help" ] || [ "$1" == "-h" ]; then
    show_help
else
    main "$@"
fi
