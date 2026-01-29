<template>
  <div class="input-container">
    <div class="input-wrapper" ref="inputWrapperRef">
      <textarea ref="textareaRef" v-model="text" class="input" placeholder="Escribe un mensaje..." rows="1"
        maxlength="500" @keydown.enter.exact.prevent="handleSend" @input="handleInput"></textarea>

      <div v-if="text.length > 0" class="char-count">
        {{ text.length }}/500
      </div>

      <!-- Botón de emoji con selector -->
      <div class="emoji-container">
        <button class="emoji-btn" @click="toggleEmojiPicker" title="Añadir emoji">
          😊
        </button>

        <!-- Selector de emojis -->
        <div v-if="showEmojiPicker" class="emoji-picker">
          <div class="emoji-header">
            <span class="emoji-title">Emojis</span>
            <button class="close-emoji" @click="toggleEmojiPicker" title="Cerrar">
              ✕
            </button>
          </div>
          <emoji-picker @emoji-click="onEmojiClick"></emoji-picker>
        </div>
      </div>

      <button class="send-btn" :class="{ active: canSend }" :disabled="!canSend" @click="handleSend">
        <svg v-if="!isLoading" class="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
        </svg>
        <span v-else class="spinner"></span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue"
import { useDebounceFn } from "@vueuse/core"
import 'emoji-picker-element'

const props = defineProps({
  sendMessage: { type: Function, required: true },
  emitTyping: { type: Function, required: true },
  isLoading: { type: Boolean, default: false },
})

const text = ref("")
const textareaRef = ref(null)
const inputWrapperRef = ref(null)
const showEmojiPicker = ref(false)

const canSend = computed(() => text.value.trim().length > 0 && !props.isLoading)

const handleSend = async () => {
  if (!canSend.value) return

  const messageToSend = text.value.trim()
  text.value = ""
  resetHeight()
  props.emitTyping(false)

  try {
    await props.sendMessage(messageToSend)
    await nextTick()
    textareaRef.value?.focus()
  } catch (error) {
    console.error("Error:", error)
    // En caso de error, restaurar el mensaje
    text.value = messageToSend
  }
}

const adjustHeight = () => {
  if (!textareaRef.value) return

  textareaRef.value.style.height = 'auto'
  const newHeight = Math.min(textareaRef.value.scrollHeight, 120)
  textareaRef.value.style.height = `${newHeight}px`
}

const resetHeight = () => {
  if (!textareaRef.value) return
  textareaRef.value.style.height = 'auto'
}

const stopTypingDebounced = useDebounceFn(() => {
  props.emitTyping(false)
}, 700)

const handleInput = () => {
  adjustHeight()

  const hasText = text.value.trim().length > 0
  props.emitTyping(hasText)
  stopTypingDebounced()
}


// Funciones para manejar emojis
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const insertEmoji = (emoji) => {
  // Insertar emoji en la posición actual del cursor
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const beforeText = text.value.substring(0, start)
  const afterText = text.value.substring(end)

  text.value = beforeText + emoji + afterText

  // Mover cursor después del emoji
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length
    textarea.focus()
    adjustHeight()
  })
}

const onEmojiClick = (event) => {
  const emoji = event?.detail?.unicode
  if (!emoji) return
  insertEmoji(emoji)
}

const onWindowFocus = () => nextTick(() => textareaRef.value?.focus())

const onDocumentClick = (e) => {
  if (!showEmojiPicker.value) return
  const insidePicker = e.target.closest('emoji-picker')
  const insideButton = e.target.closest('.emoji-btn')
  if (!insidePicker && !insideButton) showEmojiPicker.value = false
}

const onWrapperClick = () => textareaRef.value?.focus()

onMounted(() => {
  nextTick(() => textareaRef.value?.focus())
  window.addEventListener('focus', onWindowFocus)
  document.addEventListener('click', onDocumentClick)
  inputWrapperRef.value?.addEventListener('click', onWrapperClick)
})

onBeforeUnmount(() => {
  props.emitTyping(false)
  window.removeEventListener('focus', onWindowFocus)
  document.removeEventListener('click', onDocumentClick)
  inputWrapperRef.value?.removeEventListener('click', onWrapperClick)
})

</script>

<style scoped>
.input-container {
  background: var(--bg-elevated);
  border-top: 1px solid var(--border-primary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-lg);
  margin: var(--space-md);
  transition: all var(--transition-fast);
}

.input-wrapper:focus-within {
  border-color: var(--border-focus);
  background: var(--bg-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input {
  flex: 1;
  min-height: 36px;
  max-height: 120px;
  padding: var(--space-xs) 0;
  font-size: var(--text-base);
  font-family: inherit;
  color: var(--text-primary);
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  line-height: 1.5;
}

.input::placeholder {
  color: var(--text-muted);
}

.char-count {
  position: absolute;
  bottom: var(--space-xs);
  right: 60px;
  font-size: var(--text-xs);
  color: var(--text-muted);
  pointer-events: none;
}

.emoji-container {
  position: relative;
  flex-shrink: 0;
}

.emoji-btn {
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-btn:hover {
  background: var(--bg-primary);
  border-color: var(--border-focus);
  transform: scale(1.05);
}

.emoji-picker {
  position: absolute;
  bottom: calc(100% + var(--space-sm));
  right: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  min-width: 320px;
}

.emoji-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.emoji-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.close-emoji {
  width: 24px;
  height: 24px;
  font-size: 0.8rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-emoji:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
  padding: var(--space-sm);
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.emoji-item:hover {
  background: var(--bg-secondary);
}

.send-btn {
  width: 44px;
  height: 44px;
  font-size: 1.25rem;
  color: var(--text-muted);
  background: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.send-btn.active {
  color: white;
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
  border-color: transparent;
}

.send-btn.active:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-primary);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
}

.send-btn.active:hover .send-icon {
  transform: scale(1.1);
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.6s linear infinite;
}

emoji-picker {
  width: 320px;
  height: 320px;
  border: none;
}


@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .input-wrapper {
    margin: var(--space-sm);
  }

  .send-btn {
    width: 40px;
    height: 40px;
  }
}
</style>