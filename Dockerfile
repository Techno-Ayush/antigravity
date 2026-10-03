# Multi-stage Dockerfile for Peer-to-Peer Skill Exchange
FROM node:18-alpine AS base
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/
COPY client/package.json client/package-lock.json ./client/

# Install dependencies
RUN npm install
RUN cd server && npm install
RUN cd client && npm install

# Copy source files
COPY . .

# Build frontend production assets
RUN npm --prefix client run build

# Production Environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start server
CMD ["node", "server/server.js"]
