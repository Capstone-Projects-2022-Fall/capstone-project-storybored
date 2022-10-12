# Use an official Node runtime as the parent image
FROM node:lts

# Set the working directory in the container to /app
WORKDIR /backend

# Copy the current directory contents into the container at /app
ADD . /backend

# Make the container's port 7007 available to the outside world
EXPOSE 7007

# 
RUN npm install

# Run app.js using node when the container launches
CMD ["npm", "start"]



