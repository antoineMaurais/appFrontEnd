# Use the official Node.js image as the base image
FROM node:20

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire frontend directory to the working directory
COPY . .

ENV PORT=8080

# Expose port 3000 for the React application
EXPOSE 8080

# Command to run the React application
CMD ["npm", "start"]
