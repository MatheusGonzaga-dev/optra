# Dockerfile para Frontend - Optra Vision
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build do frontend
RUN npm run build

# Stage de produção - usar Nginx para servir arquivos estáticos
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 80

# Nginx já inicia automaticamente
CMD ["nginx", "-g", "daemon off;"]

