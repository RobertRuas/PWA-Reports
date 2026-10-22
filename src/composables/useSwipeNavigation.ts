import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

/**
 * Composable para gestos de navegação:
 * - Swipe da esquerda para direita: navega para cima na hierarquia
 * - Pull-to-refresh: arrasta para baixo para atualizar a página
 */
export function useSwipeNavigation() {
  const router = useRouter()
  const route = useRoute()

  const touchStartX = ref(0)
  const touchStartY = ref(0)
  const touchCurrentX = ref(0)
  const touchCurrentY = ref(0)
  const isSwipingRight = ref(false)
  const isPullingDown = ref(false)
  const pullDistance = ref(0)
  const showPullIndicator = ref(false)
  const isRefreshing = ref(false)

  const SWIPE_THRESHOLD = 80
  const SWIPE_EDGE_ZONE = 30 // Só inicia swipe se começar na borda esquerda
  const PULL_THRESHOLD = 80

  // Determinar a rota pai na hierarquia
  function getParentRoute(): string | null {
    const path = route.path

    if (path === '/home' || path === '/') return null

    if (path === '/settings') return '/home'

    const projectMatch = path.match(/^\/project\/([^/]+)(.*)$/)
    if (projectMatch) {
      const projectId = projectMatch[1]
      const subPath = projectMatch[2]

      if (!subPath || subPath === '') return '/home'
      // Subpáginas do projeto → página do projeto
      return `/project/${projectId}`
    }

    return '/home'
  }

  function onTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    touchStartX.value = touch.clientX
    touchStartY.value = touch.clientY
    touchCurrentX.value = touch.clientX
    touchCurrentY.value = touch.clientY
    isSwipingRight.value = false
    isPullingDown.value = false
    pullDistance.value = 0
  }

  function onTouchMove(e: TouchEvent) {
    const touch = e.touches[0]
    touchCurrentX.value = touch.clientX
    touchCurrentY.value = touch.clientY

    const deltaX = touchCurrentX.value - touchStartX.value
    const deltaY = touchCurrentY.value - touchStartY.value

    // Swipe da esquerda para direita (só se começar na borda esquerda)
    if (
      touchStartX.value < SWIPE_EDGE_ZONE &&
      deltaX > 20 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.5
    ) {
      isSwipingRight.value = true
    }

    // Pull-to-refresh (só se a página estiver no topo)
    const scrollTop = document.querySelector('.app-main')?.scrollTop || 0
    if (
      scrollTop <= 0 &&
      deltaY > 20 &&
      Math.abs(deltaY) > Math.abs(deltaX) * 1.5 &&
      !isSwipingRight.value &&
      !isRefreshing.value
    ) {
      isPullingDown.value = true
      pullDistance.value = Math.min(deltaY * 0.5, 120)
      showPullIndicator.value = pullDistance.value > 10
      if (pullDistance.value > PULL_THRESHOLD) {
        e.preventDefault()
      }
    }
  }

  function onTouchEnd() {
    const deltaX = touchCurrentX.value - touchStartX.value

    // Swipe direita: navegar hierarquia
    if (isSwipingRight.value && deltaX > SWIPE_THRESHOLD) {
      const parentRoute = getParentRoute()
      if (parentRoute) {
        router.push(parentRoute)
      }
    }

    // Pull-to-refresh
    if (isPullingDown.value && pullDistance.value > PULL_THRESHOLD) {
      isRefreshing.value = true
      showPullIndicator.value = true
      // Recarregar a página atual
      router.go(0)
    }

    isSwipingRight.value = false
    isPullingDown.value = false
    pullDistance.value = 0
    if (!isRefreshing.value) {
      showPullIndicator.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    document.removeEventListener('touchstart', onTouchStart)
    document.removeEventListener('touchmove', onTouchMove)
    document.removeEventListener('touchend', onTouchEnd)
  })

  return {
    showPullIndicator,
    pullDistance,
    isRefreshing,
  }
}
