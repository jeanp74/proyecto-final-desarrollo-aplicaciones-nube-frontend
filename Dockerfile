# -------- 1️⃣ Etapa de construcción: Build con Node --------
FROM node:20-alpine AS build

WORKDIR /web

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

# -------- 2️⃣ Etapa de producción: Nginx --------
FROM nginx:alpine

# Copiar configuración personalizada (la crearás abajo)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los builds de cada app al contenedor
COPY --from=build /web/appointments-api/dist /usr/share/nginx/html/appointments
COPY --from=build /web/doctors-api/dist /usr/share/nginx/html/doctors
COPY --from=build /web/patients-api/dist /usr/share/nginx/html/patients
COPY --from=build /web/pharmacy-api/dist /usr/share/nginx/html/pharmacy

# Crear una página de inicio simple que sirva de "selector"
RUN echo '<!doctype html><html><head><title>Portal Frontend</title></head><body style="font-family:sans-serif;text-align:center;margin-top:40px;"><h1>Portal Frontend</h1><p>Selecciona un módulo:</p><ul><li><a href="/appointments/">Appointments</a></li><li><a href="/doctors/">Doctors</a></li><li><a href="/patients/">Patients</a></li><li><a href="/pharmacy/">Pharmacy</a></li></ul></body></html>' > /usr/share/nginx/html/index.html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
