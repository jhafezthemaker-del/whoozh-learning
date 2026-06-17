FROM node:22-alpine AS deps
WORKDIR /app
RUN apk update && apk upgrade --no-cache
COPY package.json package-lock.json ./
RUN npm ci

# --- Stage 2: Build / Run Application ---
FROM node:22-alpine AS runner
WORKDIR /app

# Copy the clean node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of your application source code
COPY . .
#RUN npm run build
#CMD ["npm", "start"]