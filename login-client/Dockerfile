# -------- FRONTEND BUILD (Vite) --------
FROM node:20-alpine AS webbuild
WORKDIR /web
COPY package*.json ./
RUN npm ci
COPY . .
# Como front y API estarán en el mismo dominio, base "/"
ARG VITE_API_LOGIN_BASE=/
ENV VITE_API_LOGIN_BASE=${VITE_API_LOGIN_BASE}
RUN npm run build

# -------- RUNTIME (Nginx) --------
FROM nginx:1.25-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=webbuild /web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
