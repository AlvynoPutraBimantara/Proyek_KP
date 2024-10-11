# syntax=docker/dockerfile:1

# Use an Alpine-based Node.js image for minimal footprint
ARG NODE_VERSION=20.15.1

# Stage 1: Build Stage
FROM node:${NODE_VERSION}-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Install build dependencies
# Copy only package.json and package-lock.json first to leverage Docker cache for npm install
COPY package.json package-lock.json ./

# Install production dependencies only, reduces image size
RUN npm install

# Install MySQL2, kept separate for caching
RUN npm install mysql2

# Copy application source code after dependencies are installed
COPY . .

# Stage 2: Production Image (Slim)
FROM node:${NODE_VERSION}-alpine AS production

# Install only minimal dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont

# Set Puppeteer to use the installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Set working directory
WORKDIR /usr/src/app

# Copy node_modules and application from the build stage
COPY --from=build /usr/src/app /usr/src/app

# Expose port
EXPOSE 3006

# Start the application
CMD ["node", "server.js"]
