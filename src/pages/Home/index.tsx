import L from 'leaflet'
import { enqueueSnackbar } from 'notistack'
import React, { Suspense, useEffect, useState } from 'react'
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

  useEffect(() => {
    const getMyData = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/meliponary/all')
        const { data: apiary } = await api.get('/apiary/all')
        setMeliponaryData(data)
        setApiaryData(apiary)
      } catch (err) {
        enqueueSnackbar('Erro ao carregar dados de apiários', {
          variant: 'error',
        })
      } finally {
        setLoading(false)
      }
    }

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

    Promise.all([getMyData()])
    getUserLocation()
  }, [setLoading])

  useEffect(() => {
    const fetchMaps = async () => {
      setLoading(true)
      try {
        const response = await api.get('/maps')
        const data = response.data
        setMaps(data)
      } catch (error) {
        enqueueSnackbar('Erro ao carregar mapas', {
          variant: 'error',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMaps()
  }, [setLoading])

  useEffect(() => {
    const fetchGeoJSON = async () => {
      setLoading(true)
      setGeoJsonLoading(true)
      try {
        const response = await api.get('/maps/content/geobee.geojson')
        setGeoJson(response.data)
      } catch (error) {
        enqueueSnackbar('Erro ao carregar mapa', {
          variant: 'error',
        })
      } finally {
        setLoading(false)
        setGeoJsonLoading(false)
      }
    }

    fetchGeoJSON()
  }, [setLoading])

  const handleSelectMap = async (url: string) => {
    setLoading(true)
    setGeoJsonLoading(true)
    try {
      const response = await api.get(`${url}`)
      const data = response.data
      setGeoJson(data)
    } catch (error) {
      enqueueSnackbar('Erro ao carregar mapa', {
        variant: 'error',
      })
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
    <Suspense
      fallback={<BackdropLoading isLoading={loading || geoJsonLoading} />}
    >
      <div className="w-full  justify-center bg-zinc-900 p-2 text-white">
        <select
          className="w-full border-white bg-zinc-900"
          value={selectedMap}
          onChange={handleChange}
        >
          <option value="">Selecione um mapa</option>
          {maps.map((map) => (
            <option key={map.id} value={map.url}>
              {map.name}
            </option>
          ))}
        </select>
      </div>
      <MapContainer
        center={[-2.5555334824608353, -44.208297729492195]}
        zoom={13}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {geoJsonLoading && <BackdropLoading isLoading={geoJsonLoading} />}

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

        {meliponaryData?.map((data) => {
          return (
            <React.Fragment key={data.id}>
              <Marker
                icon={meliponaryIcon}
                position={[Number(data.latitude), Number(data.longitude)]}
              >
                <Popup>
                  Meliponário {data.name} - Capacidade de Suporte :{' '}
                  {data.capacidadeDeSuporte ? data.capacidadeDeSuporte : '0'}
                </Popup>
              </Marker>
              <CircleMarker
                center={[Number(data.latitude), Number(data.longitude)]}
                radius={20}
                color="blue"
              />
            </React.Fragment>
          )
        })}

        {apiaryData?.map((data) => {
          return (
            <React.Fragment key={data.id}>
              <Marker
                icon={myIcon}
                position={[Number(data.latitude), Number(data.longitude)]}
              >
                <Popup>
                  Apiário {data.name} - Capacidade de Suporte :{' '}
                  {data.capacidadeDeSuporte ? data.capacidadeDeSuporte : '0'}
                </Popup>
              </Marker>
              <CircleMarker
                center={[Number(data.latitude), Number(data.longitude)]}
                radius={20} // Ajuste o raio conforme necessário
                color="blue" // Ajuste a cor conforme necessário
              />
            </React.Fragment>
          )
        })}

        {userLocation && (
          <React.Fragment key="user-location">
            <Marker position={userLocation}>
              <Popup>Você está aqui</Popup>
            </Marker>
            <CircleMarker
              center={userLocation}
              radius={20} // Ajuste o raio conforme necessário
              color="blue" // Ajuste a cor conforme necessário
            />
          </React.Fragment>
        )}
        <Legend />
      </MapContainer>
    </Suspense>
  )
}
