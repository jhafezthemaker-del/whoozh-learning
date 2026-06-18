# --- Stage 1: Install ALL Dependencies ---
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
# Install everything (including devDependencies so we can build)
RUN apk update && apk upgrade --no-cache && npm install -g npm@latest

