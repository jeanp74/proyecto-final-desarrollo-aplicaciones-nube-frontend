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

# ---- Appointments (/appointments-api/src) ----
COPY appointments-api/src/package*.json ./appointments/
RUN cd appointments && npm ci
COPY appointments-api/src ./appointments
RUN npm run build --prefix ./appointments

# ---- Doctors (/doctors-api/src) ----
COPY doctors-api/src/package*.json ./doctors/
RUN cd doctors && npm ci
COPY doctors-api/src ./doctors
RUN npm run build --prefix ./doctors

# ---- Patients (/patients-api/src) ----
COPY patients-api/src/package*.json ./patients/
RUN cd patients && npm ci
COPY patients-api/src ./patients
RUN npm run build --prefix ./patients

# ---- Pharmacy (/pharmacy-api/src) ----
COPY pharmacy-api/src/package*.json ./pharmacy/
RUN cd pharmacy && npm ci
COPY pharmacy-api/src ./pharmacy
RUN npm run build --prefix ./pharmacy


# =======================
# 2) RUNTIME (Nginx)
# =======================
FROM nginx:1.25-alpine

# Config de Nginx (SPA en raíz + subrutas) — pon este archivo en la raíz del repo
COPY nginx.conf /etc/nginx/nginx.conf

# Portal (raíz del sitio)
COPY --from=build /workspace/portal/dist /usr/share/nginx/html/

# Micro-Apps en subdirectorios
COPY --from=build /workspace/appointments/dist /usr/share/nginx/html/appointments/
COPY --from=build /workspace/doctors/dist      /usr/share/nginx/html/doctors/
COPY --from=build /workspace/patients/dist     /usr/share/nginx/html/patients/
COPY --from=build /workspace/pharmacy/dist     /usr/share/nginx/html/pharmacy/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
