<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useScrollNav } from '@/composables/useScrollNav'

const route = useRoute()
const { activeSection: scrollActiveSection } = useScrollNav(['dashboard', 'table', 'map', 'detail'])
const activeSection = computed(() =>
route.name === 'quake-detail' ? 'detail' : scrollActiveSection.value
)
</script>

<template>
  <div class="font-sans text-ink antialiased bg-base min-h-screen">
    <AppHeader :active-section="activeSection" />
    <main class="mx-auto max-w-7xl px-5">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
