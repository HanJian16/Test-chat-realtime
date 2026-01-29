// composables/useSocket.js
import { onMounted, onUnmounted, ref } from 'vue'
import { socket } from '../services/socket'

// Map para trackear listeners por evento y evitar duplicados
const activeListeners = new Map()

/**
 * Hook para escuchar eventos de socket con cleanup automático
 * @param {string} event - Nombre del evento
 * @param {Function} handler - Función callback
 */
export function useSocket(event, handler) {
  onMounted(() => {
    // Si ya existe un listener para este evento, no agregar otro
    if (!activeListeners.has(event)) {
      socket.on(event, handler)
      activeListeners.set(event, handler)
    }
  })

  onUnmounted(() => {
    // Solo remover si este es el handler activo
    if (activeListeners.get(event) === handler) {
      socket.off(event, handler)
      activeListeners.delete(event)
    }
  })
}

/**
 * Hook para emitir eventos con tracking de estado
 * @returns {Object} - { emit, isLoading, error }
 */
export function useSocketEmit() {
  const isLoading = ref(false)
  const error = ref(null)

  const emit = async (event, data) => {
    isLoading.value = true
    error.value = null

    try {
      return new Promise((resolve, reject) => {
        socket.emit(event, data)
        
        // Para eventos como 'join' y 'message', no esperamos respuesta del backend
        // Simplemente resolvemos inmediatamente
        resolve()
      })
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Nueva función para emitir con respuesta
  const emitWithResponse = async (event, data) => {
    isLoading.value = true
    error.value = null

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        isLoading.value = false
        reject(new Error('Timeout: No response from server'))
      }, 5000)

      // Escuchar respuestas
      const successHandler = (response) => {
        clearTimeout(timeout)
        socket.off(`${event}_success`, successHandler)
        socket.off(`${event}_error`, errorHandler)
        isLoading.value = false
        resolve(response)
      }

      const errorHandler = (response) => {
        clearTimeout(timeout)
        socket.off(`${event}_success`, successHandler)
        socket.off(`${event}_error`, errorHandler)
        isLoading.value = false
        reject(new Error(response.message))
      }

      socket.on(`${event}_success`, successHandler)
      socket.on(`${event}_error`, errorHandler)
      
      // Emitir evento
      socket.emit(event, data)
    })
  }

  return {
    emit,
    emitWithResponse,
    isLoading,
    error
  }
}

/**
 * Hook para manejar el estado de conexión
 */
export function useSocketConnection() {
  const isConnected = ref(socket.connected)
  const connectionError = ref(null)

  const handleConnect = () => {
    isConnected.value = true
    connectionError.value = null
  }

  const handleDisconnect = () => {
    isConnected.value = false
  }

  const handleConnectError = (error) => {
    connectionError.value = error.message
  }

  onMounted(() => {
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
  })

  onUnmounted(() => {
    socket.off('connect', handleConnect)
    socket.off('disconnect', handleDisconnect)
    socket.off('connect_error', handleConnectError)
  })

  const reconnect = () => {
    socket.connect()
  }

  return {
    isConnected,
    connectionError,
    reconnect
  }
}