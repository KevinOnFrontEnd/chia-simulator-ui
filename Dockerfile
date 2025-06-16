#base image
FROM ghcr.io/chia-network/chia:latest

# install dev tools
WORKDIR /chia-blockchain
RUN pip install chia-dev-tools

# Install Node.js
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# Set working directory
WORKDIR /app

# Copy Next.js files
COPY . ./
WORKDIR /app/simulator-ui
RUN npm install


# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port
EXPOSE 3000

# Start services and Next.js app
ENTRYPOINT ["/entrypoint.sh"]
