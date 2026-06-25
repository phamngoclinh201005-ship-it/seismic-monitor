<script setup>
import { ref, watch, onUnmounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const miniMapEl = ref(null)
let miniMap = null

const detailData = ref(null)
const loading = ref(true)
const error = ref(false)

watch(
  () => route.params.id,
  async (id) => {
    if (!id) {
      loading.value = false
      error.value = true
      detailData.value = null
      return
    }
    loading.value = true
    error.value = false
    detailData.value = null

    try {
      const res = await fetch(
        `https://earthquake.usgs.gov/fdsnws/event/1/query?eventid=${id}&format=geojson`
      )
      if (!res.ok) throw new Error('Not found')
      detailData.value = await res.json()
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)

const quakeData = computed(() => {
  const source = detailData.value
  if (!source) return null
  const propsData = source.properties || {}
  const coords = source.geometry?.coordinates || []
  return {
    id: source.id ?? '—',
    mag: propsData.mag != null ? propsData.mag.toFixed(1) : '—',
    place: propsData.place ?? 'Không rõ vị trí',
    tsunami: propsData.tsunami === 1,
    time: propsData.time ?? null,
    depth: coords[2] != null ? coords[2].toFixed(1) : '—',
    felt: propsData.felt ?? null,
    lat: coords[1] ?? null,
    lng: coords[0] ?? null,
    type: propsData.type ?? 'earthquake',
    url: propsData.url ?? '#',
  }
})

const formatDateTime = (timestamp) =>
  timestamp
    ? new Date(timestamp).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    : '—'

const formatLat = (lat) => lat === null ? '—' : lat > 0 ? `${lat}° N` : `${Math.abs(lat)}° S`
const formatLng = (lng) => lng === null ? '—' : lng > 0 ? `${lng}° E` : `${Math.abs(lng)}° W`

const goBackToTable = async () => {
  await router.push({ path: '/' })
  setTimeout(() => {
    document.querySelector('#table')?.scrollIntoView({ behavior: 'smooth' })
  }, 400)
}

async function initMiniMap(data) {
  if (!data || data.lat === null || data.lng === null || !miniMapEl.value) return
  const L = (await import('leaflet')).default
  if (miniMap) { miniMap.remove(); miniMap = null }
  miniMap = L.map(miniMapEl.value, { zoomControl: false, attributionControl: false })
    .setView([data.lat, data.lng], 6)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
  }).addTo(miniMap)
  const magValue = parseFloat(data.mag) || 0
  const markerColor = magValue >= 5 ? '#ef4444' : magValue >= 2.5 ? '#f5a623' : '#3ecf8e'
  L.circleMarker([data.lat, data.lng], {
    radius: 16, color: markerColor, fillColor: markerColor, fillOpacity: 0.4, weight: 2,
  }).addTo(miniMap)
  setTimeout(() => miniMap?.invalidateSize(), 200)
}

watch(quakeData, async (newData) => {
  await nextTick()
  if (newData) { initMiniMap(newData) }
  else if (miniMap) { miniMap.remove(); miniMap = null }
}, { deep: true })

onUnmounted(() => { miniMap?.remove() })
</script>

<template>
  <div v-if="loading" class="text-center py-20 font-mono text-sm text-inkdim">
  Đang tải dữ liệu...
</div>

<section v-else-if="error" class="screen py-14 px-6 max-w-6xl mx-auto">
  <div class="rounded-2xl border border-dashed border-line bg-panel/50 p-10 text-center">
    <div class="font-mono text-5xl font-bold text-amber">404</div>
    <p class="text-inkdim mt-3 text-sm">Không tìm thấy trang hoặc dữ liệu đã bị xóa.</p>
    <router-link to="/" class="inline-block mt-5 font-mono text-xs border border-line rounded-lg px-4 py-2 hover:border-amber/40 hover:text-amber">
      ← Về Trang Chủ
    </router-link>
  </div>
</section>

<section v-else-if="quakeData" id="detail" class="screen py-14 px-6 max-w-6xl mx-auto">
      <div class="font-mono text-xs text-amber tracking-widest mb-2">
        /quake/{{ quakeData.id }}
      </div>

   
      <button @click="goBackToTable"
        class="font-mono text-xs text-inkdim hover:text-amber inline-block mb-6 transition-colors">
        ‹ quay lại bảng
      </button>

      <div class="grid lg:grid-cols-5 gap-4 items-stretch">

        <div class="lg:col-span-3">
          <div class="rounded-2xl border border-line bg-panel p-7 h-full">
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div class="inline-flex items-baseline gap-2">
                  <span class="font-mono text-6xl font-bold text-strong">{{ quakeData.mag }}</span>
                  <span class="font-mono text-xl text-inkdim">M</span>
                </div>
                <h2 class="text-2xl font-semibold mt-3 max-w-md">{{ quakeData.place }}</h2>
              </div>
              <span v-if="quakeData.tsunami"
                class="font-mono text-[11px] text-amber border border-amber/40 rounded-lg px-3 py-1.5 whitespace-nowrap">
                CẢNH BÁO SÓNG THẦN
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-px bg-line mt-7 rounded-xl overflow-hidden border border-line">
              <div class="bg-panel p-4">
                <div class="font-mono text-[11px] text-inkfaint">THỜI GIAN</div>
                <div class="font-mono text-sm mt-1">{{ formatDateTime(quakeData.time) }}</div>
              </div>
              <div class="bg-panel p-4">
                <div class="font-mono text-[11px] text-inkfaint">ĐỘ SÂU</div>
                <div class="font-mono text-sm mt-1">{{ quakeData.depth }} km</div>
              </div>
              <div class="bg-panel p-4">
                <div class="font-mono text-[11px] text-inkfaint">SỐ NGƯỜI CẢM NHẬN</div>
                <div class="font-mono text-sm mt-1">{{ quakeData.felt?.toLocaleString('vi-VN') ?? '—' }}</div>
              </div>
              <div class="bg-panel p-4">
                <div class="font-mono text-[11px] text-inkfaint">VĨ ĐỘ</div>
                <div class="font-mono text-sm mt-1">{{ formatLat(quakeData.lat) }}</div>
              </div>
              <div class="bg-panel p-4">
                <div class="font-mono text-[11px] text-inkfaint">KINH ĐỘ</div>
                <div class="font-mono text-sm mt-1">{{ formatLng(quakeData.lng) }}</div>
              </div>
              <div class="bg-panel p-4">
                <div class="font-mono text-[11px] text-inkfaint">LOẠI</div>
                <div class="font-mono text-sm mt-1 uppercase text-amber text-xs">{{ quakeData.type }}</div>
              </div>
            </div>

            <a :href="quakeData.url" target="_blank" rel="noopener noreferrer"
              class="inline-flex items-center gap-2 mt-6 font-mono text-xs bg-amber hover:bg-amber/80 text-black px-4 py-2.5 rounded-lg font-bold transition">
              MỞ TRANG USGS GỐC →
            </a>
          </div>
        </div>

        <div class="lg:col-span-2 rounded-2xl border border-line overflow-hidden min-h-[320px] bg-panel">
          <div ref="miniMapEl" class="w-full h-full min-h-[320px]"></div>
        </div>

      </div>
  </section>
</template>
