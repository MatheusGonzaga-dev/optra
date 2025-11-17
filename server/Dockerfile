# Dockerfile para Backend - Optra Vision
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY src ./src

# Build do TypeScript
RUN npm run build

# Stage de produção
FROM node:20-alpine

WORKDIR /app

# Copiar package.json e instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --only=production

# Copiar arquivos buildados do stage anterior
COPY --from=builder /app/dist ./dist

# Expor porta
EXPOSE 4000

# Variável de ambiente padrão
ENV NODE_ENV=production
ENV PORT=4000

# Comando para iniciar
CMD ["node", "dist/index.js"]

