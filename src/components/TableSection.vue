<template>
  <section id="table" ref="sectionRef" class="screen py-14 border-t border-line">
    <div class="flex items-end justify-between flex-wrap gap-4 mb-6">
      <div>
        <div class="font-mono text-xs text-amber tracking-widest mb-2">/table</div>
        <h2 class="text-3xl font-bold tracking-tight">Bảng dữ liệu</h2>
        <p class="text-inkdim text-sm mt-1">Sắp xếp, tìm kiếm, phân trang. Bấm một dòng để mở chi tiết.</p>
      </div>
      <div class="flex items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5c6a80" stroke-width="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4-4" />
        </svg>
        <input
          v-model="searchValue"
          placeholder="Tìm kiếm…"
          class="bg-transparent outline-none text-sm font-mono placeholder:text-inkfaint w-40"
        />
      </div>
    </div>

    <div class="rounded-xl border border-line bg-panel overflow-hidden">
      <DataTable
        ref="dtRef"
        :columns="columns"
        :data="tableData"
        :options="dtOptions"
        class="quake-dt w-full"
      >
        <thead>
          <tr>
            <th>ĐỘ LỚN</th>
            <th>ĐỊA ĐIỂM</th>
            <th>ĐỘ SÂU (KM)</th>
            <th>THỜI GIAN</th>
            <th>SÓNG THẦN</th>
          </tr>
        </thead>
        <template #action="props">
            <Button
                :text="`Col 1: ${props.cellData}`"
                @click="rowClick(props.rowData)"
            >Xem</Button>
        </template>
      </DataTable>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import DataTable from 'datatables.net-vue3'
import DataTablesCore from 'datatables.net'
DataTable.use(DataTablesCore)

const props = defineProps({
  quakes: { type: Array, required: true },
})
const emit = defineEmits(['select-quake'])

const dtRef = ref(null)
const searchValue = ref('')
watch(searchValue, val => {
  dtRef.value?.dt?.search(val).draw()
})

const getMagClass = mag => {
  if (mag >= 5)   return 'text-strong'
  if (mag >= 2.5) return 'text-moderate'
  return 'text-quiet'
}

const columns = [
  {
    data: 'magRaw',
    render: d =>
      `<span class="font-mono font-bold ${getMagClass(d)}">${Number(d).toFixed(1)}</span>`,
  },
  { data: 'place' },
  {
    data: 'depthRaw',
    render: d => `<span class="font-mono text-inkdim">${Number(d).toFixed(1)}</span>`,
  },
  {
    data: 'timeRaw',
    render: d =>
      d
        ? new Date(d).toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: '2-digit',
          })
        : '—',
  },
  {
    data: 'tsunami',
    render: d =>
      d
        ? `<span class="font-mono text-[11px] text-amber border border-amber/40 rounded px-2 py-0.5">CÓ</span>`
        : `<span class="text-inkfaint font-mono text-[11px]">—</span>`,
  },
  {
    data: null,
    render: '#action',
    title: 'Action'
  },
]

const tableData = computed(() =>
  (props.quakes || []).map(q => ({
    magRaw:   q.properties?.mag ?? 0,
    place:    q.properties?.place || 'Không rõ vị trí',
    depthRaw: q.geometry?.coordinates?.[2] ?? 0,
    timeRaw:  q.properties?.time ?? 0,
    tsunami:  q.properties?.tsunami === 1,
    original: q,
  }))
)

const dtOptions = {
  pageLength: 7,
  lengthChange: false,
  searching: true, 
  ordering: true,
  order: [[0, 'desc']],
  dom: "t<'dt-footer-row'ip>",     
  language: {
    info: 'Hiển thị _START_–_END_ trong _TOTAL_ trận',
    infoEmpty: 'Không có dữ liệu',
    infoFiltered: '(lọc từ _MAX_ trận)',
    zeroRecords: 'Không tìm thấy kết quả',
    paginate: { previous: '‹', next: '›' },
  },
}
function rowClick(rowData) {
  if (rowData?.original) emit('select-quake', rowData.original)
}
</script>

<style>
.dt-footer-row {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  border-top: 1px solid rgba(255,255,255,0.08);
  height: 44px;
}

.dt-footer-row .dataTables_info,
.dt-footer-row .dataTables_paginate {
  border-top: none !important;
  height: 44px;
  padding: 0 16px !important;
  display: flex !important;
  align-items: center !important;
}

.quake-dt-wrapper,
#table .dataTables_wrapper {
  background: transparent;
  color: #e2e8f0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}


table.quake-dt {
  border-collapse: collapse;
  width: 100% !important;
}


table.quake-dt thead th {
  background-color: #1c2333;
  color: #f59e0b;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0 16px;
  height: 44px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  white-space: nowrap;
}

table.quake-dt thead th.sorting,
table.quake-dt thead th.sorting_asc,
table.quake-dt thead th.sorting_desc {
  cursor: pointer;
}
table.quake-dt thead th.sorting::after,
table.quake-dt thead th.sorting_asc::after,
table.quake-dt thead th.sorting_desc::after {
  color: #f59e0b;
  opacity: 0.9;
}
table.quake-dt thead th.sorting::after { opacity: 0.25; }


table.quake-dt tbody tr {
  cursor: pointer;
  transition: background 0.12s;
}
table.quake-dt tbody tr:hover td {
  background-color: #1c2333 !important;
}
table.quake-dt tbody td {
  background-color: transparent;
  color: #e2e8f0;
  font-size: 14px;
  padding: 0 16px;
  height: 52px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  vertical-align: middle;
}

#table .dataTables_wrapper .dt-layout-row:last-child,
#table .dt-layout-table + .dt-layout-row {
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-between !important;
  align-items: center !important;
  border-top: 1px solid rgba(255,255,255,0.08);
  height: 44px;
  padding: 0;
}

#table .dataTables_wrapper .dt-layout-cell {
  border-top: none !important;
  padding: 0 !important;
  height: 44px;
  display: flex !important;
  align-items: center !important;
}


#table .dataTables_wrapper .dataTables_info,
#table .dt-info {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #8892a4;
  padding: 0 16px !important;
  height: 44px;
  display: flex;
  align-items: center;
  border-top: none !important;
  white-space: nowrap;
}


#table .dataTables_wrapper .dataTables_paginate,
#table .dt-paging {
  display: flex !important;
  align-items: center !important;
  gap: 2px;
  padding: 0 16px !important;
  height: 44px;
  border-top: none !important;
}

#table .dt-paging nav {
  display: flex;
  align-items: center;
  gap: 2px;
}


#table .dataTables_wrapper .dataTables_paginate .paginate_button,
#table .dt-paging .dt-paging-button {
  font-family: 'Courier New', monospace !important;
  font-size: 11px !important;
  color: #8892a4 !important;
  background: transparent !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: 4px !important;
  min-width: 28px !important;
  height: 28px !important;
  line-height: 28px !important;
  text-align: center;
  padding: 0 6px !important;
  cursor: pointer;
  box-shadow: none !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

#table .dataTables_wrapper .dataTables_paginate .paginate_button:hover,
#table .dt-paging .dt-paging-button:hover {
  color: #e2e8f0 !important;
  background: #1c2333 !important;
  border-color: rgba(255,255,255,0.2) !important;
}


#table .dataTables_wrapper .dataTables_paginate .paginate_button.current,
#table .dataTables_wrapper .dataTables_paginate .paginate_button.current:hover,
#table .dt-paging .dt-paging-button.current,
#table .dt-paging .dt-paging-button.current:hover {
  color: #f59e0b !important;
  background: #1c2333 !important;
  border-color: rgba(245,158,11,0.4) !important;
}


#table .dataTables_wrapper .dataTables_paginate .paginate_button.disabled,
#table .dataTables_wrapper .dataTables_paginate .paginate_button.disabled:hover,
#table .dt-paging .dt-paging-button.disabled,
#table .dt-paging .dt-paging-button.disabled:hover {
  color: rgba(255,255,255,0.15) !important;
  cursor: default !important;
  pointer-events: none;
}


#table .dataTables_wrapper .dataTables_paginate .paginate_button.ellipsis,
#table .dt-paging .dt-paging-button.ellipsis {
  border: none !important;
  background: transparent !important;
  color: #8892a4 !important;
  cursor: default !important;
  pointer-events: none;
  min-width: unset !important;
}


.dt-view-btn:hover {
  border-color: #f59e0b;
  color: #f59e0b;
}

.text-strong   { color: #ef4444; }
.text-moderate { color: #f59e0b; }
.text-quiet    { color: #8892a4; }
</style>