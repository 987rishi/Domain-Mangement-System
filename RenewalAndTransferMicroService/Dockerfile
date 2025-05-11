# Use a lightweight Node.js image
FROM node:18-alpine AS base

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy only package.json and lock file first to install dependencies (optimizes Docker cache)
COPY package*.json ./

FROM base AS dependencies

# Install dependencies
# RUN npm ci --only=production
RUN npm ci


COPY prisma ./prisma/
RUN npx prisma generate

FROM dependencies AS builder
COPY . .


RUN npm run build


FROM base AS production

COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=dependencies /usr/src/app/prisma ./prisma/


COPY --from=builder /usr/src/app/dist ./dist

COPY package.json .

EXPOSE 5000


CMD ["node", "dist/server.js"]


