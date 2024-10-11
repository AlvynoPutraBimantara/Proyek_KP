# syntax=docker/dockerfile:1

# Stage 1: Build stage
ARG NODE_VERSION=20.15.1
FROM node:${NODE_VERSION}-alpine AS build

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies (including devDependencies)
COPY package.json package-lock.json ./
RUN npm install

# Set proper permissions for node_modules/.cache
RUN mkdir -p node_modules/.cache && chmod -R 777 node_modules/.cache

# Copy the rest of the application code and build the Vue.js project
COPY . . 
RUN npm run build

# Stage 2: Final production image
FROM node:${NODE_VERSION}-alpine AS production

# Create a non-root user to run the app securely
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory and change ownership to non-root user
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules

# Clean up unnecessary files (optional)
RUN rm -rf node_modules/.cache && npm prune --production

# Switch to non-root user
USER appuser

# Expose the application port
ENV PORT=8080
EXPOSE 8080

# Start the application
CMD ["npm", "run", "serve"]
