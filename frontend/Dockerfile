# Frontend Dockerfile - React + Vite + Nginx
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# 1. ARGS que Dokploy inyectara al compilar
ARG VITE_API_URL
ARG VITE_WHATSAPP_NUMBER

# 2. Se convierten a ENV para que el bundler (Vite/Webpack) los lea
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WHATSAPP_NUMBER=$VITE_WHATSAPP_NUMBER

COPY package*.json ./
RUN npm ci

COPY . .

# 3. Comando de build para el frontend
RUN npm run build

# Production stage - Nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]