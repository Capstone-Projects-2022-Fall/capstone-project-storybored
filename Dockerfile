# Use an official Node runtime as the parent image
FROM node:lts

# Set the working directory in the container to /app
WORKDIR /storybored

# Copy the current directory contents into the container at /app
ADD ./storybored /storybored

# Make the container's port 7007 available to the outside world
EXPOSE 7007

# Run app.js using node when the container launches
CMD ["node", "."]

