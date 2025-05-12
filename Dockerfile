FROM node:18-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Exponer puertos
EXPOSE 3000 3001

# Comando para iniciar la aplicación
CMD ["node", "dist/server.js"]
