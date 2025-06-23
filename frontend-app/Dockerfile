# frontend-app/Dockerfile

# 1) Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Αντέγραψε μόνο τα package.json για cache
COPY package*.json ./
RUN npm ci

# Αντέγραψε όλον τον κώδικα (όχι “frontend-app/…”, απλώς “.”)
COPY . .
RUN npm run build

# 2) Production stage
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
