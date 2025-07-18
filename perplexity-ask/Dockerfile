FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm install

# Copy TS config and source code
COPY tsconfig.json .
COPY index.ts .

# Build the project
RUN npm run build

FROM node:22-alpine AS release

WORKDIR /app

# Copy build artifacts from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

ENV NODE_ENV=production

# Install production dependencies only
RUN npm ci --omit=dev

ENTRYPOINT ["node", "dist/index.js"]