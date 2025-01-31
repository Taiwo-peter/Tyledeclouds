# Use the official Node.js Alpine image as the base image
FROM node:14-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install --production

# Copy the rest of your application code to the working directory
COPY . .

# Expose the port that the app runs on
EXPOSE 443

COPY wait-for.sh /wait-for.sh
RUN chmod +x /wait-for.sh

# Command to run the application
CMD ["/wait-for.sh", "db:3306", "--", "node", "server.js"]
