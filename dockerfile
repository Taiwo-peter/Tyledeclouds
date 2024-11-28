# Use the official Node.js image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of your application code to the working directory
COPY . .

# Expose the port that the app runs on
EXPOSE 5000

# Command to run the application
CMD ["node", "server.js"]
