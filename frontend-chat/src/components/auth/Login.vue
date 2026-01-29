<template>
  <div class="login-container">
    <div class="login-box">
      <div class="header">
        <div class="icon">💬</div>
        <h1>Chat en tiempo real</h1>
        <p>Conéctate y comienza a conversar</p>
      </div>

      <form @submit.prevent="handleJoin" class="form">
        <div class="form-group">
          <label for="nickname">Tu nickname</label>
          <input
            id="nickname"
            ref="inputRef"
            v-model="nickname"
            type="text"
            placeholder="Ingresa tu nombre..."
            maxlength="20"
            :class="{ error: localError }"
            @input="localError = ''"
            required
          />
          <div class="hint">
            <span v-if="!localError" class="hint-text">Mínimo 3 caracteres</span>
            <span v-else class="error-text">{{ localError }}</span>
            <span class="char-count">{{ nickname.length }}/20</span>
          </div>
        </div>

        <button type="submit" :disabled="!isValid || isLoading">
          <span v-if="!isLoading">Entrar al chat</span>
          <span v-else class="spinner"></span>
        </button>
      </form>

      <div class="footer">
        <p>Presiona Enter para entrar ⚡</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useChat } from "../../composables/useChat"

const { joinChat, isLoading, error } = useChat()

const nickname = ref("")
const localError = ref("")
const inputRef = ref(null)

const isValid = computed(() => {
  const trimmed = nickname.value.trim()
  return trimmed.length >= 3 && trimmed.length <= 20
})

const handleJoin = async () => {
  const trimmed = nickname.value.trim()

  if (trimmed.length < 3) {
    localError.value = "El nickname debe tener al menos 3 caracteres"
    return
  }

  if (trimmed.length > 20) {
    localError.value = "El nickname no puede exceder 20 caracteres"
    return
  }

  try {
    await joinChat(trimmed)
    // Si todo va bien, el componente App.vue se encargará de redirigir
  } catch (err) {
    // Mostrar el error específico del backend
    if (err.message.includes('ya está en uso')) {
      localError.value = err.message
    } else {
      localError.value = error.value || "Error al conectar al chat"
    }
  }
}

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--space-lg);
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

.login-box {
  width: 100%;
  max-width: 420px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  box-shadow: var(--shadow-xl);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.header h1 {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.header p {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.form {
  margin-bottom: var(--space-lg);
}

.form-group {
  margin-bottom: var(--space-md);
}

.form-group label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  margin-bottom: var(--space-sm);
}

.form-group input {
  width: 100%;
  padding: var(--space-md);
  font-size: var(--text-base);
  color: var(--text-primary);
  background: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  outline: none;
}

.form-group input:focus {
  border-color: var(--border-focus);
  background: var(--bg-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input.error {
  border-color: var(--error);
}

.form-group input::placeholder {
  color: var(--text-muted);
}

.hint {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-xs);
  font-size: var(--text-xs);
}

.hint-text {
  color: var(--text-tertiary);
}

.error-text {
  color: var(--error);
  font-weight: var(--font-medium);
}

.char-count {
  color: var(--text-muted);
}

button {
  width: 100%;
  padding: var(--space-md);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: white;
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-primary);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.footer {
  text-align: center;
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-secondary);
}

.footer p {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

@media (max-width: 480px) {
  .login-box {
    padding: var(--space-xl);
  }
}
</style>