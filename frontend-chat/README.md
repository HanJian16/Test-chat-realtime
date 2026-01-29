# 💬 Chat Frontend – Vue 3

Frontend del chat en tiempo real.

Responsable de:
- Interfaz de usuario
- Manejo de estado global
- Comunicación con el backend vía WebSockets

---

## 🛠 Tecnologías

- Vue 3 (Composition API)
- Vite
- Pinia
- Socket.IO Client

---

## 📁 Estructura principal

src/
├── components/chat/
│   ├── ChatLayout.vue
│   ├── MessageList.vue
│   ├── MessageInput.vue
│   └── UserList.vue
├── composables/
│   ├── useChat.js
│   └── useSocket.js
├── stores/
│   └── chat.js
└── services/
    └── socket.js

---

## ⚙️ Instalación

npm install

---

## ▶️ Ejecutar en desarrollo

npm run dev

La aplicación estará disponible en:
http://localhost:5173

---

## 🌍 Variables de entorno

Crear archivo .env en la raíz del proyecto:

VITE_SOCKET_URL=http://localhost:3000

---

## 🧠 Estado global

El estado global se maneja con Pinia e incluye:
- Usuario actual
- Mensajes
- Usuarios conectados
- Estado de conexión
- Indicador “escribiendo…”

---

## ✍️ Indicador “escribiendo…”

- Emitido desde MessageInput.vue
- Uso de debounce para evitar spam de eventos
- Escuchado en useChat.js
- Renderizado en ChatLayout.vue

---

## 😊 Emojis

Actualmente incluye:
- Lista simple de emojis
- Inserción en la posición del cursor

La implementación es intencionalmente simple y sin dependencias externas.
