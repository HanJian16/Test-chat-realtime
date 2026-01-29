<template>
  <div class="messages-container">
    <div class="messages" ref="containerRef">
      <div v-for="(msg, index) in props.messages" :key="msg?.id ?? index" class="message-wrapper" :class="{
        'is-me': isMe(msg.user),
        'is-system': msg.isSystem
      }">
        <!-- Mensaje del sistema con diseño especial -->
        <div v-if="msg.isSystem" class="system-message">
          <span class="system-icon">{{ getSystemIcon(msg.type) }}</span>
          <span class="system-text">{{ msg.message }}</span>
          <span class="system-time">{{ formatTime(msg.time) }}</span>
        </div>

        <!-- Mensaje regular -->
        <div v-else class="message">
          <!-- Avatar para mensajes de otros -->
          <div v-if="!isCurrentUser(msg.user)" class="avatar" :style="getAvatarColor(msg.user)">
            {{ getInitials(msg.user) }}
          </div>

          <div class="content">
            <!-- Header con nombre y hora (solo para mensajes de otros) -->
            <div v-if="!isCurrentUser(msg.user)" class="header">
              <span class="user">{{ msg.user }}</span>
              <span class="time">{{ formatTime(msg.time) }}</span>
            </div>

            <!-- Burbuja del mensaje -->
            <div class="bubble">
              <p>{{ msg.message }}</p>
              <span v-if="isCurrentUser(msg.user)" class="time">
                {{ formatTime(msg.time) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="props.messages.length === 0" class="empty">
        <div class="empty-icon">💬</div>
        <h3>No hay mensajes</h3>
        <p>Sé el primero en escribir</p>
      </div>
    </div>

    <!-- Botón scroll to bottom -->
    <button v-if="!isAtBottom" class="scroll-btn" @click="scrollToBottom(true)">
      ↓
    </button>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from "vue"

const props = defineProps({
  messages: { type: Array, default: () => [] },
  currentUser: { type: Object, default: null },
})

const isMe = (nickname) => props.currentUser?.nickname === nickname

// Auto scroll simplificado
const containerRef = ref(null)
const isAtBottom = ref(true)

const scrollToBottom = (force = false) => {
  nextTick(() => {
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight
      isAtBottom.value = true
    }
  })
}

const checkIfAtBottom = () => {
  if (!containerRef.value) return

  const { scrollTop, scrollHeight, clientHeight } = containerRef.value
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight
  isAtBottom.value = distanceFromBottom < 50
}

const handleScroll = () => {
  checkIfAtBottom()
}

// Auto-scroll cuando hay nuevos mensajes
watch(() => props.messages.length, () => {
  if (isAtBottom.value) scrollToBottom()
})

// Listener para scroll automático al volver a la ventana
const handleShouldScrollToBottom = () => {
  scrollToBottom(true)
}

onMounted(() => {
  window.addEventListener('shouldScrollToBottom', handleShouldScrollToBottom)
})

// Watch para cuando el container esté disponible
watch(containerRef, (newContainer) => {
  if (newContainer) {
    newContainer.addEventListener('scroll', handleScroll)
    checkIfAtBottom() // Verificar estado inicial

    // Scroll inicial al fondo cuando se monta el componente
    nextTick(() => {
      scrollToBottom(true)
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('shouldScrollToBottom', handleShouldScrollToBottom)
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', handleScroll)
  }
})

// Methods
const isCurrentUser = (nickname) => {
  return props.currentUser?.nickname === nickname
}

const formatTime = (iso) => {
  if (!iso) return ''
  const date = new Date(iso)
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getInitials = (nickname) => {
  if (!nickname) return '?'
  return nickname.substring(0, 2).toUpperCase()
}

const getAvatarColor = (nickname) => {
  if (!nickname) return {}

  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16',
    '#10b981', '#14b8a6', '#06b6d4', '#3b82f6',
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'
  ]

  const hash = nickname.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)

  return {
    backgroundColor: colors[Math.abs(hash) % colors.length],
    color: '#fff'
  }
}

const getSystemIcon = (type) => {
  switch (type) {
    case 'user_joined':
      return '👋'
    case 'user_left':
      return '👋'
    default:
      return 'ℹ️'
  }
}
</script>

<style scoped>
.messages-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: var(--bg-primary);
}

.messages {
  height: 100%;
  overflow-y: auto;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-wrapper.is-me {
  align-items: flex-end;
}

.message-wrapper.is-system {
  align-items: center;
  margin: var(--space-md) 0;
}

.system-message {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-full);
  max-width: fit-content;
  animation: systemSlideIn 0.3s ease;
}

@keyframes systemSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.system-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.system-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
  font-weight: var(--font-medium);
}

.system-time {
  font-size: var(--text-xs);
  color: var(--text-muted);
  opacity: 0.8;
}

.message {
  display: flex;
  gap: var(--space-sm);
  max-width: 70%;
  align-items: flex-start;
}

.message-wrapper.is-me .message {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message-wrapper:not(.is-me) .message {
  align-self: flex-start;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  border-radius: 50%;
  flex-shrink: 0;
}

.content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  flex: 1;
  min-width: 0;
}

.header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0 var(--space-sm);
}

.user {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
}

.time {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.bubble {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  word-wrap: break-word;
}

.message-wrapper.is-me .bubble {
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
  border: none;
  color: white;
}

.message-wrapper.is-me .bubble .time {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-align: right;
  display: block;
  width: 100%;
}

.bubble p {
  font-size: var(--text-sm);
  margin: 0;
}

.bubble .time {
  display: inline-block;
  margin-left: var(--space-sm);
  opacity: 0.8;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
  opacity: 0.5;
}

.empty h3 {
  font-size: var(--text-xl);
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.empty p {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.scroll-btn {
  position: absolute;
  bottom: var(--space-xl);
  right: var(--space-xl);
  width: 44px;
  height: 44px;
  font-size: 1.25rem;
  color: var(--text-secondary);
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: 50%;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.scroll-btn:hover {
  background: var(--primary-600);
  color: white;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .messages {
    padding: var(--space-md);
  }

  .message {
    max-width: 80%;
  }

  .scroll-btn {
    bottom: var(--space-lg);
    right: var(--space-md);
  }
}
</style>