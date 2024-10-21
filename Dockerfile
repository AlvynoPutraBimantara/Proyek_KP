# Stage 1: Build stage
ARG NODE_VERSION=20.15.1
FROM node:${NODE_VERSION}-alpine AS build

# Set the working directory
WORKDIR /usr/src/app

# Copy only the frontend folder
COPY frontend/package.json frontend/package-lock.json ./frontend/

# Install dependencies for the frontend
WORKDIR /usr/src/app/frontend
RUN npm install

# Set proper permissions for node_modules/.cache
RUN mkdir -p node_modules/.cache && chmod -R 777 node_modules/.cache

# Copy the rest of the frontend application code and build the Vue.js project
COPY frontend/ ./frontend/
RUN npm run build

# Stage 2: Final production image
FROM node:${NODE_VERSION}-alpine AS production

# Create a non-root user to run the app securely
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory and change ownership to non-root user
WORKDIR /usr/src/app

# Copy built frontend files from the build stage
COPY --from=build /usr/src/app/frontend/dist ./dist
COPY --from=build /usr/src/app/frontend/node_modules ./node_modules

# Clean up unnecessary files (optional)
RUN rm -rf node_modules/.cache && npm prune --production

# Switch to non-root user
USER appuser

# Expose the application port
ENV PORT=8080
EXPOSE 8080

# Start the application
CMD ["npm", "run", "serve"]
