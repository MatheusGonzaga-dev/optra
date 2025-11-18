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

# Expor porta (Railway usa variável PORT)
EXPOSE 8080

# Variável de ambiente padrão
ENV NODE_ENV=production

# Comando para iniciar usando serve com PORT do Railway
# O serve por padrão escuta em 0.0.0.0 quando especificamos apenas a porta
CMD sh -c "PORT=\${PORT:-8080} && node node_modules/.bin/serve -s dist -l \$PORT"
