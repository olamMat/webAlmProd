<script setup lang="ts">
import { LayoutDashboard, LogOut, FileSpreadsheet, PlusCircle, UserCircle } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { computed } from 'vue';

const router = useRouter();
const authStore = useAuthStore();

const emit = defineEmits(['addTicket', 'exportExcel']);

const userCargo = computed(() => authStore.user?.Cargo?.toLowerCase() || '');

const isAdmin = computed(() => userCargo.value === 'admin');
const isVista = computed(() => userCargo.value === 'vista');

// Permisos
const canCreate = computed(() => isAdmin.value || !isVista.value);
const canExport = computed(() => true); // Todos pueden exportar

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <aside class="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 z-30">
    <div class="p-6">
      <h1 class="text-xl font-bold text-white tracking-tight flex items-center gap-2">
        <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-black text-xs">R</span>
        </div>
        Reporte Produc
      </h1>
    </div>

    <div class="px-4 mb-4">
      <div class="flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <div class="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
          <UserCircle class="w-5 h-5 text-indigo-400" />
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-xs font-bold text-white truncate">{{ authStore.user?.NombreApellidos || authStore.user?.Login }}</span>
          <span class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{{ authStore.user?.Cargo || 'Usuario' }}</span>
        </div>
      </div>
    </div>

    <nav class="flex-1 px-4 space-y-6">
      <!-- Main Nav -->
      <div class="space-y-1">
        <p class="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Menú Principal</p>
        <router-link
          to="/"
          class="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-600 text-white transition-colors group"
        >
          <LayoutDashboard class="w-5 h-5 text-white" />
          <span class="font-medium">Dashboard</span>
        </router-link>
      </div>

      <!-- Actions -->
      <div class="space-y-1">
        <p class="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Acciones</p>
        
        <button 
          v-if="canCreate"
          @click="emit('addTicket')"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group"
        >
          <PlusCircle class="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
          <span class="font-medium">Nuevo Ticket</span>
        </button>

        <button 
          @click="emit('exportExcel')"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group"
        >
          <FileSpreadsheet class="w-5 h-5 text-amber-400 group-hover:text-amber-300" />
          <span class="font-medium">Exportar Excel</span>
        </button>
      </div>
    </nav>

    <div class="p-4 border-t border-slate-800">
      <button 
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors group"
      >
        <LogOut class="w-5 h-5 group-hover:text-red-400" />
        <span class="font-medium">Cerrar Sesión</span>
      </button>
      <div class="mt-4 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
        v1.0.0 &copy; 2026
      </div>
    </div>
  </aside>
</template>
