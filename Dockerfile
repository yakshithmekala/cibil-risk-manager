# Build Stage for Client
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Production Stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Setup server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --production
COPY server/ ./

# Create uploads directory
RUN mkdir -p uploads && chmod 777 uploads

# Copy client build to a predictable location
COPY --from=client-build /app/client/build ../client/build

EXPOSE 5000
CMD ["node", "server.js"]
