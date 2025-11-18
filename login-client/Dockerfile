# -------- FRONTEND BUILD (Vite) --------
FROM node:20-alpine AS webbuild
WORKDIR /web

# Instalar deps
COPY package*.json ./
RUN npm ci

# Copiar el resto
COPY . .

# INICIO VARIBALES DE ENTORNO
ARG VITE_GATEWAY
ENV VITE_GATEWAY=$VITE_GATEWAY
# FIN VARIBALES DE ENTORNO


# Construir
RUN npm run build

# -------- RUNTIME (Nginx) --------
FROM nginx:1.25-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=webbuild /web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]