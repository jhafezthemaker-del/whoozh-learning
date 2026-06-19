# --- Stage 1: Install ALL Dependencies ---
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk update && apk upgrade --no-cache 
COPY package.json package-lock.json ./
# Install everything (including devDependencies so we can build)
RUN npm ci

# --- Stage 2: Build the Application ---
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next.js now has TypeScript & Tailwind available to successfully build
RUN npm run build

# --- Stage 3: Production Runner (Ultra Slim) ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Bring over the compiled build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY package.json package-lock.json ./

# Install ONLY production dependencies in the final clean image
RUN npm install -g npm@latest && npm ci --omit=dev
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "start"]