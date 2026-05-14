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
  <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
    <div>
      <p class="text-sm font-medium text-slate-500 mb-1">{{ title }}</p>
      <h3 class="text-2xl font-bold text-slate-900">{{ value }}</h3>
      <div v-if="trend" class="mt-2 flex items-center gap-1">
        <span 
          class="text-xs font-medium"
          :class="[trendUp ? 'text-emerald-600' : 'text-rose-600']"
        >
          {{ trend }}
        </span>
      </div>
    </div>
    <div class="p-3 bg-slate-50 rounded-lg">
      <component :is="icon" class="w-6 h-6 text-indigo-600" />
    </div>
  </div>
</template>
