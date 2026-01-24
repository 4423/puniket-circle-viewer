<script setup lang="ts">
import type { SortDirection } from "@tanstack/vue-table";

type SortState = false | SortDirection;

defineProps<{
  sorted: SortState;
}>();
</script>

<template>
  <span class="flex flex-col items-center justify-center gap-0.5">
    <!-- asc -->
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      :class="
        sorted === 'asc'
          ? 'fill-current text-gray-900'
          : 'fill-current text-gray-300'
      "
      class="block"
    >
      <polygon points="5,0 10,6 0,6" />
    </svg>

    <!-- desc -->
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      :class="
        sorted === 'desc'
          ? 'fill-current text-gray-900'
          : 'fill-current text-gray-300'
      "
      class="block"
    >
      <polygon points="0,0 10,0 5,6" />
    </svg>
  </span>
</template>
