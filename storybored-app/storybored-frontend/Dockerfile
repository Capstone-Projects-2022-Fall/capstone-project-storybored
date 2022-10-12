# Use an official Node runtime as the parent image
FROM node:lts

# Set the working directory in the container to /app
WORKDIR /frontend

# Copy the current directory contents into the container at /app
ADD . /frontend

# Make the container's port 7007 available to the outside world
EXPOSE 3000

# 
RUN npm install

# Run app.js using node when the container launches
CMD ["npm", "start"]



