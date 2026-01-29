# 💬 Chat Backend – NestJS

Backend del chat en tiempo real.

Se encarga de:
- Manejar conexiones WebSocket
- Gestionar usuarios conectados
- Emitir mensajes y eventos en tiempo real

---

## 🛠 Tecnologías

- NestJS
- Socket.IO
- TypeScript
- Node.js

---

## 📁 Estructura principal

src/
├── chat/
│   ├── chat.gateway.ts   # WebSocket Gateway
│   ├── chat.service.ts   # Lógica de mensajes
│   └── chat.types.ts
├── users/
│   ├── users.service.ts  # Gestión de usuarios
│   └── user.types.ts
└── main.ts

---

## ⚙️ Instalación

npm install

---

## ▶️ Ejecutar en desarrollo

npm run start:dev

El servidor quedará disponible en:
http://localhost:3000

---

## 🔌 Eventos WebSocket

Cliente → Servidor

- join: Unirse al chat con nickname
- message: Enviar mensaje
- typing: Indicador de escritura
- leave: Salir del chat

Servidor → Cliente

- message: Nuevo mensaje
- users: Lista de usuarios
- typing: Usuario escribiendo
- system_message: Mensajes del sistema
- chat_history: Historial reciente

---

## 🧠 Notas de diseño

- Los datos se almacenan en memoria
- No se utiliza base de datos
- Pensado para simplicidad y claridad
- Ideal para pruebas técnicas
