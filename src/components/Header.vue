<script setup lang="ts">
import { Search, X, Menu } from 'lucide-vue-next';
import { ref } from 'vue';

const searchQuery = ref('');

defineProps<{
  title: string;
}>();

const emit = defineEmits(['search', 'toggleMenu']);

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
    <div class="flex items-center gap-2 md:gap-4 flex-1">
      <!-- Menu Button for Mobile -->
      <button 
        @click="emit('toggleMenu')"
        class="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
      >
        <Menu class="w-6 h-6" />
      </button>

      <h2 class="text-lg md:text-xl font-semibold text-slate-800 hidden md:block">{{ title }}</h2>
      
      <!-- Search Bar -->
      <div class="relative max-w-md w-full ml-0 md:ml-4">
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
    <div class="flex items-center gap-4 ml-2">
       <span class="text-[10px] md:text-xs font-medium text-slate-400 italic whitespace-nowrap">v1.0.0</span>
    </div>
  </header>
</template>
