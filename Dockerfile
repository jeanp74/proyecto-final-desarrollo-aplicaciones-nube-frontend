# =======================
# 1) BUILD (Vite) - Portal + 4 micro-apps
# =======================
FROM node:20-alpine AS build
WORKDIR /workspace

# ---- Portal raíz (repo/src) ----
# Si tu portal tiene package.json dentro de /src (como mostraste):
# COPY src/package*.json ./portal/
# RUN cd portal && npm ci
# COPY src ./portal
# RUN npm run build --prefix ./portal
# Si tu package.json del portal estuviera en la raíz del repo, usarías:
COPY package*.json ./portal/
RUN cd portal && npm ci
COPY . ./portal
RUN npm run build --prefix ./portal

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

# Nginx conf global que maneja SPA en raíz y en subrutas:
# (coloca este nginx.conf al lado del Dockerfile, en la raíz del repo)
COPY nginx.conf /etc/nginx/nginx.conf

# Copiamos los builds a su destino final
# Portal (raíz del sitio)
COPY --from=build /workspace/portal/dist /usr/share/nginx/html/

# Micro-Apps en subdirectorios
COPY --from=build /workspace/appointments/dist /usr/share/nginx/html/appointments/
COPY --from=build /workspace/doctors/dist      /usr/share/nginx/html/doctors/
COPY --from=build /workspace/patients/dist     /usr/share/nginx/html/patients/
COPY --from=build /workspace/pharmacy/dist     /usr/share/nginx/html/pharmacy/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
