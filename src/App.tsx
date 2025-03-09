import './App.css'
import 'leaflet/dist/leaflet.css'
import Routes from './routes'
import AppProvider from './providers/AppProvider.tsx'
import {SnackbarProvider} from 'notistack'

function App() {
    return (
        <SnackbarProvider>
            <AppProvider>
                <Routes/>
            </AppProvider>
        </SnackbarProvider>
    )
}

export default App
