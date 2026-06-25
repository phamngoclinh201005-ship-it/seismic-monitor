import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export function useScrollNav(sectionIds) {
  const activeSection = ref(sectionIds[0])
  let mutationObserver
  let frameId = 0

  const updateActiveSection = () => {
    frameId = 0

    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean)

    if (!sections.length) return

    const headerOffset = 88
    const current = sections.find(section => {
      const rect = section.getBoundingClientRect()
      return rect.top <= headerOffset && rect.bottom > headerOffset
    })

    if (current) {
      activeSection.value = current.id
      return
    }

    const nearest = sections.reduce((best, section) => {
      const distance = Math.abs(section.getBoundingClientRect().top - headerOffset)
      return distance < best.distance ? { section, distance } : best
    }, { section: sections[0], distance: Infinity })

    activeSection.value = nearest.section.id
  }

  const scheduleUpdate = () => {
    if (frameId) return
    frameId = requestAnimationFrame(updateActiveSection)
  }

  onMounted(async () => {
    await nextTick()
    updateActiveSection()

    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    mutationObserver = new MutationObserver(scheduleUpdate)
    mutationObserver.observe(document.body, { childList: true, subtree: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', scheduleUpdate)
    window.removeEventListener('resize', scheduleUpdate)
    mutationObserver?.disconnect()
    if (frameId) cancelAnimationFrame(frameId)
  })

  return { activeSection }
}
