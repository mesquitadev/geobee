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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'

// Ícones para o mapa (definidos fora do componente para evitar recriação)
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

  // Notificações de erro
  useEffect(() => {
    if (dashboardError)
      toast.error('Erro ao carregar dados do dashboard')
    if (mapsError)
      toast.error('Erro ao carregar mapas')
    if (geoJsonError)
      toast.error('Erro ao carregar geojson')
  }, [dashboardError, mapsError, geoJsonError])

  // Garantir selectedMapId válido quando maps carregar/alterar
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

  // Obter localização do usuário
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

  // Unifica apiários e meliponários para renderização (memoizado)
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

  // Centro padrão do mapa
  const defaultCenter = useMemo<[number, number]>(
    () => [-2.5555334824608353, -44.208297729492195],
    [],
  )

  // Reposiciona o mapa quando a localização do usuário estiver disponível
  const RecenterOnUserLocation: React.FC<{ center: [number, number] | null }> = ({ center }) => {
    const map = useMap()
    useEffect(() => {
      if (center) {
        map.setView(center)
      }
    }, [center, map])
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

  return (
    <div className="flex h-full w-full flex-col">
      {/* Seletor de mapas - visível em todos os dispositivos */}
      <div className="z-10 border-b border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <select
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-zinc-800 dark:text-gray-200"
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

        <div className="mt-2 flex w-full">
          <Legend />
        </div>
      </div>

      {/* Contêiner do mapa */}
      <div className="relative flex-1">
        <MapContainer
          center={userLocation ?? defaultCenter}
          zoom={13}
          className="relative h-full w-full"
        >
          {/* Camada base do mapa */}
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {/* Recentrar quando a posição do usuário existir */}
          <RecenterOnUserLocation center={userLocation} />
          {/* Dados GeoJSON como Vector Tiles */}
          {geoJson && <VectorGeoJsonLayer data={geoJson} />}
          {/* Marcadores de apiários e meliponários (dashboard) */}
          {dashboardMarkers.map((data: any) => (
            <React.Fragment key={data.id}>
              <Marker
                icon={data.type === 'MELIPONARY' ? meliponaryIcon : myIcon}
                position={[Number(data.latitude), Number(data.longitude)]}
              >
                <Popup>
                  {data.type === 'MELIPONARY' ? 'Meliponário' : 'Apiário'}{' '}
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
          {/* Marcador da localização do usuário */}
          {userLocation && (
            <React.Fragment>
              <Marker position={userLocation}>
                <Popup>Sua localização</Popup>
              </Marker>
              <CircleMarker center={userLocation} radius={20} color="blue" />
            </React.Fragment>
          )}
        </MapContainer>
      </div>
    </div>
  )
}
