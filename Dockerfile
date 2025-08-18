FROM node:18-alpine

# Install curl and build tools
RUN apk add --no-cache curl python3 make g++

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies
RUN npm ci --verbose

# Copy source code
COPY . .

# Create production build configuration
RUN echo 'import { defineConfig } from "vite"; \
import react from "@vitejs/plugin-react"; \
import path from "path"; \
export default defineConfig({ \
  plugins: [react()], \
  resolve: { \
    alias: { \
      "@": path.resolve(__dirname, "client", "src"), \
      "@shared": path.resolve(__dirname, "shared"), \
      "@assets": path.resolve(__dirname, "attached_assets"), \
    }, \
  }, \
  root: path.resolve(__dirname, "client"), \
  build: { \
    outDir: path.resolve(__dirname, "dist/public"), \
    emptyOutDir: true, \
  }, \
  define: { \
    "process.env.NODE_ENV": JSON.stringify("production"), \
  }, \
});' > vite.config.prod.js

# Build frontend with production config
RUN npx vite build --config vite.config.prod.js

# Build backend
RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

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