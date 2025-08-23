#!/bin/bash
# نص تشغيل الاختبارات والنشر الشامل
# Comprehensive Testing and Deployment Script

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if required commands exist
check_requirements() {
    log "Checking system requirements..."
    
    commands=("node" "npm" "docker" "docker-compose")
    for cmd in "${commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            error "$cmd is required but not installed."
            exit 1
        else
            success "$cmd is available"
        fi
    done
}

# Clean up previous builds and caches
cleanup() {
    log "Cleaning up previous builds and caches..."
    
    # Clean Next.js cache
    rm -rf .next
    
    # Clean npm cache
    npm cache clean --force
    
    # Clean test cache
    rm -rf coverage
    
    # Clean Docker cache (optional)
    if [ "$1" = "--full" ]; then
        docker system prune -f
    fi
    
    success "Cleanup completed"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Install npm packages
    npm ci
    
    # Generate Prisma client
    npx prisma generate
    
    success "Dependencies installed"
}

# Run unit tests
run_unit_tests() {
    log "Running unit tests..."
    
    if npm test -- --coverage --watchAll=false; then
        success "Unit tests passed"
        return 0
    else
        error "Unit tests failed"
        return 1
    fi
}

# Run integration tests
run_integration_tests() {
    log "Running integration tests..."
    
    if npm run test:e2e; then
        success "Integration tests passed"
        return 0
    else
        error "Integration tests failed"
        return 1
    fi
}

# Run performance tests
run_performance_tests() {
    log "Running performance tests..."
    
    if npm run test:performance; then
        success "Performance tests passed"
        return 0
    else
        error "Performance tests failed"
        return 1
    fi
}

# Run security tests
run_security_tests() {
    log "Running security tests..."
    
    if npm run test:security; then
        success "Security tests passed"
        return 0
    else
        error "Security tests failed"
        return 1
    fi
}

# Build application
build_application() {
    log "Building application..."
    
    if npm run build; then
        success "Application built successfully"
        return 0
    else
        error "Application build failed"
        return 1
    fi
}

# Build Docker images
build_docker_images() {
    log "Building Docker images..."
    
    if docker-compose build; then
        success "Docker images built successfully"
        return 0
    else
        error "Docker image build failed"
        return 1
    fi
}

# Test Docker deployment
test_docker_deployment() {
    log "Testing Docker deployment..."
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be ready
    sleep 30
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        success "Docker services are running"
        
        # Test health endpoints
        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            success "Application health check passed"
        else
            error "Application health check failed"
            docker-compose logs
            return 1
        fi
    else
        error "Docker services failed to start"
        docker-compose logs
        return 1
    fi
    
    # Clean up
    docker-compose down
}

# Generate documentation
generate_documentation() {
    log "Generating documentation..."
    
    # Generate API documentation (if swagger is configured)
    if [ -f "scripts/generate-api-docs.js" ]; then
        node scripts/generate-api-docs.js
    fi
    
    # Generate coverage report
    npm run test -- --coverage --watchAll=false
    
    success "Documentation generated"
}

# Create deployment package
create_deployment_package() {
    log "Creating deployment package..."
    
    # Create deployment directory
    mkdir -p deployment-package
    
    # Copy necessary files
    cp -r .next deployment-package/
    cp -r public deployment-package/
    cp -r prisma deployment-package/
    cp package*.json deployment-package/
    cp docker-compose.yml deployment-package/
    cp Dockerfile deployment-package/
    cp -r config deployment-package/ 2>/dev/null || true
    
    # Create archive
    tar -czf deployment-package.tar.gz deployment-package/
    
    success "Deployment package created: deployment-package.tar.gz"
}

# Generate final report
generate_report() {
    log "Generating final test report..."
    
    cat > TEST_EXECUTION_REPORT.md << EOF
# تقرير تنفيذ الاختبارات والنشر

## 📅 تاريخ التنفيذ
$(date +'%Y-%m-%d %H:%M:%S')

## ✅ الاختبارات المنجزة
$([ "$unit_tests_passed" = "true" ] && echo "- ✅ اختبارات الوحدة" || echo "- ❌ اختبارات الوحدة")
$([ "$integration_tests_passed" = "true" ] && echo "- ✅ اختبارات التكامل" || echo "- ❌ اختبارات التكامل")
$([ "$performance_tests_passed" = "true" ] && echo "- ✅ اختبارات الأداء" || echo "- ❌ اختبارات الأداء")
$([ "$security_tests_passed" = "true" ] && echo "- ✅ اختبارات الأمان" || echo "- ❌ اختبارات الأمان")
$([ "$build_passed" = "true" ] && echo "- ✅ بناء التطبيق" || echo "- ❌ بناء التطبيق")
$([ "$docker_tests_passed" = "true" ] && echo "- ✅ اختبار Docker" || echo "- ❌ اختبار Docker")

## 📊 إحصائيات التغطية
- تغطية الاختبارات: راجع \`coverage/index.html\`
- ملفات الاختبار: $(find __tests__ -name "*.test.*" -o -name "*.spec.*" | wc -l)
- مكونات مختبرة: $(find components -name "*.test.*" -o -name "*.spec.*" | wc -l)

## 🚀 جاهزية النشر
$([ "$all_tests_passed" = "true" ] && echo "✅ **المشروع جاهز للنشر الإنتاجي**" || echo "❌ **المشروع يحتاج إصلاحات قبل النشر**")

## 📦 الملفات المُنتجة
- \`deployment-package.tar.gz\` - حزمة النشر
- \`coverage/\` - تقارير التغطية
- \`TEST_EXECUTION_REPORT.md\` - هذا التقرير

## 🔄 الخطوات التالية
1. مراجعة تقارير الاختبار المفصلة
2. إصلاح أي مشاكل مكتشفة
3. النشر على بيئة الاختبار
4. النشر الإنتاجي بعد الموافقة
EOF

    success "Final report generated: TEST_EXECUTION_REPORT.md"
}

# Main execution
main() {
    log "Starting comprehensive testing and deployment preparation..."
    
    # Initialize test results
    unit_tests_passed="false"
    integration_tests_passed="false"
    performance_tests_passed="false"
    security_tests_passed="false"
    build_passed="false"
    docker_tests_passed="false"
    all_tests_passed="false"
    
    # Check requirements
    check_requirements
    
    # Cleanup
    cleanup
    
    # Install dependencies
    install_dependencies
    
    # Run tests
    if run_unit_tests; then
        unit_tests_passed="true"
    fi
    
    # Skip integration tests if unit tests failed
    if [ "$unit_tests_passed" = "true" ]; then
        if run_integration_tests; then
            integration_tests_passed="true"
        fi
    else
        warning "Skipping integration tests due to unit test failures"
    fi
    
    # Run performance tests
    if run_performance_tests; then
        performance_tests_passed="true"
    fi
    
    # Run security tests
    if run_security_tests; then
        security_tests_passed="true"
    fi
    
    # Build application
    if build_application; then
        build_passed="true"
    fi
    
    # Test Docker deployment if build passed
    if [ "$build_passed" = "true" ]; then
        if build_docker_images && test_docker_deployment; then
            docker_tests_passed="true"
        fi
    else
        warning "Skipping Docker tests due to build failure"
    fi
    
    # Generate documentation
    generate_documentation
    
    # Create deployment package if all critical tests passed
    if [ "$build_passed" = "true" ] && [ "$unit_tests_passed" = "true" ]; then
        create_deployment_package
    fi
    
    # Check overall success
    if [ "$unit_tests_passed" = "true" ] && [ "$build_passed" = "true" ] && [ "$security_tests_passed" = "true" ]; then
        all_tests_passed="true"
        success "🎉 All critical tests passed! Project is ready for deployment."
    else
        error "❌ Some critical tests failed. Please review and fix issues before deployment."
    fi
    
    # Generate final report
    generate_report
    
    log "Testing and deployment preparation completed!"
}

# Parse command line arguments
case "${1:-}" in
    "--help" | "-h")
        echo "Usage: $0 [OPTIONS]"
        echo "Options:"
        echo "  --full-cleanup    Perform full Docker cleanup"
        echo "  --unit-only       Run only unit tests"
        echo "  --no-docker       Skip Docker tests"
        echo "  --help           Show this help message"
        exit 0
        ;;
    "--unit-only")
        log "Running unit tests only..."
        check_requirements
        cleanup
        install_dependencies
        run_unit_tests
        exit $?
        ;;
    "--no-docker")
        log "Skipping Docker tests..."
        # Set flag to skip Docker tests
        SKIP_DOCKER=true
        ;;
    "--full-cleanup")
        cleanup --full
        ;;
esac

# Run main function
main "$@"
