# =======================
# 1) BUILD (Vite) - Portal (en la RAÍZ) + 4 micro-apps
# =======================
FROM node:20-alpine AS build
WORKDIR /workspace

# ---- Portal raíz (archivos en la RAÍZ del repo) ----
# Copiamos solo lo necesario para mejor cache
COPY package*.json vite.config.js index.html ./portal/
# Si tienes carpeta public/ para assets estáticos del portal, destápala:
# COPY public ./portal/public
COPY src ./portal/src
RUN cd portal && npm ci && npm run build

# Copia los package.json de todas las subcarpetas
COPY appointments-api/package*.json ./appointments-api/
COPY doctors-api/package*.json ./doctors-api/
COPY patients-api/package*.json ./patients-api/
COPY pharmacy-api/package*.json ./pharmacy-api/

# Instala dependencias y compila cada app
COPY appointments-api ./appointments-api
RUN cd appointments-api && npm install && npm run build

COPY doctors-api ./doctors-api
RUN cd doctors-api && npm install && npm run build

COPY patients-api ./patients-api
RUN cd patients-api && npm install && npm run build

COPY pharmacy-api ./pharmacy-api
RUN cd pharmacy-api && npm install && npm run build


# =======================
# 2) RUNTIME (Nginx)
# =======================
FROM nginx:1.25-alpine

# Config de Nginx (SPA en raíz + subrutas) — pon este archivo en la raíz del repo
COPY nginx.conf /etc/nginx/nginx.conf

# Portal (raíz del sitio)
COPY --from=build /workspace/portal/dist /usr/share/nginx/html/

# Copiar los builds de cada app al contenedor
COPY --from=build /workspace/appointments-api/dist /usr/share/nginx/html/appointments
COPY --from=build /workspace/doctors-api/dist /usr/share/nginx/html/doctors
COPY --from=build /workspace/patients-api/dist /usr/share/nginx/html/patients
COPY --from=build /workspace/pharmacy-api/dist /usr/share/nginx/html/pharmacy

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
