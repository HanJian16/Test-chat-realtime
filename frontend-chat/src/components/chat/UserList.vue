<template>
  <div class="user-list">
    <div class="header">
      <div class="header-content">
        <h3>👥 Usuarios</h3>
        <span class="count">{{ otherUsersCount }}</span>
      </div>
      <button v-if="isMobile" class="close-btn" @click="$emit('close')">✕</button>
    </div>

    <div class="users">
      <div
        v-for="user in otherUsers"
        :key="user.nickname"
        class="user"
        :class="{
          'is-offline': user.status === 'offline'
        }"
      >
        <div class="avatar" :style="getAvatarColor(user.nickname)">
          {{ getInitials(user.nickname) }}
        </div>

        <div class="info">
          <div class="name">
            {{ user.nickname }}
          </div>
          <div class="status">
            <span class="dot" :class="user.status"></span>
            {{ user.status === 'online' ? 'En línea' : 'Desconectado' }}
          </div>
        </div>
      </div>

      <!-- Mensaje si no hay otros usuarios -->
      <div v-if="otherUsers.length === 0" class="empty-users">
        <p>No hay otros usuarios conectados</p>
      </div>
    </div>

    <div class="footer">
      <div class="current-user">
        <div class="avatar small" :style="getAvatarColor(currentUser?.nickname)">
          {{ getInitials(currentUser?.nickname) }}
        </div>
        <div class="info">
          <div class="name">{{ currentUser?.nickname }}</div>
          <div class="status-text">En línea</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue"
import { useChatStore } from "../../stores/chat"

defineEmits(['close'])

const chatStore = useChatStore()
const isMobile = ref(false)

const users = computed(() => chatStore.users)
const currentUser = computed(() => chatStore.user)

const otherUsers = computed(() => {
  const filtered = users.value.filter(user => !isCurrentUser(user.nickname))
  
  // Ordenar: primero online (alfabético), luego offline (alfabético)
  return filtered.sort((a, b) => {
    // Primero por status (online primero)
    if (a.status === 'online' && b.status === 'offline') return -1
    if (a.status === 'offline' && b.status === 'online') return 1
    
    // Si mismo status, ordenar alfabéticamente
    return a.nickname.localeCompare(b.nickname)
  })
})

const otherUsersCount = computed(() => otherUsers.value.length)

const sortedUsers = computed(() => {
  return [...users.value].sort((a, b) => {
    if (isCurrentUser(a.nickname)) return -1
    if (isCurrentUser(b.nickname)) return 1
    if (a.status === 'online' && b.status === 'offline') return -1
    if (a.status === 'offline' && b.status === 'online') return 1
    return a.nickname.localeCompare(b.nickname)
  })
})

const isCurrentUser = (nickname) => {
  return chatStore.isCurrentUser(nickname)
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

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.user-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-primary);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.header h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 var(--space-xs);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
}

.close-btn {
  width: 32px;
  height: 32px;
  font-size: var(--text-lg);
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  border-radius: var(--radius-md);
}

.close-btn:hover {
  background: var(--bg-secondary);
}

.users {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
}

.user {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-xs);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.user:hover {
  background: var(--bg-secondary);
}

.user.is-offline {
  opacity: 0.6;
}

.empty-users {
  text-align: center;
  padding: var(--space-lg);
  color: var(--text-tertiary);
}

.empty-users p {
  font-size: var(--text-sm);
  margin: 0;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  border-radius: 50%;
  flex-shrink: 0;
}

.avatar.small {
  width: 32px;
  height: 32px;
  font-size: var(--text-xs);
}

.info {
  flex: 1;
  min-width: 0;
}

.name {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: 2px;
}

.badge {
  padding: 2px 6px;
  font-size: 0.625rem;
  font-weight: var(--font-semibold);
  color: var(--primary-600);
  background: rgba(59, 130, 246, 0.15);
  border-radius: var(--radius-sm);
  text-transform: uppercase;
}

.status {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot.online {
  background: var(--success);
}

.dot.offline {
  background: #6b7280;
}

.footer {
  padding: var(--space-lg);
  border-top: 1px solid var(--border-primary);
}

.current-user {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.status-text {
  font-size: var(--text-xs);
  color: var(--success);
  font-weight: var(--font-medium);
}
</style>