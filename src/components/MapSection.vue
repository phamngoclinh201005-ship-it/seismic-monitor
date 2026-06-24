<template>
    <section id="map" class="screen py-14 border-t border-line">
        <div class="mb-6">
            <div class="font-mono text-xs text-amber tracking-widest mb-2">/map</div>
            <h2 class="text-3xl font-bold tracking-tight">Bản đồ chấn tâm</h2>
            <p class="text-inkdim text-sm mt-1">
                Mỗi vòng tròn là một trận; bán kính và màu theo độ lớn. Bấm để xem nhanh.
            </p>
        </div>

        <div class="grid lg:grid-cols-4 gap-4">
            <div class="lg:col-span-3 rounded-xl border border-line overflow-hidden bg-panel">
                <div ref="mapEl" class="w-full h-[480px]"></div>
            </div>

            <div class="space-y-4">
                <div class="rounded-xl border border-line bg-panel p-5">
                    <h3 class="font-mono text-sm text-inkdim tracking-wider mb-3">CHÚ GIẢI</h3>
                    <div class="space-y-3 font-mono text-xs">
                        <div class="flex items-center gap-3">
                            <span class="w-3 h-3 rounded-full bg-[#3ecf8e]"></span> Nhẹ &lt; 2.5
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="w-4 h-4 rounded-full bg-[#f5a623]"></span> Vừa 2.5–5
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="w-5 h-5 rounded-full bg-[#ef4444]"></span> Mạnh ≥ 5
                        </div>
                    </div>
                </div>

                <div class="rounded-xl border border-line bg-panel p-5">
                    <h3 class="font-mono text-sm text-inkdim tracking-wider mb-3">ĐIỂM NỔI BẬT</h3>
                    <div class="space-y-2 font-mono text-xs text-inkdim">
                        <div v-for="q in topQuakes" :key="q.id" class="flex justify-between items-center gap-2">
                            <span :class="q.color" class="font-bold">M{{ q.mag }}</span>
                            <span class="truncate text-right max-w-[140px]">{{ q.place }}</span>
                        </div>

                        <div v-if="topQuakes.length === 0" class="text-inkfaint text-center py-2">
                            Đang tải dữ liệu...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
const props = defineProps({
    quakes: { type: Array, required: true }
})
const emit = defineEmits(['select-quake'])
const mapEl = ref(null)
let map = null
let markerGroup = null
const colorByMag = m => m >= 5 ? '#ef4444' : m >= 2.5 ? '#f5a623' : '#3ecf8e'
const topQuakes = computed(() => {
    if (!props.quakes || props.quakes.length === 0) return []

    return [...props.quakes]
        .map(q => {
            const mag = q.properties?.mag ?? 0
            const fullPlace = q.properties?.place || 'Không rõ'

            const shortPlace = fullPlace.includes(', ') ? fullPlace.split(', ').pop() : fullPlace

            return {
                id: q.id,
                mag: mag.toFixed(1),
                place: shortPlace,
                rawMag: mag,
                color: mag >= 5 ? 'text-strong' : (mag >= 2.5 ? 'text-moderate' : 'text-quiet')
            }
        })
        .sort((a, b) => b.rawMag - a.rawMag)
        .slice(0, 3)
})
const renderMarkers = () => {
    if (!map) return
    if (markerGroup) {
        map.removeLayer(markerGroup)
    }

    const markers = []

    props.quakes.forEach(q => {

        const lat = q.geometry?.coordinates?.[1]
        const lng = q.geometry?.coordinates?.[0]
        const mag = q.properties?.mag ?? 0
        const place = q.properties?.place || 'Không rõ vị trí'

        if (lat !== undefined && lng !== undefined) {

            const mk = L.circleMarker([lat, lng], {
                radius: Math.max(5, mag * 3),
                color: colorByMag(mag),
                weight: 1.5,
                fillColor: colorByMag(mag),
                fillOpacity: 0.45
            })

            mk.bindPopup(`
                <div style="font-family:monospace; font-size:13px; padding:4px; min-width:160px">
                    <b style="color:${colorByMag(mag)}; font-size:15px">M ${mag.toFixed(1)}</b><br/>
                    <span style="color:#888; display:block; margin:4px 0">${place}</span>
                    <button id="pop-btn-${q.id}" style="margin-top:4px; font-family:monospace; font-size:11px; padding:2px 8px; border:1px solid rgba(245,166,35,0.4); color:#f5a623; border-radius:4px; cursor:pointer; background:transparent">
                        Xem chi tiết →
                    </button>
                </div>
            `)

            mk.on('popupopen', () => {
                const btn = document.getElementById(`pop-btn-${q.id}`)
                if (btn) {
                    btn.addEventListener('click', () => {
                        emit('select-quake', q)
                    })
                }
            })

            markers.push(mk)
        }
    })


    if (markers.length > 0) {
        markerGroup = L.featureGroup(markers).addTo(map)
        map.fitBounds(markerGroup.getBounds().pad(0.2))
    }
}

onMounted(async () => {
    await nextTick()

    if (!mapEl.value) return

    map = L.map(mapEl.value, { worldCopyJump: true }).setView([20, 140], 2)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap · © CARTO',
        subdomains: 'abcd'
    }).addTo(map)

    setTimeout(() => map.invalidateSize(), 200)


    renderMarkers()
})

watch(() => props.quakes, () => {
    renderMarkers()
}, { deep: true })
</script>
<style>
.leaflet-pane {
    z-index: 10 !important;
}

.leaflet-top,
.leaflet-bottom {
    z-index: 11 !important;
}
</style>