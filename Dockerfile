# =======================
# 1) BUILD (Vite) - Portal (en la RAÍZ) + 4 micro-apps
# =======================
FROM node:20-alpine AS build
WORKDIR /workspace

# INICIO VARIBALES DE ENTORNO
ARG VITE_PHARMACY_API
ENV VITE_PHARMACY_API=$VITE_PHARMACY_API
ARG VITE_APPOINTMENTS_API
ENV VITE_APPOINTMENTS_API=$VITE_APPOINTMENTS_API
ARG VITE_PATIENTS_API
ENV VITE_PATIENTS_API=$VITE_PATIENTS_API
ARG VITE_DOCTORS_API
ENV VITE_DOCTORS_API=$VITE_DOCTORS_API
ARG VITE_GATEWAY
ENV VITE_GATEWAY=$VITE_GATEWAY
# FIN VARIBALES DE ENTORNO

# ---- Portal raíz (archivos en la RAÍZ del repo) ----
# Copiamos solo lo necesario para mejor cache
COPY package*.json vite.config.js index.html ./portal/
# Si tienes carpeta public/ para assets estáticos del portal, destápala:
# COPY public ./portal/public
COPY src ./portal/src
RUN cd portal && npm ci && npm run build

# Copia los package.json de todas las subcarpetas
COPY appointments-client/package*.json ./appointments-client/
COPY doctors-client/package*.json ./doctors-client/
COPY patients-client/package*.json ./patients-client/
COPY pharmacy-client/package*.json ./pharmacy-client/

# Instala dependencias y compila cada app
COPY appointments-client ./appointments-client
RUN cd appointments-client && npm install && npm run build

COPY doctors-client ./doctors-client
RUN cd doctors-client && npm install && npm run build

COPY patients-client ./patients-client
RUN cd patients-client && npm install && npm run build

COPY pharmacy-client ./pharmacy-client
RUN cd pharmacy-client && npm install && npm run build


# =======================
# 2) RUNTIME (Nginx)
# =======================
FROM nginx:1.25-alpine

# Config de Nginx (SPA en raíz + subrutas) — pon este archivo en la raíz del repo
COPY nginx.conf /etc/nginx/nginx.conf

# Portal (raíz del sitio)
COPY --from=build /workspace/portal/dist /usr/share/nginx/html/

# Copiar los builds de cada app al contenedor
COPY --from=build /workspace/appointments-client/dist /usr/share/nginx/html/appointments
COPY --from=build /workspace/doctors-client/dist /usr/share/nginx/html/doctors
COPY --from=build /workspace/patients-client/dist /usr/share/nginx/html/patients
COPY --from=build /workspace/pharmacy-client/dist /usr/share/nginx/html/pharmacy

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
