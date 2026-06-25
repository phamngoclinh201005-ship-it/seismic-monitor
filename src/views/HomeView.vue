<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardSection  from '@/components/DashboardSection.vue'
import TableSection      from '@/components/TableSection.vue'
import MapSection        from '@/components/MapSection.vue'
import { getQuakes }     from '@/data/quakeService'

const router = useRouter()

const quakes = ref([])
const isLoading = ref(true)
let interval = null

const loadData = async (range = 'all_day') => {
  if (quakes.value.length === 0) isLoading.value = true
  try {
    const res = await getQuakes(range)
    quakes.value = res.features
  } catch (err) {
    console.error('Lỗi:', err)
  } finally {
    isLoading.value = false
  }
}

const handleRangeChange = (newRange) => loadData(newRange)

const handleSelectQuake = (quake) => {
  router.push({ name: 'quake-detail', params: { id: quake.id } })
}

onMounted(() => {
  loadData()
  interval = setInterval(() => loadData(), 300000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <div v-if="isLoading" class="text-center py-20">Đang tải dữ liệu động đất...</div>

  <template v-else>
    <DashboardSection
      :quakes="quakes"
      @select-quake="handleSelectQuake"
      @change-range="handleRangeChange"
    />
    <div id="danh-sach-bang">
    <TableSection
      :quakes="quakes"
      @select-quake="handleSelectQuake"
    />
    </div>
    <MapSection
      :quakes="quakes"
      @select-quake="handleSelectQuake"
    />
  </template>
</template>
