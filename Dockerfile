# --- Stage 1: Install ALL Dependencies ---
FROM node:24-alpine AS deps
WORKDIR /app
RUN apk update && apk upgrade --no-cache 
COPY package.json package-lock.json ./
# Install everything (including devDependencies so we can build)
#RUN npm install -g npm@11.17.0 && npm ci --omit=dev
RUN npm ci
RUN npm ls undici
# --- Stage 2: Build the Application ---
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next.js now has TypeScript & Tailwind available to successfully build
RUN npm run build

# --- Stage 3: Production Runner (Ultra Slim) ---
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Bring over the compiled build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY package.json package-lock.json ./

# Install ONLY production dependencies in the final clean image
RUN npm ci
RUN npm -v
EXPOSE 3000
ENV PORT=3000
# Alpine uses 'addgroup' and 'adduser' instead of 'groupadd' and 'useradd'
RUN addgroup -S appgroup && adduser -S -G appgroup appuser
USER appuser
CMD ["npm", "start"]