import { X, Download } from 'lucide-react'
import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOSDevice, setIsIOSDevice] = useState(false)

  useEffect(() => {
    // Verificar se o app já está instalado como PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches

    // Verificar se é um dispositivo iOS - método compatível com TypeScript
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !/CriOS/.test(navigator.userAgent) &&
      !/FxiOS/.test(navigator.userAgent) &&
      !/OPiOS/.test(navigator.userAgent)

    setIsIOSDevice(isIOS)

    // Se já estiver instalado, não exibir o banner
    if (isStandalone) {
      setShowBanner(false)
      return
    }

    // Verificar se o usuário já ignorou o banner
    const hasIgnoredInstall = localStorage.getItem('pwa-install-ignored')
    if (hasIgnoredInstall === 'true') {
      setShowBanner(false)
      return
    }

    // Para dispositivos não-iOS, capturar o evento beforeinstallprompt
    if (!isIOS) {
      const handleBeforeInstallPrompt = (event: Event) => {
        // Impedir que o navegador mostre automaticamente o prompt
        event.preventDefault()
        // Salvar o evento para usá-lo quando o usuário clicar em instalar
        setInstallPrompt(event as BeforeInstallPromptEvent)
        // Mostrar o banner
        setShowBanner(true)
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

      return () => {
        window.removeEventListener(
          'beforeinstallprompt',
          handleBeforeInstallPrompt,
        )
      }
    } else {
      // Para iOS, mostrar instruções sobre como adicionar à tela inicial
      setShowBanner(true)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt && !isIOSDevice) return

    if (isIOSDevice) {
      // Em iOS não podemos instalar programaticamente, então mantemos o banner
      // com instruções de como adicionar à tela inicial
      return
    }

    // Mostrar o prompt de instalação
    if (installPrompt) {
      await installPrompt.prompt()

      // Aguardar pela escolha do usuário
      const choiceResult = await installPrompt.userChoice

      // Resetar o prompt - pode ser usado apenas uma vez
      setInstallPrompt(null)

      // Se o usuário aceitou instalar, esconder o banner
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false)
      }
    }
  }

  const handleIgnore = () => {
    // Salvar no localStorage que o usuário ignorou o banner
    localStorage.setItem('pwa-install-ignored', 'true')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg bg-white p-4 shadow-lg md:bottom-6 md:left-6 md:right-auto md:max-w-md dark:bg-zinc-800">
      <div className="flex items-start justify-between">
        <div className="flex flex-1 items-center">
          <div className="flex-shrink-0 rounded-full bg-indigo-100 p-2 dark:bg-indigo-900">
            <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {isIOSDevice ? 'Adicionar à tela inicial' : 'Instalar aplicativo'}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {isIOSDevice
                ? 'Toque no ícone de compartilhar e depois em "Adicionar à Tela de Início"'
                : 'Instale o GeoBEE para acesso rápido e melhor experiência'}
            </p>
          </div>
        </div>
        <button
          className="ml-2 flex-shrink-0 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-zinc-700"
          onClick={handleIgnore}
          aria-label="Ignorar"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-end space-x-3">
        <button
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={handleIgnore}
        >
          Ignorar
        </button>

        {!isIOSDevice && (
          <button
            className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
            onClick={handleInstall}
          >
            Instalar
          </button>
        )}
      </div>
    </div>
  )
}

export default InstallPWA
