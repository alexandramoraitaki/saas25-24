FROM node:18-alpine
RUN apk add --no-cache python3 make g++
WORKDIR /app/grades-service
COPY common/package*.json ../common/
RUN cd ../common && npm install --production
COPY grades-service/package*.json ./
RUN npm install
COPY grades-service/ ./
COPY common/ ../common/
EXPOSE 5003
CMD ["npm", "start"]
