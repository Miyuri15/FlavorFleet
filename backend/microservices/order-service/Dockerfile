# Use Node.js official image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]