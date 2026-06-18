FROM node:22-alpine AS deps
WORKDIR /app

# 1. Update the global npm tool to clear the Trivy vulnerability
RUN npm install -g npm@latest

# 2. Copy your project's lockfiles
COPY package.json package-lock.json ./

# 3. Use your preferred 'npm ci' for a fast, secure project build
RUN apk update && apk upgrade --no-cache && npm ci