# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the TypeScript application (compiles TS to JS in the 'dist' folder)
RUN npm run build

# Optional: Prune devDependencies if they are not needed after build
# and if 'npm ci --only=production' wasn't used effectively in the first npm install
# RUN npm prune --production


# Stage 2: Create the production image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Set the NODE_ENV to production
ENV NODE_ENV=production

# Copy only necessary production dependencies from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy the compiled application (dist folder) from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy package.json (some libraries might need it at runtime)
COPY --from=builder /usr/src/app/package.json ./package.json

# Expose application port
EXPOSE 5001

# Create a non-root user and group for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Change ownership of the app directory to the new user
RUN chown -R appuser:appgroup /usr/src/app

# Switch to the non-root user
USER appuser

# Command to run the application
CMD ["node", "dist/server.js"]