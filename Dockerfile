# Dockerfile Unificado - Backend + Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Build do frontend
COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# Stage do backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Build do backend
COPY server/package*.json ./server/
COPY server/tsconfig.json ./server/
RUN cd server && npm ci

COPY server/src ./server/src
RUN cd server && npm run build

# Stage de produção
FROM node:20-alpine

WORKDIR /app

# Copiar package.json do backend e instalar apenas dependências de produção
COPY server/package*.json ./
RUN npm ci --only=production

# Copiar backend buildado (o código espera em dist/)
COPY --from=backend-builder /app/server/dist ./dist

# Copiar frontend buildado para a raiz (o servidor procura em process.cwd()/dist)
COPY --from=frontend-builder /app/dist ./frontend-dist

# Expor porta dinâmica (Railway define PORT automaticamente)
# EXPOSE é apenas documentação, Railway usa a porta definida em $PORT
EXPOSE 4000

# Variável de ambiente
ENV NODE_ENV=production
# PORT será definido automaticamente pelo Railway em runtime

# Comando para iniciar o servidor unificado
CMD ["node", "dist/index.js"]
