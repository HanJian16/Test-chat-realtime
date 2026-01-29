# 💬 Chat Realtime – Fullstack

Aplicación de chat en tiempo real desarrollada como proyecto fullstack.

El objetivo del proyecto es demostrar:
- Comunicación en tiempo real
- Manejo de estado global
- Arquitectura clara frontend / backend
- Buenas prácticas en Vue 3 y NestJS

---

## 🧱 Tecnologías

### Frontend
- Vue 3 (Composition API)
- Vite
- Pinia
- Socket.IO Client

### Backend
- NestJS
- Socket.IO
- TypeScript

---

## 📁 Estructura del proyecto

.
├── backend-chat/      # Backend (NestJS)
├── frontend-chat/     # Frontend (Vue 3)
└── README.md          # Este archivo

---

## ✅ Requisitos

- Node.js 18+ (recomendado 20)
- npm

Verificar versiones:
node -v
npm -v

---

## 🚀 Puesta en marcha

### 1️⃣ Levantar el backend

cd backend-chat
npm install
npm run start:dev

El backend quedará disponible en:
http://localhost:3000

---

### 2️⃣ Levantar el frontend

En otra terminal:

cd frontend-chat
npm install

Crear archivo .env en la raíz del frontend con el siguiente contenido:
VITE_SOCKET_URL=http://localhost:3000

Luego ejecutar:
npm run dev

El frontend estará disponible en:
http://localhost:5173

---

## 🧪 Pruebas básicas

- Abrir el frontend en dos pestañas o navegadores
- Usar nicknames distintos

Probar:
- Envío de mensajes
- Usuarios online
- Indicador “escribiendo…”
- Mensajes del sistema (join / leave)

---

## ℹ️ Notas importantes

- El backend no persiste datos
- Los mensajes se almacenan en memoria
- Al reiniciar el servidor se pierde el historial
- No hay autenticación (intencional)
