FROM node:18-alpine

# Install dependencies in the image to speed up container start.
WORKDIR /usr/src/app/api

# copy package manifests first for better cache utilization
COPY package*.json ./

# install all deps (including dev for local development/test convenience)
RUN npm ci --no-audit --no-fund

# copy source
COPY . ./

EXPOSE 4000

# default command for development; docker-compose mounts the source for live reload
CMD ["npm", "run", "dev"]
