// @ts-nocheck
import L from 'leaflet'
import 'leaflet.vectorgrid'
import { useSnackbar } from 'notistack'
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
import { fetchGeoJsonByUrl } from '../../utils/fetchGeoJsonByUrl'
import { useGetDashboardDataQuery } from '../../redux/slices/apiariesAllSlice'
import { useGetMapsQuery } from '../../redux/slices/mapsSlice'

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

export default function Home() {
  const { setLoading } = useLoading()
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  )
  const [selectedMap, setSelectedMap] = useState<string>('')
  const [geoJson, setGeoJson] = useState<any>(null)
  const [geoJsonLoading, setGeoJsonLoading] = useState(false)
  const [geoJsonError, setGeoJsonError] = useState<any>(null)
  const { enqueueSnackbar } = useSnackbar()
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

  // Buscar geojson sempre que selectedMap mudar (evita race e limpa estado)
  useEffect(() => {
    if (!selectedMap) {
      setGeoJson(null)
      return
    }

    const current = selectedMap
    setGeoJson(null)
    setGeoJsonLoading(true)
    setGeoJsonError(null)

    fetchGeoJsonByUrl(selectedMap)
      .then((data) => {
        if (current === selectedMap) setGeoJson(data)
      })
      .catch((err) => {
        if (current === selectedMap) setGeoJsonError(err)
      })
      .finally(() => {
        if (current === selectedMap) setGeoJsonLoading(false)
      })
  }, [selectedMap])

  // Loading global
  useEffect(() => {
    setLoading(dashboardLoading || geoJsonLoading || mapsLoading)
  }, [dashboardLoading, geoJsonLoading, mapsLoading, setLoading])

  // Notificações de erro
  useEffect(() => {
    if (dashboardError)
      enqueueSnackbar('Erro ao carregar dados do dashboard', {
        variant: 'error',
      })
    if (mapsError)
      enqueueSnackbar('Erro ao carregar mapas', { variant: 'error' })
    if (geoJsonError)
      enqueueSnackbar('Erro ao carregar geojson', { variant: 'error' })
  }, [dashboardError, mapsError, geoJsonError, enqueueSnackbar])

  // Garantir selectedMap válido quando maps carregar/alterar
  useEffect(() => {
    if (!maps?.length) return

    if (!selectedMap) {
      setSelectedMap(maps[0].url)
      return
    }

    const exists = maps.some((m: any) => m.url === selectedMap)
    if (!exists) {
      setSelectedMap(maps[0].url)
    }
  }, [maps, selectedMap])

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
    const selectedUrl = event.target.value
    setSelectedMap(selectedUrl)
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
      if (!map || !data) return

      // Remove camada anterior se existir
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }

      const vectorLayer = (L as any).vectorGrid.slicer(data, {
        rendererFactory: (L as any).canvas.tile,
        interactive: false,
        vectorTileLayerStyles: {
          // "sliced" é o nome padrão da camada criada pelo slicer
          sliced: (properties: any) => {
            const type =
              properties?.['VEGETAÇÃ'] ||
              properties?.['CLASSE'] ||
              properties?.VEGETAÇÃ ||
              properties?.CLASSE
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
    }, [map, data])

    return null
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Seletor de mapas - visível em todos os dispositivos */}
      <div className="z-10 border-b border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <select
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-zinc-800 dark:text-gray-200"
          value={selectedMap}
          onChange={handleChange}
        >
          <option value="">Selecione um mapa</option>
          {maps.map((map: any) => (
            <option key={map.id} value={map.url}>
              {map.name}
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
