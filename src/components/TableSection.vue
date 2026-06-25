<template>
    <section id="table" class="screen py-14 border-t border-line">
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
                <input v-model="searchValue" placeholder="Tìm kiếm…"
                    class="bg-transparent outline-none text-sm font-mono placeholder:text-inkfaint w-40">
            </div>
        </div>

        <div class="rounded-xl border border-line bg-panel overflow-hidden">
            <EasyDataTable
                :headers="headers"
                :items="items"
                :search-value="searchValue"
                :rows-per-page="7"
                buttons-pagination
                hide-rows-per-page
                @click-row="onClickRow"
                class="quake-easy-table"
            >
                <template #item-mag="{ mag, magRaw }">
                    <span class="font-mono font-bold" :class="getMagClass(magRaw)">{{ mag }}</span>
                </template>

                <template #item-depth="{ depth }">
                    <span class="font-mono text-inkdim">{{ depth }}</span>
                </template>

                <template #item-time="{ time }">
                    <span class="font-mono text-inkdim whitespace-nowrap">{{ time }}</span>
                </template>

                <template #item-tsunami="{ tsunami }">
                    <span v-if="tsunami"
                        class="font-mono text-[11px] text-amber border border-amber/40 rounded px-2 py-0.5">CÓ</span>
                    <span v-else class="text-inkfaint font-mono text-[11px]">—</span>
                </template>

                <template #item-action="{ originalItem }">
                    <button @click.stop="emit('select-quake', originalItem)"
                        class="font-mono text-[11px] px-3 py-1 rounded border border-line text-inkdim hover:border-amber hover:text-amber transition-colors whitespace-nowrap flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        Xem
                    </button>
                </template>
            </EasyDataTable>
        </div>
    </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'

const props = defineProps({
    quakes: { type: Array, required: true },
})

const emit = defineEmits(['select-quake'])

const searchValue = ref('')

const headers = [
    { text: 'ĐỘ LỚN',      value: 'mag',     sortable: true  },
    { text: 'ĐỊA ĐIỂM',    value: 'place',   sortable: true  },
    { text: 'ĐỘ SÂU (KM)', value: 'depth',   sortable: true  },
    { text: 'THỜI GIAN',   value: 'time',     sortable: true  },
    { text: 'SÓNG THẦN',   value: 'tsunami',  sortable: false },
    { text: '',             value: 'action',   sortable: false },
]

const items = computed(() =>
    (props.quakes || []).map(q => {
        const magRaw = q.properties?.mag ?? 0
        return {
            mag:          magRaw.toFixed(1),
            magRaw,
            place:        q.properties?.place || 'Không rõ vị trí',
            depth:        (q.geometry?.coordinates?.[2] ?? 0).toFixed(1),
            depthRaw:     q.geometry?.coordinates?.[2] ?? 0,
            time:         q.properties?.time
                            ? new Date(q.properties.time).toLocaleString('vi-VN', {
                                hour: '2-digit', minute: '2-digit', second: '2-digit',
                                day: '2-digit', month: '2-digit',
                              })
                            : '—',
            timeRaw:      q.properties?.time ?? 0,
            tsunami:      q.properties?.tsunami === 1,
            originalItem: q,
        }
    })
)

function getMagClass(mag) {
    if (mag >= 5)   return 'text-strong'
    if (mag >= 2.5) return 'text-moderate'
    return 'text-quiet'
}

function onClickRow(row) {
    emit('select-quake', row.originalItem)
}
</script>

<style>
.quake-easy-table {
    --easy-table-border: none;
    --easy-table-header-background-color: #1c2333;
    --easy-table-header-font-color: #f59e0b;
    --easy-table-header-font-size: 11px;
    --easy-table-header-height: 44px;
    --easy-table-header-item-padding: 0px 16px;
    --easy-table-row-border: 1px solid rgba(255, 255, 255, 0.08);
    --easy-table-body-row-background-color: transparent;
    --easy-table-body-even-row-background-color: transparent;
    --easy-table-body-row-font-color: #e2e8f0;
    --easy-table-body-even-row-font-color: #e2e8f0;
    --easy-table-body-row-font-size: 14px;
    --easy-table-body-row-height: 52px;
    --easy-table-body-item-padding: 0px 16px;
    --easy-table-body-row-hover-background-color: #1c2333;
    --easy-table-body-row-hover-font-color: #e2e8f0;
    --easy-table-footer-background-color: transparent;
    --easy-table-footer-font-color: #8892a4;
    --easy-table-footer-font-size: 11px;
    --easy-table-footer-height: 44px;
    --easy-table-footer-padding: 0px 16px;
    --easy-table-buttons-pagination-border: 1px solid rgba(255, 255, 255, 0.08);
    --easy-table-scrollbar-color: transparent;
    --easy-table-scrollbar-track-color: transparent;
    --easy-table-scrollbar-thumb-color: rgba(255,255,255,0.15);
    --easy-table-scrollbar-corner-color: transparent;
    --easy-table-message-font-color: #8892a4;

    width: 100%;
    border-radius: 0 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.quake-easy-table .vue3-easy-data-table__main {
    background-color: transparent !important;
}
.quake-easy-table .vue3-easy-data-table__header th {
    font-family: 'Courier New', monospace !important;
    letter-spacing: 0.08em !important;
    text-transform: uppercase !important;
    font-weight: 400 !important;
    white-space: nowrap;
}
.quake-easy-table .vue3-easy-data-table__header th.sortable .sortType-icon {
    border-bottom-color: #f59e0b !important;
    opacity: 1 !important;
}
.quake-easy-table .vue3-easy-data-table__header th.sortable.none .sortType-icon {
    opacity: 0.25 !important;
}
.quake-easy-table .vue3-easy-data-table__body tr {
    cursor: pointer;
}
.quake-easy-table .vue3-easy-data-table__footer {
    border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
    font-family: 'Courier New', monospace !important;
    justify-content: space-between !important;
}
.quake-easy-table .buttons-pagination {
    gap: 2px;
}

.quake-easy-table .buttons-pagination .item {
    font-family: 'Courier New', monospace !important;
    font-size: 11px !important;
    color: #8892a4 !important;
    background: transparent !important;
    border-radius: 4px !important;
    min-width: 28px !important;
    line-height: 26px !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-top-left-radius: 4px !important;
    border-bottom-left-radius: 4px !important;
    border-top-right-radius: 4px !important;
    border-bottom-right-radius: 4px !important;
}
.quake-easy-table .buttons-pagination .item:hover {
    color: #e2e8f0 !important;
    background: #1c2333 !important;
    border-color: rgba(255, 255, 255, 0.2) !important;
}
.quake-easy-table .buttons-pagination .item.button.active {
    background-color: #1c2333 !important;
    border-color: rgba(245, 158, 11, 0.4) !important;
    color: #f59e0b !important;
}
.quake-easy-table .previous-page__click-button,
.quake-easy-table .next-page__click-button {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    width: 28px;
    height: 28px;
    display: flex !important;
    align-items: center;
    justify-content: center;
    
}

.quake-easy-table .previous-page__click-button:hover,
.quake-easy-table .next-page__click-button:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: #1c2333;
}

.quake-easy-table .previous-page__click-button .arrow,
.quake-easy-table .next-page__click-button .arrow {
    border-color: #8892a4 !important;
}

.quake-easy-table .previous-page__click-button.first-page .arrow,
.quake-easy-table .next-page__click-button.last-page .arrow {
    border-color: rgba(255, 255, 255, 0.15) !important;
}

</style>