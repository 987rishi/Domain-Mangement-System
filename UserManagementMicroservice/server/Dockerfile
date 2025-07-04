#  Base image
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

RUN npx prisma generate
# This creates the dist/ directory and dist/server.js
# RUN npm run build
RUN npx tsc

# Set environment variable for Prisma (needed during generate)
ENV NODE_ENV=production

# Copy and set up entrypoint script
COPY --chown=node:node entrypointScript.sh .
# RUN chmod +x ./entrypointScript.sh

RUN sed -i 's/\r$//' ./entrypointScript.sh && \
    chmod +x ./entrypointScript.sh

# Expose port (change to your backend's actual port)
EXPOSE 5000

# Set the entrypoint Script that migrates prisma model to postgresdb
ENTRYPOINT [ "./entrypointScript.sh" ]

# Start in development mode
CMD ["npm", "run", "server"]


