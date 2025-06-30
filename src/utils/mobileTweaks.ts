/**
 * Utilitários para melhorar a experiência mobile
 */

/**
 * Previne o zoom em formulários em dispositivos iOS
 */
export const preventZoomOnFocus = () => {
  // Aplica somente em dispositivos iOS
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent)
  if (!isIos) return

  // Previne zoom quando o usuário clica em inputs
  document.addEventListener(
    'touchstart',
    (event) => {
      if (
        (event.target as HTMLElement).tagName === 'INPUT' ||
        (event.target as HTMLElement).tagName === 'SELECT' ||
        (event.target as HTMLElement).tagName === 'TEXTAREA'
      ) {
        const targetElement = event.target as HTMLElement

        // Salva o nível de zoom atual
        const metaViewport = document.querySelector('meta[name=viewport]')
        const originalContent = metaViewport?.getAttribute('content')

        // Define um novo viewport que previne o zoom
        if (metaViewport) {
          metaViewport.setAttribute(
            'content',
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
          )
        }

        // Restaura o viewport original quando o input perder foco
        targetElement.addEventListener(
          'blur',
          () => {
            if (metaViewport && originalContent) {
              setTimeout(() => {
                metaViewport.setAttribute('content', originalContent)
              }, 300)
            }
          },
          { once: true },
        )
      }
    },
    false,
  )
}

/**
 * Desabilita o scroll de página quando modais estão abertos
 */
export const disableBodyScrollWhenModalOpen = (isModalOpen: boolean) => {
  if (isModalOpen) {
    // Salva a posição atual do scroll
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
  } else {
    // Restaura a posição do scroll
    const scrollY = document.body.style.top
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    window.scrollTo(0, parseInt(scrollY || '0', 10) * -1)
  }
}

/**
 * Detecta se o dispositivo está em modo standalone (app na tela inicial)
 */
export const isInStandaloneMode = (): boolean => {
  // Verifica a propriedade 'standalone' do Safari iOS
  // Esta propriedade não existe no tipo Navigator padrão, por isso precisamos verificá-la com segurança
  const nav = navigator as any
  const isStandaloneSafari = nav.standalone === true

  // Verifica se está em modo standalone em outros navegadores (Chrome, Firefox, etc.)
  const isStandaloneMode = window.matchMedia(
    '(display-mode: standalone)',
  ).matches

  return isStandaloneSafari || isStandaloneMode
}

/**
 * Adiciona uma classe ao body baseado no sistema operacional para estilizações específicas
 */
export const detectOperatingSystem = () => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  let osClass = ''

  if (/iphone|ipad|ipod/.test(userAgent)) {
    osClass = 'ios-device'
  } else if (/android/.test(userAgent)) {
    osClass = 'android-device'
  }

  if (osClass) {
    document.body.classList.add(osClass)
  }
}

/**
 * Inicializa todas as melhorias mobile
 */
export const initMobileTweaks = () => {
  preventZoomOnFocus()
  detectOperatingSystem()
}
