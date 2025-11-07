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
