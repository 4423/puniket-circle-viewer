<script setup lang="ts">
interface Props {
  msg: string;
}
const props = defineProps<Props>();
</script>

<template>
  <div>
    <p>{{ msg }}</p>
  </div>
</template>
