# -------- FRONTEND BUILD (Vite) --------
FROM node:20-alpine AS webbuild
WORKDIR /web

# Instalar deps
COPY package*.json ./
RUN npm ci

# Copiar el resto
COPY . .

# # Recibe la URL del backend en tiempo de build
# ARG VITE_LOGIN_API_BASE="/"
# RUN echo "VITE_LOGIN_API_BASE=${VITE_LOGIN_API_BASE}" > .env

# Construir
RUN npm run build

# -------- RUNTIME (Nginx) --------
FROM nginx:1.25-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=webbuild /web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]