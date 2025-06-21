FROM node:18-alpine

# Εργαλεία για bcrypt, amqplib κ.λπ.
RUN apk add --no-cache python3 make g++

# Πρώτα μπαίνουμε στον φάκελο του service
WORKDIR /app/user-service

# 1. Αντιγράφουμε package.json του shared module common
COPY common/package*.json ../common/

# 2. Κάνουμε εγκατάσταση των εξαρτήσεων του common
RUN cd ../common && npm install --production

# 3. Αντιγράφουμε package.json του service
COPY user-service/package*.json ./

# 4. Εγκατάσταση των εξαρτήσεων του user-service
RUN npm install

# 5. Αντιγράφουμε όλον τον κώδικα πλέον
COPY user-service/ ./
COPY common/ ../common/

# 6. Εκθέτουμε πόρτα
EXPOSE 5005

# 7. Εκκίνηση
CMD ["npm", "start"]
