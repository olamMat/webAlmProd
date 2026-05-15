<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  title: string;
  value: string | number;
  icon: Component;
  trend?: string;
  trendUp?: boolean;
}>();
</script>

<template>
  <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
    <div class="min-w-0">
      <p class="text-xs font-medium text-slate-500 mb-0.5 truncate">{{ title }}</p>
      <h3 class="text-xl font-bold text-slate-900 truncate">{{ value }}</h3>
      <div v-if="trend" class="mt-1 flex items-center gap-1">
        <span 
          class="text-[10px] font-medium leading-none"
          :class="[trendUp ? 'text-emerald-600' : 'text-rose-600']"
        >
          {{ trend }}
        </span>
      </div>
    </div>
    <div class="p-2 bg-slate-50 rounded-lg flex-shrink-0 ml-3">
      <component :is="icon" class="w-5 h-5 text-indigo-600" />
    </div>
  </div>
</template>
