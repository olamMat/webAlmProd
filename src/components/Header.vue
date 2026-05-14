<script setup lang="ts">
import { Search, X } from 'lucide-vue-next';
import { ref } from 'vue';

const searchQuery = ref('');

defineProps<{
  title: string;
}>();

const emit = defineEmits(['search']);

const handleSearch = () => {
  emit('search', searchQuery.value);
};

const clearSearch = () => {
  searchQuery.value = '';
  emit('search', '');
};
</script>

<template>
  <header class="h-16 w-full bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
    <div class="flex items-center gap-4 flex-1">
      <h2 class="text-xl font-semibold text-slate-800 hidden lg:block">{{ title }}</h2>
      
      <!-- Search Bar -->
      <div class="relative max-w-md w-full ml-0 lg:ml-4">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          type="text" 
          placeholder="Buscar ticket..." 
          class="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
        />
        <button 
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 rounded-full transition-colors"
        >
          <X class="w-3 h-3 text-slate-500" />
        </button>
      </div>
    </div>
    
    <!-- Profile Info (Read Only in Header now) -->
    <div class="flex items-center gap-4 ml-4">
       <span class="text-xs font-medium text-slate-400 italic">Producción v1.0</span>
    </div>
  </header>
</template>
