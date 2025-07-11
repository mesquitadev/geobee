import { useEffect } from 'react'
import './App.css'
import 'leaflet/dist/leaflet.css'
import Routes from './routes'
import AppProvider from './providers/AppProvider.tsx'
import { SnackbarProvider } from 'notistack'
import { initMobileTweaks } from './utils/mobileTweaks'
import InstallPWA from './components/InstallPWA'

function App() {
  useEffect(() => {
    initMobileTweaks()
  }, [])

  return (
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={3000}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center', // Melhor posição para notificações em dispositivos móveis
      }}
    >
      <AppProvider>
        <Routes />
        <InstallPWA />
      </AppProvider>
    </SnackbarProvider>
  )
}

export default App
