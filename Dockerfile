# HEDIS CareGap Multi-stage Docker Build
# Production-ready containerization

# Stage 1: Build stage
FROM node:18-alpine AS builder

LABEL maintainer="HEDIS CareGap Team"
LABEL description="Clinical documentation app with Firebase and Capacitor"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm ci --only=development

# Copy source code
COPY . .

# Type checking
RUN npm run type-check || true

# Linting
RUN npm run lint || true

# Build application
RUN npm run build

# Stage 2: Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install lightweight HTTP server for serving static content
RUN npm install -g serve@latest && \
    npm cache clean --force

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Copy configuration files (optional, for reference)
COPY --from=builder /app/capacitor.config.ts ./
COPY --from=builder /app/package.json ./

# Create non-root user for security
RUN addgroup -g 1000 caregap && \
    adduser -D -u 1000 -G caregap caregap && \
    chown -R caregap:caregap /app

USER caregap

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/index.html || exit 1

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start application
CMD ["serve", "-s", "dist", "-l", "3000"]

# Labels for container registry
LABEL org.opencontainers.image.title="HEDIS CareGap"
LABEL org.opencontainers.image.description="Clinical documentation with Firebase & Capacitor"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.url="https://github.com/your-org/hedis-caregap"
