<template>
  <div class="circle-list">
    <h2>{{ data.title }}</h2>
    <div
      v-if="selectedRowCount"
      id="info-override"
      class="vgt-selection-info-row clearfix">
      {{ selectedRowCount }} 件のサークル情報が選択されています
      <a
        href=""
        v-on:click.prevent="unselectAll()">
        クリア
      </a> 
      <div class="vgt-selection-info-row__actions vgt-pull-right">
        <div class="action">
          <button 
            title="選択したサークル情報を CSV ファイルとしてダウンロードします"
            v-on:click="exportCSV">
            サークル情報をダウンロード
          </button>
        </div>
      </div>
    </div>
    <vue-good-table
      ref="table"
      :columns="columns"
      :rows="data.data"
      @on-column-filter="onColumnFilter"
      @on-selected-rows-change="onSelectionChanged"
      :select-options="{
        enabled: true,
        selectOnCheckboxOnly: true,
        selectionInfoClass: 'hidden-selection-info',
        selectionText: '件のサークル情報が選択されています',
        clearSelectionText: 'クリア',
      }">
      <!-- <div slot="selected-row-actions" class="action">
        <button
          title="選択したサークル情報を CSV ファイルとしてダウンロードします"
          v-on:click="exportCSV">
          サークル情報をダウンロード
        </button>
      </div> -->
      <template slot="table-row" slot-scope="props">
        <span v-if="props.column.field == 'twitter'">
          <a
            v-if="props.row.twitter"
            :href="urlFromScreenName(props.row.twitter)"
            target="_blank">
            {{ props.row.twitter }}
          </a> 
        </span>
        <span
          v-else-if="props.column.field == 'links'"
          class="column-links">
          <span v-if="props.row.links">
            <a
              v-if="props.row.links.pixiv"
              :href="props.row.links.pixiv"
              class="pixiv"
              target="_blank">
              <img src="../assets/logo_icon_r.png" />
            </a>
            <a
              v-if="props.row.links.hp"
              :href="props.row.links.hp"
              class="hp"
              target="_blank">
              <font-awesome-icon :icon="faHome" />
            </a>
          </span>
        </span>
        <span v-else>
          {{props.formattedRow[props.column.field]}}
        </span>
      </template>
    </vue-good-table>
  </div>
</template>

<script>
import { VueGoodTable } from 'vue-good-table';
import { faHome } from '@fortawesome/free-solid-svg-icons'

export default {
  name: 'CircleList',
  props: {
    data: Object
  },
  components: {
    VueGoodTable,
  },
  methods: {
    columnStringFilterFn: (data, filterString) => data.includes(filterString),
    columnLinksFilterFn: (data, filterString) => {
      var result = false
      if (data) {
        if (data.hp) {
          result = data.hp.includes(filterString)
        }
        if (data.pixiv) {
          result = result || data.pixiv.includes(filterString)
        }
      }
      return result
    },
    urlFromScreenName: (screenName) => screenName ? screenName.replace("@", "https://twitter.com/") : "",
    filterDropdownItems: function () {
      return this.data.events.sort((a, b) => {
        const an = Number(a.substring(0, a.indexOf("：")))
        const bn = Number(b.substring(0, b.indexOf("：")))
        if (!an && !bn) {
          return a - b
        }
        else {
          return an - bn
        }
      })
    },
    defaultSelectedRows: function () {
      var res = {}
      this.data.data?.map(row => row.place)?.forEach(p => res[p] = false)
      return res
    },
    unselectAll: function () {
      Object.keys(this.isSelectedRows).forEach(k => this.isSelectedRows[k] = false)
      this.$refs['table']?.unselectAllInternal(true)
    },
    onSelectionChanged: function () {
      const rows = this.$refs['table']?.filteredRows[0]?.children
      rows.forEach(row => {
        this.isSelectedRows[row.place] = row.vgtSelected
      })
    },
    onColumnFilter: function () {
      const table = this.$refs['table']
      table?.rows?.forEach(row => {
        table.$set(row, 'vgtSelected', this.isSelectedRows[row.place])
      })
    },
    exportCSV: function () {
      const rows = this.$refs['table']?.rows?.filter(row => this.isSelectedRows[row.place])
      if (!rows) {
        return
      } 
      const header = '"サークル名","ペンネーム","配置番号","サークルURL","twitter","pixiv","参加イベント"\n'
      const contents = rows.map(row => {
        const arr = [
          row.circle, 
          row.name,
          row.place,
          row.links.hp,
          this.urlFromScreenName(row.twitter),
          row.links.pixiv,
          row.event,
        ]
        return arr
          .map(s => '"' + (s ? s.replace(/"/g, '""') : '') + '"')
          .join(",")
      })
      const csv = header + contents.join("\n")
      this.downloadCSV(csv, "circle-list.csv")
    },
    downloadCSV: function (csv, name) {
      const a = document.createElement('a');
      const bom = '\uFEFF';
      const blob = new Blob([bom, csv], { type: 'text/csv' });
      a.download = name;
      a.href = window.URL.createObjectURL(blob);

      document.body.appendChild(a);
      a.click();
      a.parentNode.removeChild(a);
    },
  },
  computed: {
    selectedRowCount: function () {
      return Object.values(this.isSelectedRows).filter(isSelected => isSelected).length
    },
  },
  data(){
    return {
      isSelectedRows: this.defaultSelectedRows(),
      faHome: faHome,
      columns: [
        {
          label: '配置番号',
          field: 'place',
          filterOptions: {
            enabled: true,
            filterFn: this.columnStringFilterFn,
          },
        },
        {
          label: 'サークル名',
          field: 'circle',
          filterOptions: {
            enabled: true,
            filterFn: this.columnStringFilterFn,
          },
        },
        {
          label: 'ペンネーム',
          field: 'name',
          filterOptions: {
            enabled: true,
            filterFn: this.columnStringFilterFn,
          },
        },
        {
          label: 'Twitter',
          field: 'twitter',
          filterOptions: {
            enabled: true,
            filterFn: this.columnStringFilterFn,
          },
        },
        {
          label: 'リンク',
          field: 'links',
          sortable: false,
          filterOptions: {
            enabled: true,
            filterFn: this.columnLinksFilterFn,
          },
        },
        {
          label: '参加イベント',
          field: 'event',
          filterOptions: {
            enabled: true,
            filterDropdownItems: this.filterDropdownItems(),
          },
        },
      ],
    };
  },
  watch: {
    data: function () {
      this.columns[5].filterOptions.filterDropdownItems = this.filterDropdownItems()
    },
  },
}
</script>

<style scoped>
h2 {
  margin: 1.5em 0;
}

.circle-list {
  min-width: 700px;
}

.column-links a {
  width: 24px;
  height: 24px;
  margin: 0;
  margin-right: 12px;
  vertical-align: middle;
}
.hp svg {
  width: 24px;
  height: 24px;
  color: #222;
  margin: 0;
  padding: 0;
  font-size: 20px;
  vertical-align: middle;
}
.pixiv img {
  width: 24px;
  height: 24px;
  margin: 0;
  padding: 0;
  vertical-align: middle;
}

.action {
  margin: -2px;
}
.action button {
  font-size: .95em;
}
</style>

<style>
table {
  font-size: 0.9em !important;
}
th {
  vertical-align: middle !important;
}
td {
  vertical-align: middle !important;
}

/* 
  フィルタされた行に選択行がない場合でも選択情報を表示したい。
  オリジナルの表示は隠して、それに対応した表示で上書きする。
*/
.hidden-selection-info {
  display: none;
}
</style>