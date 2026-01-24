<template>
  <div>
    <h2 class="text-2xl font-bold my-8">{{ title }}</h2>

    <div
      v-if="table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()"
      class="flex items-between text-sm px-2 py-1 pr-1 border-r border-l border-t border-gray-300 bg-yellow-50"
    >
      <div class="flex items-center gap-4">
        <span class="font-bold text-yellow-600 text-sm">
          {{ table.getSelectedRowModel().rows.length }}
          件のサークルが選択されています
        </span>
        <button
          @click="table.toggleAllRowsSelected(false)"
          class="underline text-blue-500 hover:text-blue-700"
        >
          リセット
        </button>
      </div>
      <div class="flex justify-end flex-1">
        <button
          type="button"
          title="選択したサークルの情報を CSV ファイルとしてダウンロードします"
          @click="exportCSV"
          class="py-1 px-2 rounded bg-slate-100 hover:bg-slate-200 border border-gray-300 text-xs"
        >
          サークル情報をダウンロード
        </button>
      </div>
    </div>

    <table
      class="w-full table-auto border-collapse text-sm border border-gray-300"
    >
      <thead class="bg-gray-100">
        <tr
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
          class="align-middle"
        >
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            :colSpan="header.colSpan"
            :class="[
              header.column.getCanSort() ? 'cursor-pointer select-none' : '',
              'whitespace-nowrap text-left border-r border-b',
            ]"
            @click="header.column.getToggleSortingHandler()?.($event)"
          >
            <template v-if="!header.isPlaceholder">
              <div
                :class="[
                  header.column.getCanSort()
                    ? 'inline-flex items-center justify-between gap-1 w-full pl-1.5 pr-2 py-2'
                    : 'flex justify-center', // select checkbox header
                ]"
                ,
              >
                <FlexRender
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
                <SortIndicator
                  v-if="header.column.getCanSort()"
                  :sorted="header.column.getIsSorted()"
                />
              </div>
            </template>
          </th>
        </tr>
        <tr
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            :colSpan="header.colSpan"
            class="whitespace-nowrap text-left border-r border-b"
          >
            <template
              v-if="!header.isPlaceholder && header.column.getCanFilter()"
            >
              <Filter :column="header.column" class="m-1" />
            </template>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in table.getRowModel().rows" :key="row.id">
          <td
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            class="border-b border-r border-gray-200 align-middle p-2 text-left"
          >
            <FlexRender
              :render="cell.column.columnDef.cell"
              :props="cell.getContext()"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import {
  type ColumnFiltersState,
  FlexRender,
  type RowSelectionState,
  type SortingState,
  createColumnHelper,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import PixivIcon from "~/components/icons/PixivIcon.vue";
import HomeIcon from "~/components/icons/HomeIcon.vue";
import IconLink from "~/components/IconLink.vue";
import IndeterminateCheckbox from "~/components/IndeterminateCheckbox.vue";
import type { Circle } from "~/types/circle";
import SortIndicator from "~/components/SortIndicator.vue";
import Filter from "~/components/Filter.vue";

const props = defineProps<{
  title: string;
  circles: Circle[];
}>();

const columnHelper = createColumnHelper<Circle>();
const rowSelection = ref<RowSelectionState>({});

const columns = [
  {
    id: "select",
    header: ({ table }: { table: any }) => {
      return h(IndeterminateCheckbox, {
        checked: table.getIsAllRowsSelected(),
        indeterminate: table.getIsSomeRowsSelected(),
        onChange: table.getToggleAllRowsSelectedHandler(),
      });
    },
    cell: ({ row }: { row: any }) => {
      return h("div", { class: "px-1" }, [
        h(IndeterminateCheckbox, {
          checked: row.getIsSelected(),
          disabled: !row.getCanSelect(),
          onChange: row.getToggleSelectedHandler(),
        }),
      ]);
    },
  },
  columnHelper.accessor("place", {
    header: "配置番号",
  }),
  columnHelper.accessor("circle", {
    header: "サークル名",
  }),
  columnHelper.accessor("name", {
    header: "ペンネーム",
  }),
  columnHelper.accessor("links.twitter", {
    header: "Twitter",
    cell: (info) => {
      const twitterUrl = info.getValue();
      return twitterUrl
        ? h(
            "a",
            {
              href: twitterUrl,
              target: "_blank",
              rel: "noopener noreferrer",
              class: "text-blue-500 underline hover:text-blue-700",
            },
            "@" + twitterUrl.substring(twitterUrl.lastIndexOf("/") + 1),
          )
        : "";
    },
  }),
  columnHelper.accessor("links", {
    header: "リンク",
    cell: (info) => {
      const links = info.getValue();
      return h(
        "div",
        { class: "flex items-center gap-2" },
        [
          links.hp &&
            h(
              IconLink,
              { href: links.hp, title: "サークルURL" },
              { default: () => h(HomeIcon) },
            ),
          links.pixiv &&
            h(
              IconLink,
              { href: links.pixiv, title: "pixiv" },
              { default: () => h(PixivIcon) },
            ),
        ].filter(Boolean),
      );
    },
  }),
  columnHelper.accessor("event", {
    header: "参加イベント",
    cell: (info) => info.getValue(),
    meta: {
      filterType: "select",
    },
  }),
];
const data = ref(props.circles);
const columnFilters = ref<ColumnFiltersState>([]);
const sorting = ref<SortingState>([]);

const table = useVueTable({
  get data() {
    return data.value;
  },
  columns,
  state: {
    get columnFilters() {
      return columnFilters.value;
    },
    get sorting() {
      return sorting.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
  },
  enableRowSelection: true, //enable row selection for all rows
  onColumnFiltersChange: (updaterOrValue) => {
    columnFilters.value =
      typeof updaterOrValue === "function"
        ? updaterOrValue(columnFilters.value)
        : updaterOrValue;
  },
  onSortingChange: (updaterOrValue) => {
    sorting.value =
      typeof updaterOrValue === "function"
        ? updaterOrValue(sorting.value)
        : updaterOrValue;
  },
  onRowSelectionChange: (updateOrValue) => {
    rowSelection.value =
      typeof updateOrValue === "function"
        ? updateOrValue(rowSelection.value)
        : updateOrValue;
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
});

const exportCSV = () => {
  const rows = table.getSelectedRowModel().rows.map((row) => row.original);
  const csv = buildCSV(rows);
  downloadCSV(csv, "circle-list.csv");
};
const buildCSV = (rows: Circle[]): string => {
  const header =
    '"サークル名","ペンネーム","配置番号","サークルURL","Twitter","pixiv","参加イベント"\n';
  const contents = rows.map((row) => {
    const arr = [
      row.circle,
      row.name,
      row.place,
      row.links.hp,
      row.links.twitter,
      row.links.pixiv,
      row.event,
    ];
    return arr
      .map((s) => '"' + (s ? s.replace(/"/g, '""') : "") + '"')
      .join(",");
  });
  return header + contents.join("\n");
};
const downloadCSV = (csv: string, name: string) => {
  const a = document.createElement("a");
  const bom = "\uFEFF";
  const blob = new Blob([bom, csv], { type: "text/csv" });
  a.download = name;
  a.href = window.URL.createObjectURL(blob);

  document.body.appendChild(a);
  a.click();
  a.parentNode?.removeChild(a);
};
</script>
