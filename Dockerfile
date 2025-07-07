FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (this helps with Docker layer caching)
COPY package*.json ./


# Install dependencies
RUN npm install --only=production

# Copy application code
COPY . .

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]