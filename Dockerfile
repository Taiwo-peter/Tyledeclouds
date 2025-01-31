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
# Copy the wait-for.sh script and make it executable
COPY wait-for.sh /wait-for.sh
RUN chmod +x /wait-for.sh

# Expose the application port (if needed)
EXPOSE 443

# Define the command to run the application
CMD ["/wait-for.sh", "db:3306", "--", "npm", "start"]
