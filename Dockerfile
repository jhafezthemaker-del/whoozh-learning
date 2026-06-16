FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
RUN apk update && apk upgrade --no-cache
COPY . .
