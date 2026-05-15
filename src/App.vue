<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const timeoutId = ref<any>(null);
const INACTIVITY_TIME = 10 * 60 * 1000; // 10 minutos

const logoutDueToInactivity = () => {
  if (authStore.user) {
    authStore.logout();
    alert('Tu sesión ha expirado por inactividad. Por favor, inicia sesión de nuevo.');
    router.push('/login');
  }
};

const resetTimer = () => {
  if (timeoutId.value) clearTimeout(timeoutId.value);
  timeoutId.value = setTimeout(logoutDueToInactivity, INACTIVITY_TIME);
};

onMounted(() => {
  // Solo activar si hay un usuario logueado
  if (authStore.user) {
    resetTimer();
  }

  // Eventos para detectar actividad
  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('keydown', resetTimer);
  window.addEventListener('scroll', resetTimer);
  window.addEventListener('click', resetTimer);
});

onUnmounted(() => {
  if (timeoutId.value) clearTimeout(timeoutId.value);
  window.removeEventListener('mousemove', resetTimer);
  window.removeEventListener('keydown', resetTimer);
  window.removeEventListener('scroll', resetTimer);
  window.removeEventListener('click', resetTimer);
});
</script>

<template>
  <router-view></router-view>
</template>

<style>
body {
  @apply antialiased text-slate-900 overflow-hidden bg-slate-50 h-screen w-screen;
}
</style>
