# Use a lightweight Node.js image
FROM node:22-alpine AS base

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy only package.json and lock file first to install dependencies (optimizes Docker cache)
COPY package*.json ./

FROM base AS dependencies

# Install dependencies
# RUN npm ci --only=production
RUN npm ci

COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate


# ---- Builder Stage ----
FROM dependencies AS builder

# Copy the rest of the source code
COPY . .

# Build the TypeScript application
RUN npm run build

# ---- Production Stage ----
FROM base AS production

# Set the node env to production
ENV NODE_ENV=production

# Copy the node_modules
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copy the prisma schema and migrations
COPY --from=dependencies /usr/src/app/prisma ./prisma/

# Copy the compiled application code
COPY --from=builder /usr/src/app/dist ./dist

# Copy package files
COPY package.json .
COPY package-lock.json .

# Copy and set up entrypoint script
COPY --chown=node:node entrypointScript.sh .
RUN chmod +x ./entrypointScript.sh

EXPOSE 5000


# Set the entrypoint script
ENTRYPOINT ["./entrypointScript.sh"]

# The command that will be passed to the entry point
CMD ["node", "dist/server.js"]


