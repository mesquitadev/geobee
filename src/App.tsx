import './App.css'
import 'leaflet/dist/leaflet.css'
import { Toaster } from '@/components/ui/sonner'
import AppProvider from './providers/AppProvider.tsx'
import Routes from './routes'

function App() {
  return (
    <AppProvider>
      <Routes />
      <Toaster richColors position="top-right" />
    </AppProvider>
  )
}

export default App
