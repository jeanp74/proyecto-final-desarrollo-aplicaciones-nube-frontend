# -------- FRONTEND BUILD (Vite) --------
FROM node:20-alpine AS webbuild
WORKDIR /web
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
# Como front y API estarán en el mismo dominio, base "/"
ARG VITE_API_LOGIN_BASE=/
ENV VITE_API_LOGIN_BASE=${VITE_API_LOGIN_BASE}
RUN npm run build
