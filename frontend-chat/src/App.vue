<template>
  <Login v-if="!chatStore.user" />
  <ChatLayout v-else />
</template>

<script setup>
import { useChatStore } from './stores/chat'
import Login from "./components/auth/Login.vue";
import ChatLayout from "./components/chat/ChatLayout.vue";
import "./assets/styles/global.css";

const chatStore = useChatStore()
</script>
