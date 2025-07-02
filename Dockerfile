FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY ./app/package.json ./app/package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY ./app .

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