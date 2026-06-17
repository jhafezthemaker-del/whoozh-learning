# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk update && apk upgrade --no-cache
COPY package.json package-lock.json ./
RUN npm ci --omit=dev   # production-only deps

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
