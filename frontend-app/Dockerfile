# stage 1: install & build
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend-app/package*.json ./
RUN npm ci
COPY frontend-app/ .
RUN npm run build

# stage 2: serve with nginx
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
