# Base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

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

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD pnpm prisma db push --skip-generate

# Start the server using the production build
CMD [ "pnpm", "run", "start:prod" ]
