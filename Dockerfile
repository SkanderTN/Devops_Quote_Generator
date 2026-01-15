# ============================================
# Stage 1: Build stage
# ============================================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# ============================================
# Stage 2: Runtime stage
# ============================================
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodeuser && \
    adduser -S nodeuser -u 1001

# Copy node_modules and app files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nodeuser:nodeuser . .

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "index.js"]
