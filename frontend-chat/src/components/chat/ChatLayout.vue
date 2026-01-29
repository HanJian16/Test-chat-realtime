<template>
  <div class="chat-layout">
    <!-- Header móvil -->
    <div class="mobile-header">
      <button class="menu-btn" @click="sidebarOpen = !sidebarOpen">☰</button>
      <h1>💬 Chat</h1>
      <div class="status">
        <span class="dot" :class="{ connected: isConnected }"></span>
        {{ onlineUsers.length }} online
      </div>
    </div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <UserList @close="sidebarOpen = false" />
    </aside>

    <!-- Overlay móvil -->
    <div v-if="sidebarOpen" class="overlay" @click="sidebarOpen = false"></div>

    <!-- Chat principal -->
    <main class="chat-main">
      <div class="messages-area">
        <MessageList :messages="messages" :currentUser="currentUser" />
      </div>

      <div v-if="typingUsers.length" class="typing-indicator">
        <div class="typing-bubble">
          <span class="dots"><i></i><i></i><i></i></span>
        </div>
        <span class="typing-label">{{ typingLabel }}</span>
      </div>

      <MessageInput :sendMessage="sendMessage" :emitTyping="emitTyping" :isLoading="isLoading" />
    </main>
  </div>
</template>


<script setup>
import { ref, computed } from "vue"
import { useChat } from "../../composables/useChat"
import UserList from "./UserList.vue"
import MessageList from "./MessageList.vue"
import MessageInput from "./MessageInput.vue"

const {
  messages,
  currentUser,
  onlineUsers,
  isConnected,
  typingUsers,
  sendMessage,
  emitTyping,
  isLoading,
} = useChat()

const sidebarOpen = ref(false)

const typingLabel = computed(() => {
  const list = typingUsers.value || []
  if (list.length === 0) return ""

  if (list.length === 1) return `${list[0]} está escribiendo...`
  if (list.length === 2) return `${list[0]} y ${list[1]} están escribiendo...`

  return `${list[0]}, ${list[1]} y ${list.length - 2} más están escribiendo...`
})
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: 100vh;
}

/* Header móvil - oculto en desktop */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-primary);
}

.menu-btn {
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  border-radius: var(--radius-md);
}

.menu-btn:hover {
  background: var(--bg-secondary);
}

.mobile-header h1 {
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.status {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 4px 8px;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
}

.dot {
  width: 6px;
  height: 6px;
  background: #6b7280;
  border-radius: 50%;
  transition: background var(--transition-fast);
}

.dot.connected {
  background: var(--success);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

/* Sidebar */
.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-elevated);
  border-right: 1px solid var(--border-primary);
  flex-shrink: 0;
}

.overlay {
  display: none;
}

/* Chat principal */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.messages-area {
  flex: 1;
  min-height: 0;
  /* clave para scroll en flex */
  display: flex;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: 0 var(--space-md) var(--space-sm);
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.typing-bubble {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  min-width: 44px;
  padding: 0 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 999px;
}

.dots {
  display: inline-flex;
  gap: 4px;
}

.dots i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: .35;
  animation: dot-bounce 1.2s infinite;
}

.dots i:nth-child(2) {
  animation-delay: .2s;
}

.dots i:nth-child(3) {
  animation-delay: .4s;
}

@keyframes dot-bounce {

  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: .35;
  }

  40% {
    transform: translateY(-4px);
    opacity: 1;
  }
}


/* Responsive - Tablet y móvil */
@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }

  .chat-layout {
    flex-direction: column;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1000;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

  .chat-main {
    height: calc(100vh - 64px);
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 80vw;
    max-width: 320px;
  }
}
</style>