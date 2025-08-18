FROM node:18-alpine

# Install curl and build tools
RUN apk add --no-cache curl python3 make g++

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies
RUN npm ci --verbose

# Copy project files and directories
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY attached_assets/ ./attached_assets/
COPY *.config.* ./
COPY *.json ./

# Verify assets are copied
RUN echo "=== Checking attached_assets ===" && ls -la attached_assets/ && echo "=== End assets check ==="

# Set production environment
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Clean up dev dependencies
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/services || exit 1

CMD ["node", "dist/index.js"]