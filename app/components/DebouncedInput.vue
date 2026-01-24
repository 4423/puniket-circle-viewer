<script lang="ts" setup>
const props = defineProps<{
  modelValue: string;
  debounce: number;
}>();

const emit = defineEmits(["update:modelValue"]);

const timeout = ref<ReturnType<typeof setTimeout> | undefined>();

const localValue = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    if (timeout.value) {
      clearTimeout(timeout.value);
    }
    timeout.value = setTimeout(
      () => emit("update:modelValue", newValue),
      props.debounce,
    );
  },
});

onBeforeUnmount(() => {
  if (timeout.value) {
    clearTimeout(timeout.value);
  }
});
</script>

<template>
  <input v-model="localValue" v-bind="$attrs" />
</template>
