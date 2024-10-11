# syntax=docker/dockerfile:1

# Stage 1: Build stage
ARG NODE_VERSION=20.15.1
FROM node:${NODE_VERSION}-alpine AS build

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies only for production
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Stage 2: Production stage
FROM node:${NODE_VERSION}-alpine AS production

# Set the working directory
WORKDIR /usr/src/app

# Copy only necessary files from the build stage
COPY --from=build /usr/src/app /usr/src/app

# Expose the application port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
