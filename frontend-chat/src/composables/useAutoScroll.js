import { ref, watch, nextTick } from 'vue'

/**
 * Hook para auto-scroll en contenedores de mensajes
 * @param {Ref} trigger - Valor reactivo que activa el scroll (ej: messages.length)
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - { containerRef, scrollToBottom, isAtBottom, userHasScrolled }
 */
export function useAutoScroll(trigger, options = {}) {
  const {
    threshold = 100, // Distancia del fondo para considerar "at bottom"
    behavior = 'smooth', // 'smooth' o 'auto'
    enabled = true
  } = options

  const containerRef = ref(null)
  const isAtBottom = ref(true)
  const userHasScrolled = ref(false)

  const checkIfAtBottom = () => {
    if (!containerRef.value) return false

    const { scrollTop, scrollHeight, clientHeight } = containerRef.value
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight

    isAtBottom.value = distanceFromBottom < threshold
    return isAtBottom.value
  }

  const scrollToBottom = async (force = false) => {
    await nextTick()

    if (!containerRef.value) return

    if (force || (!userHasScrolled.value && isAtBottom.value)) {
      containerRef.value.scrollTo({
        top: containerRef.value.scrollHeight,
        behavior: force ? 'auto' : behavior
      })

      isAtBottom.value = true
      if (force) {
        userHasScrolled.value = false // Resetear estado si es forzado
      }
    }
  }

  const handleScroll = () => {
    checkIfAtBottom()

    // Si el usuario scrollea hacia arriba, marcamos que ha scrolleado
    if (!isAtBottom.value) {
      userHasScrolled.value = true
    }
  }

  watch(trigger, () => {
    if (enabled) {
      scrollToBottom()
    }
  })

  watch(containerRef, (newContainer, oldContainer) => {
    if (oldContainer) {
      oldContainer.removeEventListener('scroll', handleScroll)
    }

    if (newContainer) {
      newContainer.addEventListener('scroll', handleScroll)
      checkIfAtBottom()
    }
  })

  return {
    containerRef,
    scrollToBottom,
    isAtBottom,
    userHasScrolled
  }
}

export function useSimpleAutoScroll(trigger) {
  const containerRef = ref(null)

  watch(trigger, async () => {
    await nextTick()
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight
    }
  })

  return { containerRef }
}