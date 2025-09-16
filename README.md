# timers
web application which generate alert tick sound on given interval


# Build the Docker image
docker build -t timer-app .

# Run the container
docker run -d -p 8080:80 --name timer timer-app

# Access your timer app
# Open http://localhost:8080 in your browser

# View running containers
docker ps

# View logs
docker logs timer

# Stop the container
docker stop timer

# Remove the container
docker rm timer

# Remove the image
docker rmi timer-app


docker-compose up -d    # Start
docker-compose down     # Stop and remove