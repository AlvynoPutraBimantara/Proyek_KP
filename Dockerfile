# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.15.1

FROM node:${NODE_VERSION}-alpine as base

WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Set proper permissions for node_modules/.cache
RUN mkdir -p node_modules/.cache && chmod -R 777 node_modules/.cache

# Copy the rest of the application code
COPY . .

# Build the Vue.js project
RUN npm run build

# Prepare final stage for production
FROM base as final

USER node

COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/dist ./dist

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "run", "serve"]
