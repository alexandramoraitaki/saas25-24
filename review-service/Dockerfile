FROM node:18-alpine

# ✅ Εργαλεία για native modules (π.χ. bcrypt, amqplib)
RUN apk add --no-cache python3 make g++

# 🔹 Είσοδος στον φάκελο του review-service
WORKDIR /app/review-service

# 1️⃣ Αντιγραφή μόνο των package*.json του common
COPY common/package*.json ../common/

# 2️⃣ Εγκατάσταση των εξαρτήσεων του common (π.χ. amqplib)
RUN cd ../common && npm install --production

# 3️⃣ Αντιγραφή package.json του review-service
COPY review-service/package*.json ./

# 4️⃣ Εγκατάσταση dependencies του service (θα βρει και το @clearsky/common)
RUN npm install

# 5️⃣ Αντιγραφή πλήρους κώδικα
COPY review-service/ ./
COPY common/ ../common/

# 6️⃣ Άνοιγμα θύρας
EXPOSE 5006

# 7️⃣ Εκκίνηση
CMD ["npm", "start"]
