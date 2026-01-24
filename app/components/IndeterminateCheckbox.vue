<template>
  <input
    type="checkbox"
    ref="inputRef"
    :class="`${className} cursor-pointer`"
    :indeterminate="indeterminate"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  indeterminate?: boolean;
  className?: string;
}>();

const { indeterminate, className } = toRefs(props);

const inputRef = ref<any>(null);
</script>
