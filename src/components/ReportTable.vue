<script setup lang="ts">
import { computed } from 'vue';
import { Table as TableIcon, FileQuestion, Trash2, Edit2 } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const props = defineProps<{
  data: any[];
  loading: boolean;
}>();

const emit = defineEmits(['refresh', 'delete', 'edit']);

// RBAC
const userCargo = computed(() => authStore.user?.Cargo?.toLowerCase() || '');
const isAdmin = computed(() => userCargo.value === 'admin');
const canEditOrDelete = computed(() => isAdmin.value);

const headers = computed(() => {
  if (props.data.length === 0) return [];
  return Object.keys(props.data[0]);
});

const formatHeader = (header: string) => {
  return header
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, ' ');
};

const formatValue = (value: any) => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  
  if (typeof value === 'string' && value.includes('/Date(')) {
    const timestamp = parseInt(value.match(/\/Date\((\d+)\)\//)?.[1] || '0');
    if (timestamp) {
      return new Date(timestamp).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }

  if (typeof value === 'object') return JSON.stringify(value);
  return value;
};
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
    <!-- Table Header -->
    <div class="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky left-0">
      <div class="flex items-center gap-2">
        <TableIcon class="w-5 h-5 text-indigo-600" />
        <h3 class="font-semibold text-slate-800">Registros de Producción</h3>
      </div>
      
      <div class="flex items-center gap-3">
        <div v-if="!loading && data.length > 0" class="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
          {{ data.length }} registros
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-20 flex flex-col items-center justify-center space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p class="text-slate-500 font-medium">Cargando datos...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="data.length === 0" class="p-20 flex flex-col items-center justify-center text-center">
      <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <FileQuestion class="w-8 h-8 text-slate-300" />
      </div>
      <h4 class="text-slate-800 font-semibold">No se encontraron registros</h4>
      <p class="text-slate-500 text-sm max-w-xs mx-auto mt-1">
        Prueba con otro número de ticket o limpia el buscador.
      </p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
      <table class="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr class="bg-slate-50/50">
            <th v-if="canEditOrDelete" class="px-6 py-4 text-xs font-bold text-slate-400 uppercase border-b border-slate-100 sticky left-0 bg-slate-50/50 z-10">
              Acciones
            </th>
            <th 
              v-for="header in headers" 
              :key="header"
              class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap"
            >
              {{ formatHeader(header) }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr 
            v-for="(row, index) in data" 
            :key="index"
            class="hover:bg-indigo-50/30 transition-colors group"
          >
            <td v-if="canEditOrDelete" class="px-6 py-4 whitespace-nowrap sticky left-0 bg-white group-hover:bg-indigo-50/30 border-b border-slate-100 transition-colors">
              <div class="flex items-center gap-2">
                <button 
                  @click="emit('edit', row)"
                  class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all"
                  title="Editar"
                >
                  <Edit2 class="w-4 h-4" />
                </button>
                <button 
                  @click="emit('delete', row)"
                  class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                  title="Eliminar"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
            <td 
              v-for="header in headers" 
              :key="header"
              class="px-6 py-4 text-sm text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs"
            >
              {{ formatValue(row[header]) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
