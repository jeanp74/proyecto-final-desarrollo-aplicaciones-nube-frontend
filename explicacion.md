# Documento Técnico: Sistema de Gestión Médica

## 📋 1. Arquitectura General

Tu sistema está construido sobre una **arquitectura de microservicios** que consta de los siguientes componentes:

- **Frontend (React)**: Apps independientes para cada módulo (appointments, doctors, patients, pharmacy).
- **API Gateway**: Servicio centralizado que enruta las peticiones a los microservicios backend.
- **Servicios Backend**: APIs independientes para cada dominio (doctors, patients, appointments, pharmacy).
- **Bases de Datos**: PostgreSQL para doctors, patients, appointments y MongoDB para pharmacy.
- **Autenticación**: Sistema de login con JWT y roles (admin, doctor, patient).

---

## 🧱 2. Funcionalidad de cada módulo

### 2.1. Login
- **Tecnología**: React + Express + JWT
- **Funcionalidad**: Autenticación de usuarios y generación de tokens JWT con roles.
- **Flujo**:
  - El usuario ingresa email y contraseña.
  - El gateway valida las credenciales contra una base de usuarios.
  - Retorna un token JWT con el rol del usuario.

### 2.2. Doctors
- **Tecnología**: React + Express + PostgreSQL
- **Funcionalidad**: Gestión de médicos (CRUD).
- **Endpoints**:
  - `GET /doctors`: Listar médicos
  - `POST /doctors`: Crear médico
  - `PUT /doctors/:id`: Actualizar médico
  - `DELETE /doctors/:id`: Eliminar médico

### 2.3. Patients
- **Tecnología**: React + Express + PostgreSQL
- **Funcionalidad**: Gestión de pacientes (CRUD).
- **Endpoints**:
  - `GET /patients`: Listar pacientes
  - `POST /patients`: Crear paciente
  - `PUT /patients/:id`: Actualizar paciente
  - `DELETE /patients/:id`: Eliminar paciente

### 2.4. Appointments
- **Tecnología**: React + Express + PostgreSQL
- **Funcionalidad**: Gestión de citas médicas.
- **Endpoints**:
  - `GET /appointments`: Listar citas
  - `POST /appointments`: Crear cita
  - `PUT /appointments/:id`: Actualizar cita
  - `DELETE /appointments/:id`: Eliminar cita

### 2.5. Pharmacy
- **Tecnología**: React + Express + MongoDB
- **Funcionalidad**: Gestión de medicamentos y recetas.
- **Endpoints**:
  - `GET /medicines`: Listar medicamentos
  - `POST /medicines`: Crear medicamento
  - `PUT /medicines/:id/stock`: Ajustar stock
  - `POST /prescriptions`: Crear receta (descuenta stock)

---

## 🌐 3. API Gateway

- **Tecnología**: Express + node-fetch
- **Funcionalidad**: Enrutamiento de peticiones a los microservicios backend.
- **Características**:
  - Valida el token JWT en cada petición.
  - Enruta `/api/doctors/*` → backend de doctors.
  - Enruta `/api/patients/*` → backend de patients.
  - Enruta `/api/appointments/*` → backend de appointments.
  - Enruta `/api/pharmacy/*` → backend de pharmacy.
  - Reenvía el token JWT a los microservicios.

---

## 🐳 4. Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Explicación de comandos:

- `FROM node:18-alpine`: Usa una imagen base de Node.js 18 en Alpine Linux (ligera).
- `WORKDIR /app`: Define el directorio de trabajo dentro del contenedor.
- `COPY package*.json ./`: Copia los archivos de dependencias.
- `RUN npm install`: Instala las dependencias del proyecto.
- `COPY . .`: Copia todos los archivos del proyecto al contenedor.
- `EXPOSE 3000`: Expone el puerto 3000 (donde corre la app).
- `CMD ["npm", "start"]`: Comando que inicia la aplicación.

---

## 🚀 5. deploy.yml

```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm install
    - name: Build
      run: npm run build
    - name: Deploy to Azure
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'my-app'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
```

### Explicación de comandos:

- `name: Deploy to Azure`: Nombre del flujo de CI/CD.
- `on: push`: Se ejecuta cuando se hace push a la rama `main`.
- `runs-on: ubuntu-latest`: Ejecuta en un entorno Ubuntu.
- `uses: actions/checkout@v2`: Clona el código del repositorio.
- `uses: actions/setup-node@v2`: Configura Node.js versión 18.
- `run: npm install`: Instala dependencias.
- `run: npm run build`: Compila la aplicación.
- `uses: azure/webapps-deploy@v2`: Despliega en Azure App Service.
- `app-name: 'my-app'`: Nombre del recurso en Azure.
- `publish-profile`: Credenciales de Azure (almacenadas como secreto).

---

## 🔐 6. Autenticación y Autorización

- **JWT (JSON Web Token)**: Se usa para autenticar usuarios.
- **Roles**: `admin`, `doctor`, `patient`.
- **Permisos**:
  - `admin`: Acceso a todos los módulos.
  - `doctor`: Acceso a appointments, doctors, pharmacy.
  - `patient`: Acceso a appointments, patients, pharmacy.

---

## 🔄 7. Flujo de comunicación entre servicios

1. El usuario inicia sesión en el **login**.
2. El gateway devuelve un **token JWT**.
3. El frontend almacena el token en `localStorage`.
4. Cada petición al gateway incluye el token en el header `Authorization: Bearer <token>`.
5. El gateway valida el token y enruta la petición al microservicio correspondiente.
6. El microservicio responde con los datos solicitados.

---

## 🧪 8. Tecnologías usadas

- **Frontend**: React, Vite, CSS
- **Backend**: Node.js, Express
- **Bases de datos**: PostgreSQL, MongoDB
- **API Gateway**: Node.js, Express, node-fetch
- **Contenedores**: Docker
- **Despliegue**: GitHub Actions + Azure App Service

---