# Use Node to build the frontend
FROM node:22-bullseye AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the Vite frontend
RUN npm run build

# Use Nginx to serve built files
FROM nginx:stable-alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 8080 (Vercel uses 8080 internally for containers)
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]



