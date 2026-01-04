# Dockerfile for Wallestars Control Center
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for computer use
RUN apk add --no-cache \
    xdotool \
    xvfb \
    x11vnc \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build the frontend
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose ports
EXPOSE 3000
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server/index.js"]
