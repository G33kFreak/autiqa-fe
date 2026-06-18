export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', {
    getSSRProps() {
      return {}
    },
    mounted(el: HTMLElement, binding) {
      const val = binding.value
      let i = 0
      let y = 22

      if (typeof val === 'number') {
        i = val
      } else if (val && typeof val === 'object') {
        i = val.i ?? 0
        y = val.y ?? 22
      }

      el.style.setProperty('--reveal-i', String(i))
      el.style.setProperty('--reveal-y', `${y}px`)
      el.classList.add('reveal-pending')

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.classList.add('is-visible')
            observer.disconnect()
          }
        },
        { threshold: 0.05, rootMargin: '0px 0px -48px 0px' },
      )
      observer.observe(el)
    },
  })
})
