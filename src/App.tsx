import './App.css'
import 'leaflet/dist/leaflet.css'
import Routes from './routes'
import AppProvider from './providers/AppProvider.tsx'
import { SnackbarProvider } from 'notistack'

function App() {
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
      </AppProvider>
    </SnackbarProvider>
  )
}

export default App
