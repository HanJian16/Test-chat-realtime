import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createUser } from '../models/user.model'
import { createMessage } from '../models/message.model'

export const useChatStore = defineStore('chat', () => {
  // State
  const user = ref(null)
  const users = ref([])
  const messages = ref([])
  const isConnected = ref(false)

  // Getters
  const onlineUsers = computed(() =>
    users.value.filter(u => u.status === 'online')
  )

  const offlineUsers = computed(() =>
    users.value.filter(u => u.status === 'offline')
  )

  const userCount = computed(() => users.value.length)

  const messageCount = computed(() => messages.value.length)

  const sortedMessages = computed(() => messages.value)


  const isCurrentUser = computed(() => (nickname) => {
    return user.value?.nickname === nickname
  })

  // Actions
  function setUser(nickname) {
    user.value = { nickname }
  }

  function clearUser() {
    user.value = null
  }

  function setUsers(userList) {
    users.value = (userList || []).map(u => createUser(u))
  }


  function addUser(newUser) {
    const normalized = createUser(newUser || {})
    const exists = users.value.find(u => u.nickname === normalized.nickname)
    if (!exists) users.value.push(normalized)
  }


  function removeUser(nickname) {
    users.value = users.value.filter(u => u.nickname !== nickname)
  }

  function updateUserStatus(nickname, status) {
    const user = users.value.find(u => u.nickname === nickname)
    if (user) {
      user.status = status
    }
  }

  function addMessage(message) {
    const normalized = createMessage(message || {})
    const item = {
      id: message?.id ?? Date.now() + Math.random(),
      ...normalized,
    }

    // inserción ordenada (O(n), pero sin re-sort completo)
    const idx = messages.value.findIndex(m => compareByTime(item, m) < 0)
    if (idx === -1) messages.value.push(item)
    else messages.value.splice(idx, 0, item)
  }



  function clearMessages() {
    messages.value = []
  }

  function setMessages(messageList) {
    messages.value = (messageList || [])
      .map(m => ({
        id: m?.id ?? Date.now() + Math.random(),
        ...createMessage(m || {}),
      }))
      .sort(compareByTime)
  }



  function setConnected(status) {
    isConnected.value = status
  }

  function resetStore() {
    user.value = null
    users.value = []
    messages.value = []
    isConnected.value = false
  }

  function compareByTime(a, b) {
    return new Date(a.time).getTime() - new Date(b.time).getTime()
  }


  return {
    // State
    user,
    users,
    messages,
    isConnected,

    // Getters
    onlineUsers,
    offlineUsers,
    userCount,
    messageCount,
    sortedMessages,
    isCurrentUser,

    // Actions
    setUser,
    clearUser,
    setUsers,
    addUser,
    removeUser,
    updateUserStatus,
    addMessage,
    clearMessages,
    setMessages,
    setConnected,
    resetStore
  }
})