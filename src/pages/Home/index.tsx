// @ts-nocheck
import L, { initVectorGrid } from '../../utils/leaflet-setup'
import { toast } from 'sonner'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import marker from '../../assets/apiary.png'
import beebox from '../../assets/bee-hive.png'
import Legend from '../../components/Legend'
import { useLoading } from '../../hooks/useLoading.tsx'
import { getColor } from '../../utils'
import { useGetDashboardDataQuery } from '../../redux/slices/apiariesAllSlice'
import { useGetMapsQuery } from '../../redux/slices/mapsSlice'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { MapPanel } from '@/components/map-panel/map-panel'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Card } from '@/components/ui/card'
import { PanelRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMediaQuery } from '../../hooks/useMediaQuery'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'

// Icones para o mapa (definidos fora do componente para evitar recriacao)
const myIcon = new L.Icon({
  iconUrl: marker as string,
  iconRetinaUrl: marker as string,
  popupAnchor: [-0, -0],
  iconSize: [32, 32],
})

const meliponaryIcon = new L.Icon({
  iconUrl: beebox as string,
  iconRetinaUrl: beebox as string,
  popupAnchor: [-0, -0],
  iconSize: [32, 32],
})

function getAuthToken(): string | undefined {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('GeoToken='))
    ?.split('=')[1]
}

async function fetchGeoJsonFromApi(mapId: string): Promise<any> {
  const token = getAuthToken()
  const response = await fetch(`${API_URL}/maps/${mapId}/geojson`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) {
    throw new Error(`Erro ao buscar GeoJSON: ${response.statusText}`)
  }
  return response.json()
}

// Initialize vectorgrid plugin (sets window.L then loads the IIFE)
const vectorGridReady = initVectorGrid()

export default function Home() {
  const { setLoading } = useLoading()
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  )
  const [selectedMapId, setSelectedMapId] = useState<string>('')
  const [geoJson, setGeoJson] = useState<any>(null)
  const [geoJsonLoading, setGeoJsonLoading] = useState(false)
  const [geoJsonError, setGeoJsonError] = useState<any>(null)
  const [vectorGridLoaded, setVectorGridLoaded] = useState(false)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const mapRef = useRef<any>(null)
  const markerRefs = useRef<Record<string, any>>({})

  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    vectorGridReady.then(() => setVectorGridLoaded(true))
  }, [])

  const {
    data: dashboardData = { apiarios: [], meliponarios: [] },
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useGetDashboardDataQuery()
  const {
    data: maps = [],
    isLoading: mapsLoading,
    error: mapsError,
  } = useGetMapsQuery()

  // Buscar geojson sempre que selectedMapId mudar
  useEffect(() => {
    if (!selectedMapId) {
      setGeoJson(null)
      return
    }

    const currentId = selectedMapId
    setGeoJson(null)
    setGeoJsonLoading(true)
    setGeoJsonError(null)

    fetchGeoJsonFromApi(selectedMapId)
      .then((data) => {
        if (currentId === selectedMapId) setGeoJson(data)
      })
      .catch((err) => {
        if (currentId === selectedMapId) setGeoJsonError(err)
      })
      .finally(() => {
        if (currentId === selectedMapId) setGeoJsonLoading(false)
      })
  }, [selectedMapId])

  // Loading global
  useEffect(() => {
    setLoading(dashboardLoading || geoJsonLoading || mapsLoading)
  }, [dashboardLoading, geoJsonLoading, mapsLoading, setLoading])

  // Notificacoes de erro
  useEffect(() => {
    if (dashboardError)
      toast.error('Erro ao carregar dados do dashboard')
    if (mapsError)
      toast.error('Erro ao carregar mapas')
    if (geoJsonError)
      toast.error('Erro ao carregar geojson')
  }, [dashboardError, mapsError, geoJsonError])

  // Garantir selectedMapId valido quando maps carregar/alterar
  useEffect(() => {
    if (!maps?.length) return

    if (!selectedMapId) {
      setSelectedMapId(String(maps[0].id))
      return
    }

    const exists = maps.some((m: any) => String(m.id) === selectedMapId)
    if (!exists) {
      setSelectedMapId(String(maps[0].id))
    }
  }, [maps, selectedMapId])

  // Obter localizacao do usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        () => {
          // silencioso
        },
      )
    }
  }, [])

  const handleChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMapId(event.target.value)
  }, [])

  // Unifica apiarios e meliponarios para renderizacao (memoizado)
  const dashboardMarkers = useMemo(
    () => [
      ...(dashboardData.apiarios || []).map((a: any) => ({
        ...a,
        type: 'APIARY',
      })),
      ...(dashboardData.meliponarios || []).map((m: any) => ({
        ...m,
        type: 'MELIPONARY',
      })),
    ],
    [dashboardData.apiarios, dashboardData.meliponarios],
  )

  // Centro padrao do mapa
  const defaultCenter = useMemo<[number, number]>(
    () => [-2.5555334824608353, -44.208297729492195],
    [],
  )

  // Handle location click from panel
  const handleLocationClick = useCallback(
    (item: {
      id: string
      latitude: string | number
      longitude: string | number
      type: 'APIARY' | 'MELIPONARY'
      name: string
    }) => {
      setHighlightedId(item.id)
      const lat = Number(item.latitude)
      const lng = Number(item.longitude)
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], 15)
      }
      // Open the marker popup
      const markerRef = markerRefs.current[item.id]
      if (markerRef) {
        markerRef.openPopup()
      }
      // On mobile, close the sheet after clicking
      if (isMobile) {
        setSheetOpen(false)
      }
    },
    [isMobile],
  )

  // Handle marker click from map
  const handleMarkerClick = useCallback((id: string) => {
    setHighlightedId(id)
  }, [])

  // Reposiciona o mapa quando a localizacao do usuario estiver disponivel
  const RecenterOnUserLocation: React.FC<{ center: [number, number] | null }> = ({ center }) => {
    const map = useMap()
    useEffect(() => {
      if (center) {
        map.setView(center)
      }
    }, [center, map])
    return null
  }

  // Capture map reference
  const MapRefSetter: React.FC = () => {
    const map = useMap()
    useEffect(() => {
      mapRef.current = map
    }, [map])
    return null
  }

  // Renderiza GeoJSON como vector tiles no cliente (melhor performance)
  const VectorGeoJsonLayer: React.FC<{ data: any }> = ({ data }) => {
    const map = useMap()
    const layerRef = useRef<any>(null)

    useEffect(() => {
      if (!map || !data || !vectorGridLoaded) return

      // Remove camada anterior se existir
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }

      const vectorLayer = (L as any).vectorGrid.slicer(data, {
        rendererFactory: (L as any).canvas.tile,
        interactive: false,
        vectorTileLayerStyles: {
          sliced: (properties: any) => {
            const type = properties?.CLASSE || properties?.['CLASSE']
            const color = getColor(type)
            return {
              weight: 1,
              color,
              fillColor: color,
              fillOpacity: 0.4,
            }
          },
        },
      })

      vectorLayer.addTo(map)
      layerRef.current = vectorLayer

      return () => {
        if (layerRef.current) {
          map.removeLayer(layerRef.current)
          layerRef.current = null
        }
      }
    }, [map, data, vectorGridLoaded])

    return null
  }

  const mapContent = (
    <div className="relative h-full w-full">
      {/* Map selector overlay */}
      <div className="absolute left-3 right-3 top-3 z-[1000]">
        <select
          className="w-full max-w-xs rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          value={selectedMapId}
          onChange={handleChange}
        >
          <option value="">Selecione um mapa</option>
          {maps.map((map: any) => (
            <option key={map.id} value={String(map.id)}>
              {map.name} ({map.feature_count} features)
            </option>
          ))}
        </select>
      </div>

      {/* Vegetation legend overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] w-64">
        <Card className="p-0">
          <Legend />
        </Card>
      </div>

      <MapContainer
        center={userLocation ?? defaultCenter}
        zoom={13}
        className="relative h-full w-full"
      >
        {/* Capture map ref */}
        <MapRefSetter />
        {/* Camada base do mapa */}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {/* Recentrar quando a posicao do usuario existir */}
        <RecenterOnUserLocation center={userLocation} />
        {/* Dados GeoJSON como Vector Tiles */}
        {geoJson && <VectorGeoJsonLayer data={geoJson} />}
        {/* Marcadores de apiarios e meliponarios (dashboard) */}
        {dashboardMarkers.map((data: any) => (
          <React.Fragment key={data.id}>
            <Marker
              ref={(ref) => {
                if (ref) markerRefs.current[data.id] = ref
              }}
              icon={data.type === 'MELIPONARY' ? meliponaryIcon : myIcon}
              position={[Number(data.latitude), Number(data.longitude)]}
              eventHandlers={{
                click: () => handleMarkerClick(data.id),
              }}
            >
              <Popup>
                {data.type === 'MELIPONARY' ? 'Meliponario' : 'Apiario'}{' '}
                {data.name} - Capacidade de Suporte:{' '}
                {data.capacidadeDeSuporte || 'N/A'}
              </Popup>
            </Marker>
            <CircleMarker
              center={[Number(data.latitude), Number(data.longitude)]}
              radius={20}
              color={data.type === 'MELIPONARY' ? 'green' : 'orange'}
            />
          </React.Fragment>
        ))}
        {/* Marcador da localizacao do usuario */}
        {userLocation && (
          <React.Fragment>
            <Marker position={userLocation}>
              <Popup>Sua localizacao</Popup>
            </Marker>
            <CircleMarker center={userLocation} radius={20} color="blue" />
          </React.Fragment>
        )}
      </MapContainer>
    </div>
  )

  const panelContent = (
    <MapPanel
      apiaries={dashboardData.apiarios || []}
      meliponaries={dashboardData.meliponarios || []}
      highlightedId={highlightedId}
      onLocationClick={handleLocationClick}
    />
  )

  // Mobile layout: full map + floating button that opens bottom Sheet
  if (isMobile) {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="relative flex-1">
          {mapContent}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                size="icon"
                className="absolute bottom-20 right-3 z-[1000] h-12 w-12 rounded-full shadow-lg"
              >
                <PanelRight className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] p-0">
              <SheetTitle className="sr-only">Painel de localidades</SheetTitle>
              {panelContent}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    )
  }

  // Desktop layout: resizable panels
  return (
    <div className="flex h-full w-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={70} minSize={50}>
          {mapContent}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          {panelContent}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
