import { useEffect, useState } from 'react'
import api from '../../services'
import { useLoading } from '../../hooks/useLoading.tsx'
import BackdropLoading from '../../components/BackdropLoading'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  GeoJSON,
  CircleMarker,
} from 'react-leaflet'
import L from 'leaflet'
import marker from '../../assets/apiary.png'
import beebox from '../../assets/bee-hive.png'
import { getColor } from '../../utils'
import Legend from '../../components/Legend'
import { useParams } from 'react-router-dom'

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
  const [geojson, setGeojson] = useState(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  )
  const [selectedCoordinates, setSelectedCoordinates] = useState<
    [number, number] | null
  >(null)

  const [apiary, setApiary] = useState({})

  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    const getMaps = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/mesquitadev/geobee-fe/main/src/components/Mapa/geobee.geojson',
        )
        const data = await response.json()
        setGeojson(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const getDataById = async (id: string) => {
      setLoading(true)
      try {
        const { data } = await api.get(`/apiary/${id}`)
        setApiary(data)
        setSelectedCoordinates([data.latitude, data.longitude])
      } catch (err) {
        console.error(err)
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

    Promise.all([getDataById(id), getMaps()])
    getUserLocation()
  }, [id, setLoading])

  return (
    <>
      <BackdropLoading isLoading={loading} />
      {apiary && apiary.latitude && apiary.longitude && (
        <MapContainer
          center={
            selectedCoordinates || [-2.5555334824608353, -44.208297729492195]
          }
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {geojson && (
            <GeoJSON
              data={geojson}
              style={(feature) => {
                const type = feature.properties.VEGETACAO
                return { color: getColor(type) }
              }}
            />
          )}

          {apiary && (
            <Marker
              icon={meliponaryIcon}
              key={apiary.id}
              position={[apiary.latitude, apiary.longitude]}
            >
              <Popup>
                Apiário - {apiary.name} - Capacidade de Suporte :{' '}
                {apiary.capacidadeDeSuporte ? apiary.capacidadeDeSuporte : '0'}
              </Popup>
            </Marker>
          )}

          {userLocation && (
            <Marker position={userLocation}>
              <Popup>Você está aqui</Popup>
            </Marker>
          )}
          <Legend />
        </MapContainer>
      )}
    </>
  )
}
