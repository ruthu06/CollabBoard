# Use the official Node.js image from Docker Hub
FROM node:16

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that your server will run on
EXPOSE 5000

# Command to start the server
CMD ["npm", "start"]
