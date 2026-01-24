<script lang="ts" setup>
import type { Column } from "@tanstack/vue-table";
import DebouncedInput from "~/components/DebouncedInput.vue";

const props = defineProps<{
  column: Column<any, unknown>;
}>();

const columnFilterValue = computed(
  () => props.column.getFilterValue() as string,
);
const sortedUniqueValues = computed(() =>
  Array.from(props.column.getFacetedUniqueValues().keys()).sort(),
);
const isSelectFilter = computed(() => {
  const filterType = (props.column.columnDef.meta as any)?.filterType;
  return filterType === "select";
});
</script>

<template>
  <div class="text-xs font-normal">
    <select
      v-if="isSelectFilter"
      class="border rounded px-2 py-1 align-middle w-full"
      :value="columnFilterValue"
      @change="
        column.setFilterValue(($event.target as HTMLSelectElement).value)
      "
    >
      <option value="">すべて</option>
      <option v-for="value in sortedUniqueValues" :key="value" :value="value">
        {{ value }}
      </option>
    </select>

    <DebouncedInput
      v-else
      class="border rounded px-2 py-1 align-middle w-full"
      type="text"
      :modelValue="columnFilterValue"
      :debounce="100"
      @update:modelValue="(value) => column.setFilterValue(value)"
      :placeholder="`${column.columnDef.header}で検索`"
      :list="column.id + 'list'"
    />
  </div>
</template>
