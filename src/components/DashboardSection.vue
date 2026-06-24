<template>
    <section id="dashboard" class="screen py-14">
        <div class="relative overflow-hidden rounded-2xl border border-line bg-panel grid-bg">
            <div class="absolute inset-0 pointer-events-none">
                <svg class="seismo w-full h-full opacity-30" viewBox="0 0 1200 300" preserveAspectRatio="none">
                    <path
                        d="M0 150 H300 l20 -90 30 170 24 -210 26 250 30 -160 22 70 H560 l24 -120 30 200 26 -90 24 40 H760 l30 -60 26 90 H1200"
                        fill="none" stroke="#f5a623" stroke-width="2" />
                </svg>
            </div>
            <div class="relative p-8 md:p-12">
                <div class="font-mono text-xs text-amber tracking-widest mb-4">PHÒNG QUAN TRẮC · TOÀN CẦU</div>
                <h1 class="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight max-w-3xl">
                    Mỗi rung chấn của Trái Đất, <span class="text-amber">theo thời gian thực.</span>
                </h1>
                <p class="text-inkdim mt-5 max-w-xl text-[15px]">
                    Bảng điều khiển theo dõi động đất toàn cầu, dựng trên dữ liệu mở của USGS.
                    Tra cứu bằng bảng, định vị trên bản đồ, đọc chi tiết từng trận.
                </p>
                <div class="mt-7 inline-flex items-center gap-3 flex-wrap">
                    <label class="font-mono text-xs text-inkfaint">KHOẢNG THỜI GIAN</label>
                    <div
                        class="flex items-center gap-2 rounded-lg border border-line bg-base px-3 py-2 font-mono text-sm">
                        <select v-model="timeRange" class="bg-transparent text-amber outline-none cursor-pointer">
                            <option v-for="opt in timeRangeOptions" :key="opt.value" :value="opt.value"
                                class="bg-panel">
                                {{ opt.label }}
                            </option>

                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div v-for="s in stats" :key="s.label" class="rounded-xl border border-line bg-panel p-5">
                <div class="font-mono text-[11px] text-inkfaint tracking-wider">{{ s.label }}</div>
                <div class="font-mono text-4xl font-bold mt-2" :class="s.color">{{ s.value }}
                    <span v-if="s.unit" class="text-lg text-inkdim">{{ s.unit }}</span>
                </div>
                <div class="font-mono text-[11px] text-inkdim mt-1" :class="s.textColor">{{ s.sub }}</div>
            </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-4 mt-4">
            <div class="lg:col-span-2 rounded-xl border border-line bg-panel p-5">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-mono text-sm text-inkdim tracking-wider">TRẬN GẦN NHẤT</h3>
                </div>

                <div class="space-y-1">
                    <a v-for="q in recentQuakes" :key="q.place"
                        class="flex items-center gap-4 rounded-lg px-3 py-2.5 hover:bg-panel2 transition"
                        @click="emit('select-quake', props.quakes.find(item => item.id === q.id))"
                    >
                        <span class="font-mono font-bold w-12" :class="q.color">{{ q.mag }}</span>
                        <span class="flex-1 text-sm">{{ q.place }}</span>
                        <span class="font-mono text-[11px] text-inkfaint">{{ q.time }}</span>
                    </a>
                </div>
            </div>

            <div class="rounded-xl border border-line bg-panel p-5">
                <h3 class="font-mono text-sm text-inkdim tracking-wider mb-4">PHÂN BỐ ĐỘ LỚN</h3>
                <div class="space-y-4 font-mono text-xs">
                    <div v-for="item in distributions" :key="item.label">
                        <div class="flex justify-between mb-1">
                            <span  :class="item.textColor"> {{ item.label }} </span>
                            <span>{{ item.count }}</span>
                        </div>
                        <div class="h-2 rounded bg-base overflow-hidden">
                            <div class="h-full" :class="item.color" :style="{ width: item.percent + '%' }"></div>
                        </div>
                    </div>
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

const emit = defineEmits(['select-quake', 'change-range'])

const timeRange = ref('all_day')
const timeRangeOptions = [
  { value: 'all_day',           label: 'all_day · 24 giờ qua' },
  { value: 'all_hour',          label: 'all_hour · 1 giờ qua' },
  { value: 'all_week',          label: 'all_week · 7 ngày qua' }, 
  { value: '2.5_week',          label: '2.5_week · ≥2.5 trong 7 ngày' },
  { value: 'significant_month', label: 'significant_month · đáng kể 30 ngày' },
]

watch(timeRange, (newRange) => {
  emit('change-range', newRange)
})

const stats = computed(() => {
  const count = props.quakes.length
  const maxMag = Math.max(...props.quakes.map(q => q.properties.mag ?? 0))
  const avgDepth = props.quakes.reduce((acc, q) => acc + (q.geometry.coordinates[2] ?? 0), 0) / (count || 1)
  const tsunamiCount = props.quakes.filter(q => Number(q.properties.tsunami) === 1).length

  return [
    { label: 'TỔNG SỐ TRẬN',       value: count,                 textColor: 'text-quiet',    sub: 'dữ liệu từ USGS' },
    { label: 'ĐỘ LỚN CAO NHẤT',    value: maxMag.toFixed(1),     color: 'text-strong',        sub: 'Magnitude' },
    { label: 'ĐỘ SÂU TRUNG BÌNH',  value: avgDepth.toFixed(0),   unit: 'km',                  sub: 'trung bình' },
    { label: 'CẢNH BÁO SÓNG THẦN', value: tsunamiCount,           color: 'text-moderate',      sub: 'trận có cảnh báo' },
  ]
})

const recentQuakes = computed(() => {
  return props.quakes.slice(0, 5).map(q => {
    const mag = q.properties.mag ?? 0
    return {
      id: q.id,
      mag: mag.toFixed(2),
      place: q.properties.place ?? 'Không rõ vị trí',
      time: new Date(q.properties.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: mag >= 5 ? 'text-strong' : mag >= 2.5 ? 'text-moderate' : 'text-quiet',
    }
  })
})

const distributions = computed(() => {
  const total = props.quakes.length || 1
  const low  = props.quakes.filter(q => (q.properties.mag ?? 0) < 2.5).length
  const mid  = props.quakes.filter(q => (q.properties.mag ?? 0) >= 2.5 && (q.properties.mag ?? 0) < 5).length
  const high = props.quakes.filter(q => (q.properties.mag ?? 0) >= 5).length

  return [
    { label: 'Nhẹ < 2.5',  count: low,  percent: (low  / total) * 100, color: 'bg-quiet',    textColor: 'text-quiet' },
    { label: 'Vừa 2.5–5',  count: mid,  percent: (mid  / total) * 100, color: 'bg-moderate', textColor: 'text-moderate' },
    { label: 'Mạnh ≥ 5',   count: high, percent: (high / total) * 100, color: 'bg-strong',   textColor: 'text-strong' },
  ]
})
</script>
<style scoped>
.space-y-1 {
    cursor:pointer;
}
</style>