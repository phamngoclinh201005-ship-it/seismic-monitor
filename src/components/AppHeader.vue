<template>
    <header class="sticky top-0 z-50 border-b border-line bg-base/85 backdrop-blur">
        <div class="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="relative grid place-items-center w-9 h-9 rounded-lg bg-amber/15 border border-amber/30">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5a623" stroke-width="2">
                        <path d="M2 12h3l2-7 4 16 3-11 2 5h6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
                <div>
                    <div class="font-mono font-bold tracking-tight leading-none">SEISMIC<span
                            class="text-amber">·</span>MONITOR</div>
                    <div class="font-mono text-[10px] text-inkfaint tracking-widest">USGS REAL-TIME FEED</div>
                </div>
            </div>

            <nav class="hidden md:flex items-center gap-1 font-mono text-xs">
                <a v-for="item in navItems" :key="item.id" :href="`#${item.id}`" 
                :class="[
                    'nav-pill px-3 py-1.5 rounded-lg border transition-all',
                    activeSection === item.id
                        ? 'border-amber/40 bg-amber/10 text-amber'
                        : 'border-transparent text-inkdim hover:text-ink'
                ]">
                    {{ item.label }}
                </a>
            </nav>

            <div class="flex items-center gap-2 font-mono text-[11px] text-inkdim">
                <span class="ping"></span> LIVE
            </div>
        </div>
    </header>
</template>
<script setup>
defineProps({
    activeSection: {
        type: String,
        default: 'dashboard',
    },
})

const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'table', label: 'Bảng' },
    { id: 'map', label: 'Bản đồ' },
    { id: 'detail', label: 'Chi tiết' },
]
</script>