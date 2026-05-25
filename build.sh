#!/bin/bash

###############################################################################
# HEDIS CareGap Build Script
# Handles building for web, Docker, iOS, and Android
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="HEDIS CareGap"
VERSION=$(grep '"version"' package.json | grep -o '"version": "[^"]*"' | cut -d'"' -f4)
BUILD_DIR="dist"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Functions
print_header() {
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_dependencies() {
    print_header "Checking Dependencies"

    local required_commands=("node" "npm" "git")
    for cmd in "${required_commands[@]}"; do
        if command -v "$cmd" &> /dev/null; then
            local version=$("$cmd" --version)
            print_success "$cmd: $version"
        else
            print_error "Required command not found: $cmd"
            exit 1
        fi
    done
}

build_web() {
    print_header "Building Web Application"

    print_info "Installing dependencies..."
    npm ci

    print_info "Running linting..."
    npm run lint || print_warning "Linting completed with warnings"

    print_info "Type checking..."
    npm run type-check || print_warning "Type checking completed with warnings"

    print_info "Building application..."
    npm run build

    print_success "Web build completed"
    print_info "Output directory: $BUILD_DIR/"
    ls -lh "$BUILD_DIR"/ | head -10
}

build_docker() {
    print_header "Building Docker Image"

    print_info "Building Docker image: hedis-caregap:$VERSION"
    docker build -t "hedis-caregap:$VERSION" \
                 -t "hedis-caregap:latest" \
                 --build-arg VERSION="$VERSION" \
                 --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
                 .

    print_success "Docker image built successfully"
    docker images | grep hedis-caregap
}

test_docker() {
    print_header "Testing Docker Container"

    print_info "Starting container..."
    local container_id=$(docker run -d -p 3000:3000 --name caregap-test hedis-caregap:latest)

    print_info "Container ID: $container_id"
    sleep 5

    print_info "Testing health endpoint..."
    if curl -f http://localhost:3000/index.html > /dev/null 2>&1; then
        print_success "Container is running and responding"
    else
        print_error "Container health check failed"
        docker logs caregap-test
        docker rm -f caregap-test
        exit 1
    fi

    docker rm -f caregap-test
    print_success "Docker test passed"
}

build_ios() {
    print_header "Building iOS Application"

    if [[ ! "$OSTYPE" == "darwin"* ]]; then
        print_error "iOS builds require macOS"
        return 1
    fi

    if ! command -v xcode-select &> /dev/null; then
        print_error "Xcode not installed"
        return 1
    fi

    print_info "Building web assets..."
    npm run build

    print_info "Adding iOS platform..."
    npx cap add ios || print_warning "iOS platform already exists"

    print_info "Syncing iOS project..."
    npx cap sync ios

    print_success "iOS project prepared"
    print_info "To build: npx cap open ios"
}

build_android() {
    print_header "Building Android Application"

    if [ -z "$ANDROID_SDK_ROOT" ]; then
        print_error "ANDROID_SDK_ROOT not set"
        print_info "Set it with: export ANDROID_SDK_ROOT=\$HOME/Library/Android/sdk"
        return 1
    fi

    if ! command -v adb &> /dev/null; then
        print_error "Android SDK tools not found"
        return 1
    fi

    print_info "Building web assets..."
    npm run build

    print_info "Adding Android platform..."
    npx cap add android || print_warning "Android platform already exists"

    print_info "Syncing Android project..."
    npx cap sync android

    print_info "Building APK..."
    cd android
    ./gradlew assembleDebug
    cd ..

    print_success "Android APK built"
    print_info "Output: android/app/build/outputs/apk/debug/app-debug.apk"
}

run_docker_compose() {
    print_header "Running with Docker Compose"

    print_info "Building services..."
    docker-compose build

    print_info "Starting services..."
    docker-compose up -d

    print_success "Services started"
    print_info "Web app: http://localhost:3000"
    print_info "View logs: docker-compose logs -f caregap"
}

clean_build() {
    print_header "Cleaning Build Artifacts"

    print_info "Removing node_modules..."
    rm -rf node_modules

    print_info "Removing build output..."
    rm -rf "$BUILD_DIR"

    print_info "Clearing npm cache..."
    npm cache clean --force

    print_success "Clean completed"
}

print_usage() {
    cat << EOF
${BLUE}HEDIS CareGap Build Script${NC}

${YELLOW}Usage:${NC}
    ./build.sh [command]

${YELLOW}Commands:${NC}
    web             Build web application
    docker          Build Docker image
    docker-test     Test Docker container
    docker-run      Run with Docker Compose
    ios             Prepare iOS project
    android         Prepare Android project
    all             Build web, Docker, and images
    native          Build iOS and Android
    clean           Clean build artifacts
    help            Show this help message

${YELLOW}Examples:${NC}
    ./build.sh web                  # Build web app only
    ./build.sh docker               # Build Docker image
    ./build.sh docker-run           # Run with Docker Compose
    ./build.sh native               # Build iOS and Android projects
    ./build.sh all                  # Build everything

${YELLOW}Environment Variables:${NC}
    ANDROID_SDK_ROOT              Android SDK location (for Android builds)
    NODE_ENV                       Set to 'production' for prod build
    VITE_FIREBASE_PROJECT_ID       Firebase project ID (required)

EOF
}

main() {
    print_header "$PROJECT_NAME Build v$VERSION"

    check_dependencies

    case "${1:-web}" in
        web)
            build_web
            ;;
        docker)
            build_web
            build_docker
            ;;
        docker-test)
            build_web
            build_docker
            test_docker
            ;;
        docker-run)
            build_web
            run_docker_compose
            ;;
        ios)
            build_ios
            ;;
        android)
            build_android
            ;;
        all)
            build_web
            build_docker
            build_ios || print_warning "iOS build skipped (not on macOS)"
            build_android || print_warning "Android build skipped (Android SDK not configured)"
            ;;
        native)
            build_web
            build_ios
            build_android
            ;;
        clean)
            clean_build
            ;;
        help|--help|-h)
            print_usage
            ;;
        *)
            print_error "Unknown command: $1"
            print_usage
            exit 1
            ;;
    esac

    print_header "Build Complete"
    print_success "All build steps completed successfully!"
}

# Run main function
main "$@"
