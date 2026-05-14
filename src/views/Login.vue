<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { Lock, User, Loader2 } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const login = ref('');
const pass = ref('');

const handleLogin = async () => {
  if (!login.value || !pass.value) return;
  
  const success = await authStore.login({
    Login: login.value,
    Pass: pass.value
  });
  
  if (success) {
    router.push('/');
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
          <span class="text-white font-black text-xl">R</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-800">Reporte Produc</h1>
        <p class="text-slate-500 mt-2">Ingresa tus credenciales para continuar</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Usuario</label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              v-model="login"
              type="text" 
              required
              class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="nombre.apellido"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              v-model="pass"
              type="password" 
              required
              class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div v-if="authStore.error" class="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg border border-red-100">
          {{ authStore.error }}
        </div>

        <button 
          type="submit" 
          :disabled="authStore.loading"
          class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
        >
          <Loader2 v-if="authStore.loading" class="w-5 h-5 animate-spin" />
          {{ authStore.loading ? 'Verificando...' : 'Iniciar Sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>
