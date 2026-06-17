FROM node:22-alpine AS deps
WORKDIR /app
RUN apk update && apk upgrade --no-cache && npm install -g npm@latest
COPY package.json package-lock.json ./
RUN npm ci

