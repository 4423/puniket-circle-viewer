<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    :title="title"
    class="flex items-center justify-center w-6 h-6 text-gray-700 hover:text-blue-600"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
defineProps<{
  href: string;
  title: string;
}>();
</script>
