// @ts-nocheck
import L from 'leaflet'
import { useSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from 'react-leaflet'
import marker from '../../assets/apiary.png'
import beebox from '../../assets/bee-hive.png'
import Legend from '../../components/Legend'
import { useLoading } from '../../hooks/useLoading.tsx'
import { getColor } from '../../utils'
import { useGetDashboardDataQuery } from '../../redux/slices/apiariesAllSlice'
import { useGetMapsQuery } from '../../redux/slices/mapsSlice'
import { useGetGeoJsonQuery } from '../../redux/slices/geoJsonSlice'

// Ícones para o mapa
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
  const {
    data: geoJson,
    isLoading: geoJsonLoading,
    error: geoJsonError,
    refetch: refetchGeoJson,
  } = useGetGeoJsonQuery(selectedMap || 'sao_luis.geojson', {
    skip: !selectedMap && !maps.length,
  })

  useEffect(() => {
    setLoading(dashboardLoading || geoJsonLoading || mapsLoading)
  }, [dashboardLoading, geoJsonLoading, mapsLoading, setLoading])

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

  useEffect(() => {
    if (!selectedMap && maps.length > 0) {
      setSelectedMap('sao_luis.geojson')
    }
  }, [maps, selectedMap])

  // Obter localização do usuário
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.error(error)
        },
      )
    }
  }, [])

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUrl = event.target.value
    setSelectedMap(selectedUrl)
    refetchGeoJson()
  }

  // Unifica apiários e meliponários para renderização
  const dashboardMarkers = [
    ...(dashboardData.apiarios || []).map((a) => ({ ...a, type: 'APIARY' })),
    ...(dashboardData.meliponarios || []).map((m) => ({
      ...m,
      type: 'MELIPONARY',
    })),
  ]

  return (
    <div className="flex h-full w-full flex-col">
      {/* /!* Loading acima de tudo, exceto o menu *!/ */}
      {/* <BackdropLoading */}
      {/*  isLoading={loading || geoJsonLoading || dashboardLoading || mapsLoading} */}
      {/* /> */}

      {/* Seletor de mapas - visível em todos os dispositivos */}
      <div className="z-10 border-b border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <select
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-zinc-800 dark:text-gray-200"
          value={selectedMap}
          onChange={handleChange}
        >
          <option value="">Selecione um mapa</option>
          {maps.map((map: any) => (
            <option key={map.id} value={map.url || map.name}>
              {map.name}
            </option>
          ))}
        </select>

        <div className="mt-2 flex w-full">
          <Legend />
        </div>
      </div>

      {/* Legenda do mapa - logo abaixo do select de mapas */}

      {/* Contêiner do mapa */}
      <div className="relative flex-1">
        <MapContainer
          center={[-2.5555334824608353, -44.208297729492195]}
          zoom={13}
          className="relative h-full w-full"
        >
          {/* Camada base do mapa */}
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {/* Dados GeoJSON */}
          {geoJson && (
            <GeoJSON
              data={geoJson}
              style={(feature) => {
                const type =
                  feature.properties.VEGETAÇÃ || feature.properties.CLASSE
                return { color: getColor(type) }
              }}
            />
          )}
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
