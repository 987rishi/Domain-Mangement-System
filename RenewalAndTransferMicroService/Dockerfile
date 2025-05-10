# Use a lightweight Node.js image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy only package.json and lock file first to install dependencies (optimizes Docker cache)
COPY package*.json ./

COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port your app runs on (adjust if different)
EXPOSE 5000

# Command to run the server
CMD ["node", "dist/server.js"]


# FROM node:16