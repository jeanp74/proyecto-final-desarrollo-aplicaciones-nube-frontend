# -------- FRONTEND BUILD (Vite) --------
FROM node:20-alpine AS webbuild
WORKDIR /web

# Instalar deps con caché óptima
COPY package*.json ./
RUN npm ci

# Copiar el resto (src, vite.config.js, index.html, etc.)
COPY . .

# Recibe la URL del backend en tiempo de build
ARG VITE_API_LOGIN_BASE="/"
# OPCIONAL pero muy recomendado: genera un .env para que Vite lo lea seguro
RUN echo "VITE_API_LOGIN_BASE=${VITE_API_LOGIN_BASE}" > .env

# Construir
RUN npm run build

# -------- RUNTIME (Nginx) --------
FROM nginx:1.25-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=webbuild /web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]