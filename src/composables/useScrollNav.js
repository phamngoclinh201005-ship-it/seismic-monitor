import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollNav(sectionIds) {
  const activeSection = ref(sectionIds[0])
  let observer

  const observeSection = (id) => {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  }

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) activeSection.value = e.target.id
        })
      },
      { threshold: 0.3 }
    )
    sectionIds.forEach(observeSection)
  })

  const observeDetail = () => observeSection('detail')

  onUnmounted(() => observer?.disconnect())

  return { activeSection, observeDetail }
}