# Stage 1: Build the frontend
FROM node:22-bullseye AS build

# Set working directory
WORKDIR /app

# Copy only package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy all source files
COPY . .

# Build the frontend
RUN npm run dev

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy the build output to Nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

