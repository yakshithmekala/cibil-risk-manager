# Build Stage for Client
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Build Stage for Server
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server/ ./server/
COPY --from=client-build /app/client/build ./client/build

EXPOSE 5000
WORKDIR /app/server
ENV NODE_ENV=production
CMD ["node", "server.js"]
