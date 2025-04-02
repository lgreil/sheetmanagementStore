# Base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN pnpm install

# Generate Prisma Client
RUN pnpm prisma generate

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN pnpm run build

# Set environment variables
ENV NODE_ENV production

# Start the server using the production build
CMD [ "pnpm", "run", "start:prod" ]
# Add another runner for development
CMD [ "pnpm", "run", "start" ]
