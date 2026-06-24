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
                <input v-model="searchQuery" placeholder="Tìm kiếm…"
                    class="bg-transparent outline-none text-sm font-mono placeholder:text-inkfaint w-40">
            </div>
        </div>

        <div class="rounded-xl border border-line bg-panel overflow-hidden">
            <div class="overflow-x-auto">
                <table class="dt-mock w-full text-sm">
                    <thead class="bg-panel2 font-mono text-[11px] text-amber tracking-wider">
                        <tr>
                            <th v-for="h in headers" :key="h.key"
                                class="text-left px-4 py-3 cursor-pointer whitespace-nowrap">
                                {{ h.label }}
                                <span v-if="h.key === 'mag'">▾</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="font-sans">
                        <tr v-for="q in paginatedQuakes" :key="q.id" class="hover:bg-panel2 cursor-pointer">
                            <td class="px-4 py-3 font-mono font-bold " :class="q.color">{{ q.mag }}</td>
                            <td class="px-4 py-3">{{ q.place }}</td>
                            <td class="px-4 py-3 font-mono text-inkdim">{{ q.depth }}</td>
                            <td class="px-4 py-3 font-mono text-inkdim whitespace-nowrap">{{ q.time }}</td>
                            <td class="px-4 py-3">
                                <span v-if="q.tsunami"
                                    class="font-mono text-[11px] text-amber border border-amber/40 rounded px-2 py-0.5">CÓ</span>
                                <span v-else class="text-inkfaint font-mono text-[11px]">—</span>
                            </td>
                            <td class="px-4 py-3 text-right">
                                <button @click.stop="emit('select-quake', q.originalItem)"
                                    class="font-mono text-[11px] px-3 py-1 rounded border border-line text-inkdim hover:border-amber hover:text-amber transition-colors whitespace-nowrap flex items-center gap-1.5">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    Xem
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div
                class="flex items-center justify-between px-4 py-3 border-t border-line font-mono text-[11px] text-inkdim flex-wrap gap-3">
                <span>Hiển thị {{ startIndex }}–{{ endIndex }} trên {{ filteredQuakes.length }} trận</span>
                <div v-if="totalPages > 1" class="flex items-center gap-1">
                    <button @click="currentPage--" :disabled="currentPage === 1"
                        class="px-2 py-1 rounded border border-line disabled:opacity-30 disabled:cursor-not-allowed">‹</button>

                    <template v-for="page in visiblePages" :key="page">
                        <span v-if="page === '...'" class="px-2 py-1 text-inkfaint">…</span>
                        <button v-else @click="currentPage = page" class="px-2.5 py-1 rounded border"
                            :class="currentPage === page ? 'border-amber/40 text-amber bg-panel2' : 'border-line'">
                            {{ page }}
                        </button>
                    </template>

                    <button @click="currentPage++" :disabled="currentPage === totalPages"
                        class="px-2 py-1 rounded border border-line disabled:opacity-30 disabled:cursor-not-allowed">›</button>
                </div>
            </div>
        </div>
    </section>
</template>
<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    quakes: { type: Array, required: true },
})

const emit = defineEmits(['select-quake'])

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 7

watch(searchQuery, () => {
    currentPage.value = 1
})

const headers = [
    { label: 'ĐỘ LỚN', key: 'mag' },
    { label: 'ĐỊA ĐIỂM', key: 'place' },
    { label: 'ĐỘ SÂU (KM)', key: 'depth' },
    { label: 'THỜI GIAN', key: 'time' },
    { label: 'SÓNG THẦN', key: 'tsunami' },
    { label: '', key: '' }
]
const filteredQuakes = computed(() => {
    if (!props.quakes) return []

    const mapped = props.quakes.map(q => {
        const mag = q.properties?.mag ?? 0;
        return {
            id: q.id,
            mag: mag.toFixed(1),
            place: q.properties?.place || 'Không rõ vị trí',
            depth: (q.geometry?.coordinates?.[2] ?? 0).toFixed(1),
            time: q.properties?.time
                ? new Date(q.properties.time).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' })
                : '—',
            tsunami: q.properties?.tsunami === 1,
            color: mag >= 5 ? 'text-strong' : (mag >= 2.5 ? 'text-moderate' : 'text-quiet'),
            originalItem: q
        }
    })

    if (!searchQuery.value.trim()) return mapped

    return mapped.filter(q =>
        q.place.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})
const totalPages = computed(() => Math.ceil(filteredQuakes.value.length / itemsPerPage) || 1)

const paginatedQuakes = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredQuakes.value.slice(start, end)
})
const visiblePages = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    const delta = 2

    const range = []
    const left = Math.max(1, current - delta)
    const right = Math.min(total, current + delta)

    for (let i = left; i <= right; i++) range.push(i)
    if (left > 2) range.unshift('...', 1)
    else if (left === 2) range.unshift(1)


    if (right < total - 1) range.push('...', total)
    else if (right === total - 1) range.push(total)

    return range
})
const startIndex = computed(() => filteredQuakes.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1)
const endIndex = computed(() => {
    const end = currentPage.value * itemsPerPage
    return end > filteredQuakes.value.length ? filteredQuakes.value.length : end
})
</script>