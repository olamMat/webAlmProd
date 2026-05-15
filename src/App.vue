<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';
import { Clock, LogOut } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const timeoutId = ref<any>(null);
const showTimeoutModal = ref(false);
const INACTIVITY_TIME = 10 * 60 * 1000; // 10 minutos

const logoutDueToInactivity = () => {
  if (authStore.user) {
    authStore.logout();
    showTimeoutModal.value = true;
  }
};

const goToLogin = () => {
  showTimeoutModal.value = false;
  router.push('/login');
};

const resetTimer = () => {
  if (timeoutId.value) clearTimeout(timeoutId.value);
  // Solo iniciar si el modal de timeout no está visible y hay usuario
  if (authStore.user && !showTimeoutModal.value) {
    timeoutId.value = setTimeout(logoutDueToInactivity, INACTIVITY_TIME);
  }
};

onMounted(() => {
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
  <div class="relative min-h-screen">
    <router-view></router-view>

    <!-- Modal de Sesión Expirada -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showTimeoutModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

        <!-- Modal Content -->
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center border border-slate-100">
          <div class="mx-auto w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <Clock class="w-10 h-10 text-indigo-600 animate-pulse" />
          </div>

          <h2 class="text-2xl font-bold text-slate-900 mb-2">Sesión Expirada</h2>
          <p class="text-slate-500 mb-8 leading-relaxed">
            Tu sesión se ha cerrado automáticamente después de <span class="font-semibold text-slate-700">10 minutos</span> de inactividad por tu seguridad.
          </p>

          <button 
            @click="goToLogin"
            class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group"
          >
            <LogOut class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Volver a Iniciar Sesión
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
body {
  @apply antialiased text-slate-900 overflow-hidden bg-slate-50 h-screen w-screen;
}
</style>
