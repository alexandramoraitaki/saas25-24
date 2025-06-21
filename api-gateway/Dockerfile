FROM node:18-alpine
WORKDIR /app
COPY ./api-gateway/package*.json ./
COPY ./common ./node_modules/@clearsky/common
RUN npm install --production
COPY ./api-gateway .
EXPOSE 8080
CMD ["npm", "start"]

