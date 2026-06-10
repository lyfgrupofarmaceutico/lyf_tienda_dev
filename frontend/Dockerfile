# Frontend Dockerfile - React + Vite + Nginx
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Declarar los argumentos de construcción (Dokploy los inyectará desde la pestaña Environment)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build de producción (Aquí Vite lee la variable e incrusta la URL pública del backend)
RUN npm run build

# Production stage - Nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]