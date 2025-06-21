FROM node:18-alpine

# ✅ Εργαλεία για native modules (π.χ. bcrypt, amqplib)
RUN apk add --no-cache python3 make g++

# 🔹 Ρύθμιση αρχικού φακέλου του service
WORKDIR /app/stats-service

# 1️⃣ Αντιγραφή μόνο των package*.json του common
COPY common/package*.json ../common/

# 2️⃣ Εγκατάσταση εξαρτήσεων του shared module (π.χ. amqplib)
RUN cd ../common && npm install --production

# 3️⃣ Αντιγραφή package.json του service
COPY stats-service/package*.json ./

# 4️⃣ Εγκατάσταση service εξαρτήσεων
RUN npm install

# 5️⃣ Αντιγραφή όλου του κώδικα (service + common)
COPY stats-service/ ./
COPY common/ ../common/

# 6️⃣ Άνοιγμα θύρας
EXPOSE 5004

# 7️⃣ Εκκίνηση
CMD ["npm", "start"]
