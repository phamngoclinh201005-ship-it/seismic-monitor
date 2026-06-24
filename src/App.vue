<script setup>
import { useScrollNav }   from '@/composables/useScrollNav'
import AppHeader          from '@/components/AppHeader.vue'
import AppFooter          from '@/components/AppFooter.vue'
import DashboardSection   from '@/components/DashboardSection.vue'
import TableSection       from '@/components/TableSection.vue'
import MapSection         from '@/components/MapSection.vue'
import DetailSection      from '@/components/DetailSection.vue'
import ScreenSection      from '@/components/ScreenSection.vue'
import { getQuakes }      from '@/data/quakeService';
import { ref, onMounted, nextTick, onUnmounted } from 'vue';
const { activeSection, observeDetail } = useScrollNav(['dashboard', 'table', 'map', 'detail'])
const selectedQuake = ref(null)
const handleSelectQuake = async (quake) => {
  selectedQuake.value = quake
  await nextTick()
  observeDetail() 
  document.getElementById('detail')?.scrollIntoView({ behavior: 'smooth' })
}
const handleShare = (quake) => {
  if (!quake) return;
  const title = "Thông tin động đất";
  const text = `Trận động đất ${quake.properties.mag}M tại ${quake.properties.place}`;
  const url = window.location.href; 
  if (navigator.share) {
    navigator.share({
      title: title,
      text: text,
      url: url,
    })
    .then(() => console.log('Chia sẻ thành công!'))
    .catch((error) => console.error('Lỗi khi chia sẻ:', error));
  } else {
    navigator.clipboard.writeText(`${text} - ${url}`)
      .then(() => alert('Đã copy thông tin chia sẻ vào clipboard!'))
      .catch(() => alert('Không thể copy.'));
  }
};
const quakes = ref([]);
const isLoading = ref(true);
let interval = null;
const loadData = async (range = 'all_day') => {
  if (quakes.value.length === 0) isLoading.value = true;
  
  try {
    const res = await getQuakes(range);
    quakes.value = res.features; 
  } catch (err) {
    console.error("Lỗi:", err);
  } finally {
    isLoading.value = false;
  }
};
const handleRangeChange = (newRange) => {
  loadData(newRange);
};
onMounted(() => {
  loadData();
  interval = setInterval(() => {
    loadData();
  }, 300000);
})

onUnmounted(() => {
  if (interval) clearInterval(interval);
});

</script>

<template>
  <div class="font-sans text-ink antialiased bg-base min-h-screen">
    <AppHeader :active-section="activeSection"/>

    <main class="mx-auto max-w-7xl px-5">
      <div v-if="isLoading" class="text-center py-20">Đang tải dữ liệu động đất...</div>
      <DashboardSection 
        :quakes="quakes"
        @select-quake="handleSelectQuake" 
        @change-range="handleRangeChange"
      />
      <TableSection 
        :quakes="quakes" 
        @select-quake="handleSelectQuake"
      />
      <MapSection 
        :quakes="quakes"
        @select-quake="handleSelectQuake"
      />
      <DetailSection :quake="selectedQuake">
        <template #actions>
          <button 
            @click="handleShare(selectedQuake)"
            class="bg-amber/20 hover:bg-amber/40 text-amber font-mono text-xs px-4 py-2 rounded-lg transition"
          >
            CHIA SẺ
          </button>
        </template>
      </DetailSection>
      <ScreenSection />
    </main>

    <AppFooter />
  </div>
</template>

