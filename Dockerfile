# Dockerfile para Frontend - Optra Vision
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build do frontend
RUN npm run build

# Stage de produção - usar Node.js com serve
FROM node:20-alpine

WORKDIR /app

# Copiar package.json e instalar serve globalmente
COPY package*.json ./
RUN npm ci --legacy-peer-deps --only=production

# Copiar arquivos buildados
COPY --from=builder /app/dist ./dist

# Copiar script de inicialização
COPY server.js ./

# Expor porta (Railway usa variável PORT)
EXPOSE 8080

# Variável de ambiente padrão
ENV NODE_ENV=production

# Comando para iniciar usando script Node.js que garante 0.0.0.0
CMD ["node", "server.js"]
