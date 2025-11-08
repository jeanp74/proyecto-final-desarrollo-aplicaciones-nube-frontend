# =======================
# 1) BUILD (Vite)
# =======================
FROM node:20-alpine AS build
WORKDIR /workspace

# ---- Build args que llegan desde el workflow ----
ARG VITE_APPOINTMENTS_API_BASE
ARG VITE_DOCTORS_API_BASE
ARG VITE_PATIENTS_API_BASE
ARG VITE_PHARMACY_API_BASE

# ---- Portal raíz ----
COPY package*.json vite.config.js index.html ./portal/
COPY src ./portal/src
# (opcional) si tu portal también necesita las URLs:
RUN printf "VITE_APPOINTMENTS_API_BASE=%s\nVITE_DOCTORS_API_BASE=%s\nVITE_PATIENTS_API_BASE=%s\nVITE_PHARMACY_API_BASE=%s\n" \
      "$VITE_APPOINTMENTS_API_BASE" "$VITE_DOCTORS_API_BASE" "$VITE_PATIENTS_API_BASE" "$VITE_PHARMACY_API_BASE" > portal/.env
RUN cd portal && npm ci && npm run build

# ---- Appointments ----
COPY appointments-api/ ./appointments-api
RUN printf "VITE_APPOINTMENTS_API_BASE=%s\n" "$VITE_APPOINTMENTS_API_BASE" > appointments-api/.env \
 && cd appointments-api && npm ci && npm run build

# ---- Doctors ----
COPY doctors-api/ ./doctors-api
RUN printf "VITE_DOCTORS_API_BASE=%s\n" "$VITE_DOCTORS_API_BASE" > doctors-api/.env \
 && cd doctors-api && npm ci && npm run build

# ---- Patients ----
COPY patients-api/ ./patients-api
RUN printf "VITE_PATIENTS_API_BASE=%s\n" "$VITE_PATIENTS_API_BASE" > patients-api/.env \
 && cd patients-api && npm ci && npm run build

# ---- Pharmacy ----
COPY pharmacy-api/ ./pharmacy-api
RUN printf "VITE_PHARMACY_API_BASE=%s\n" "$VITE_PHARMACY_API_BASE" > pharmacy-api/.env \
 && cd pharmacy-api && npm ci && npm run build


# =======================
# 2) RUNTIME (Nginx)
# =======================
FROM nginx:1.25-alpine
COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=build /workspace/portal/dist              /usr/share/nginx/html/
COPY --from=build /workspace/appointments-api/dist    /usr/share/nginx/html/appointments
COPY --from=build /workspace/doctors-api/dist         /usr/share/nginx/html/doctors
COPY --from=build /workspace/patients-api/dist        /usr/share/nginx/html/patients
COPY --from=build /workspace/pharmacy-api/dist        /usr/share/nginx/html/pharmacy

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
