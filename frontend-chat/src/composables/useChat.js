import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useSocket, useSocketEmit } from './useSocket'
import { useChatStore } from '../stores/chat'
import { socket } from '../services/socket'

export function useChat() {
  const chatStore = useChatStore()
  const { emit, emitWithResponse, isLoading, error } = useSocketEmit()

  const isLoadingHistory = ref(false)

  const isWindowActive = ref(true)
  const lastMessageCount = ref(0)
  const unreadCount = ref(0)
  const originalTitle = ref(document.title)

  const messages = computed(() => chatStore.sortedMessages)
  const users = computed(() => chatStore.users)
  const currentUser = computed(() => chatStore.user)
  const onlineUsers = computed(() => chatStore.onlineUsers)
  const isConnected = computed(() => chatStore.isConnected)

  // ✅ Multi-typing
  const typingUsers = ref([]) // array de nicknames
  const typingTimers = new Map() // nickname -> timeoutId

  const addTyping = (nickname) => {
    if (!nickname) return

    // añadir si no existe
    if (!typingUsers.value.includes(nickname)) {
      typingUsers.value = [...typingUsers.value, nickname]
    }

    // reset timeout del usuario
    if (typingTimers.has(nickname)) clearTimeout(typingTimers.get(nickname))
    const t = setTimeout(() => {
      removeTyping(nickname)
    }, 1500)
    typingTimers.set(nickname, t)
  }

  const removeTyping = (nickname) => {
    if (!nickname) return

    if (typingTimers.has(nickname)) {
      clearTimeout(typingTimers.get(nickname))
      typingTimers.delete(nickname)
    }
    typingUsers.value = typingUsers.value.filter((n) => n !== nickname)
  }

  const clearTypingAll = () => {
    typingTimers.forEach((t) => clearTimeout(t))
    typingTimers.clear()
    typingUsers.value = []
  }

  const sendMessage = async (text) => {
    if (!text || !text.trim()) return
    await emit('message', text.trim())
    resetUnreadCount()
  }

  const joinChat = async (nickname) => {
    if (!nickname || !nickname.trim()) throw new Error('Nickname is required')
    const response = await emitWithResponse('join', nickname.trim())
    chatStore.setUser(nickname.trim())
    chatStore.setConnected(true)
    return response
  }

  const leaveChat = () => {
    socket.emit('leave')
    chatStore.resetStore()
    clearTypingAll()
  }

  const emitTyping = (isTyping = true) => {
    socket.emit('typing', { typing: isTyping })
  }

  useSocket('message', (message) => {
    chatStore.addMessage(message)
    if (!isWindowActive.value) {
      unreadCount.value++
      updateTitle()
    }
  })

  useSocket('users', (userList) => chatStore.setUsers(userList))

  useSocket('system_message', (systemMsg) => {
    chatStore.addMessage({
      user: 'Sistema',
      message: systemMsg.message,
      time: systemMsg.time,
      isSystem: true,
      type: systemMsg.type,
      systemUser: systemMsg.user
    })
  })

  useSocket('chat_history', (msgs) => chatStore.setMessages(msgs))

  useSocket('connect', () => chatStore.setConnected(true))

  useSocket('disconnect', () => {
    chatStore.setConnected(false)
    clearTypingAll()
  })

  useSocket('typing', (payload) => {
    console.log('[typing]', payload)
    const nick = payload?.nickname
    if (payload?.typing) addTyping(nick)
    else removeTyping(nick)
  })

  const updateTitle = () => {
    document.title = unreadCount.value > 0
      ? `(${unreadCount.value}) ${originalTitle.value}`
      : originalTitle.value
  }

  const resetUnreadCount = () => {
    unreadCount.value = 0
    updateTitle()
  }

  const handleVisibilityChange = () => {
    const wasHidden = !isWindowActive.value
    isWindowActive.value = !document.hidden
    if (isWindowActive.value && wasHidden) resetUnreadCount()
  }

  const handleFocus = () => {
    const wasInactive = !isWindowActive.value
    isWindowActive.value = true
    if (wasInactive) resetUnreadCount()
  }

  const handleBlur = () => {
    isWindowActive.value = false
    lastMessageCount.value = messages.value.length
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    lastMessageCount.value = messages.value.length
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('focus', handleFocus)
    window.removeEventListener('blur', handleBlur)
    clearTypingAll()
  })

  return {
    messages,
    users,
    currentUser,
    onlineUsers,
    isConnected,
    typingUsers,
    isLoading,
    isLoadingHistory,
    error,
    sendMessage,
    joinChat,
    leaveChat,
    emitTyping,
  }
}
