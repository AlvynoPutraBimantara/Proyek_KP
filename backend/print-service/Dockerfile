# syntax=docker/dockerfile:1
ARG NODE_VERSION=20.15.1
FROM node:${NODE_VERSION}-alpine as base

WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Install MySQL client and other dependencies
RUN npm install mysql2

# Install Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Puppeteer to use the installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy the rest of the application code
COPY . .

EXPOSE 3006

CMD ["node", "server.js"]
