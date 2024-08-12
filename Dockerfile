# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.15.1

FROM node:${NODE_VERSION}-alpine as base

WORKDIR /usr/src/app

# Create a stage for installing all dependencies (both dev and prod).
FROM base as deps

# Install all dependencies, including devDependencies, to ensure vue-cli-service is available.
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vue.js project
RUN npm run build

# Create a new stage to run the application.
FROM base as final

ENV NODE_ENV production

USER node

COPY package.json ./
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/dist ./dist

EXPOSE 8000

CMD ["npm", "run", "serve"]
