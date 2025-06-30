import L from 'leaflet'
import { enqueueSnackbar } from 'notistack'
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
import BackdropLoading from '../../components/BackdropLoading'
import Legend from '../../components/Legend'
import { useLoading } from '../../hooks/useLoading.tsx'
import api from '../../services'
import { getColor } from '../../utils'

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

// Interfaces para tipagem dos dados
interface MeliponaryData {
  id: number
  name: string
  latitude: string
  longitude: string
  capacidadeDeSuporte?: string
}

interface ApiaryData {
  id: number
  name: string
  latitude: string
  longitude: string
  capacidadeDeSuporte?: string
}

export default function Home() {
  const { loading, setLoading } = useLoading()
  const [meliponaryData, setMeliponaryData] = useState(null)
  const [apiaryData, setApiaryData] = useState(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  )
  const [geoJson, setGeoJson] = useState<any>('')
  const [maps, setMaps] = useState<any>([])
  const [selectedMap, setSelectedMap] = useState<string>('')
  const [geoJsonLoading, setGeoJsonLoading] = useState(false)

  // Carregar dados dos apiários e meliponários
  useEffect(() => {
    const getMyData = async () => {
      setLoading(true)
      try {
        const [meliponaryResponse, apiaryResponse] = await Promise.all([
          api.get('/meliponary/all'),
          api.get('/apiaries/all'),
        ])
        setMeliponaryData(meliponaryResponse.data)
        setApiaryData(apiaryResponse.data)
      } catch (err) {
        enqueueSnackbar(
          'Erro ao carregar dados de apiários ou meliponários existentes',
          { variant: 'error' },
        )
      } finally {
        setLoading(false)
      }
    }

    // Obter localização do usuário
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation([
              position.coords.latitude,
              position.coords.longitude,
            ])
          },
          (error) => {
            console.error(error)
          },
        )
      }
    }

    getMyData()
    getUserLocation()
  }, [setLoading])

  // Carregar lista de mapas disponíveis
  useEffect(() => {
    const fetchMaps = async () => {
      setLoading(true)
      try {
        const response = await api.get('maps/')
        const data = response.data
        setMaps(data)
      } catch (error) {
        enqueueSnackbar('Erro ao carregar mapas', { variant: 'error' })
      } finally {
        setLoading(false)
      }
    }

    fetchMaps()
  }, [setLoading])

  // Carregar mapa padrão
  useEffect(() => {
    const fetchGeoJSON = async () => {
      setLoading(true)
      setGeoJsonLoading(true)
      try {
        const response = await api.get('/maps/content/sao_luis.geojson')
        setGeoJson(response.data)
      } catch (error) {
        enqueueSnackbar('Erro ao carregar o mapa padrão', {
          variant: 'error',
          preventDuplicate: true,
          autoHideDuration: 3000,
        })
      } finally {
        setLoading(false)
        setGeoJsonLoading(false)
      }
    }

    fetchGeoJSON()
  }, [setLoading])

  // Manipulador de mudança de mapa
  const handleSelectMap = async (url: string) => {
    setLoading(true)
    setGeoJsonLoading(true)
    try {
      const [geoJsonResponse] = await Promise.all([api.get(`${url}`)])
      setGeoJson(geoJsonResponse.data)
    } catch (error) {
      enqueueSnackbar('Erro ao carregar mapa!', { variant: 'error' })
    } finally {
      setLoading(false)
      setGeoJsonLoading(false)
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUrl = event.target.value
    setGeoJson('')
    setSelectedMap(selectedUrl)
    handleSelectMap(selectedUrl)
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Indicador de carregamento */}
      {(loading || geoJsonLoading) && <BackdropLoading isLoading={true} />}

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
      </div>

      {/* Contêiner do mapa */}
      <div className="relative flex-1">
        <MapContainer
          center={[-2.5555334824608353, -44.208297729492195]}
          zoom={13}
          className="h-full w-full"
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

          {/* Marcadores de meliponários */}
          {meliponaryData?.map((data: MeliponaryData) => (
            <React.Fragment key={data.id}>
              <Marker
                icon={meliponaryIcon}
                position={[Number(data.latitude), Number(data.longitude)]}
              >
                <Popup>
                  Meliponário {data.name} - Capacidade de Suporte:{' '}
                  {data.capacidadeDeSuporte || '0'}
                </Popup>
              </Marker>
              <CircleMarker
                center={[Number(data.latitude), Number(data.longitude)]}
                radius={20}
                color="blue"
              />
            </React.Fragment>
          ))}

          {/* Marcadores de apiários */}
          {apiaryData?.map((data: ApiaryData) => (
            <React.Fragment key={data.id}>
              <Marker
                icon={myIcon}
                position={[Number(data.latitude), Number(data.longitude)]}
              >
                <Popup>
                  Apiário {data.name} - Cap. de Suporte:{' '}
                  {data.capacidadeDeSuporte || '0'}
                </Popup>
              </Marker>
              <CircleMarker
                center={[Number(data.latitude), Number(data.longitude)]}
                radius={20}
                color="blue"
              />
            </React.Fragment>
          ))}

          {/* Marcador da localização do usuário */}
          {userLocation && (
            <React.Fragment>
              <Marker position={userLocation}>
                <Popup>Você está aqui</Popup>
              </Marker>
              <CircleMarker center={userLocation} radius={20} color="blue" />
            </React.Fragment>
          )}

          {/* Legenda do mapa */}
          <Legend />
        </MapContainer>
      </div>
    </div>
  )
}
