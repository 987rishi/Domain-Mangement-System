# Base image
FROM node:22-alpine

# Set working directory inside container
WORKDIR /app

# Copy only package.json and package-lock.json to install deps first (better cache)
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install 

# Install global dev tools (optional, since you use npm scripts)
RUN npm install -g typescript nodemon concurrently

# Copy rest of the code (after deps are cached)
COPY . .

# Prisma generate
RUN npx prisma generate
# This creates the dist/ directory and dist/server.js
# RUN npx prisma migrate deploy

RUN npx tsc

# Set environment variable for Prisma (needed during generate)
ENV NODE_ENV=production


# Expose port (change to your backend's actual port)
EXPOSE 5000

# Start in development mode
CMD ["npm", "run", "server"]

