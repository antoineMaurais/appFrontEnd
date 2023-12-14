# Use the official Node.js image as the base image
FROM node:14

# Set the working directory to /app
WORKDIR /app/appFrontEnd

# Copy package.json and package-lock.json to the working directory
COPY appFrontEnd/package*.json ./

# Install dependencies
RUN npm install

# Copy the entire frontend directory to the working directory
COPY appFrontEnd .

# Expose port 3000 for the React application
EXPOSE 3000

# Command to run the React application
CMD ["npm", "start"]
