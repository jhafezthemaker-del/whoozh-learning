FROM node:22-alpine AS deps
WORKDIR /app
RUN apk update && apk upgrade --no-cache
COPY package.json package-lock.json ./
RUN npm ci
RUN npm install picomatch@4.0.4 --save-exact
COPY . .
