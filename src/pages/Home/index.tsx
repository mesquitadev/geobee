import { useEffect, useState } from 'react'
import api from '../../services'
import { useLoading } from '../../hooks/useLoading.tsx'
import BackdropLoading from '../../components/BackdropLoading'
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from 'react-leaflet'
import L from 'leaflet'
import marker from '../../assets/apiary.png'
import beebox from '../../assets/bee-hive.png'
import { getColor } from '../../utils'
import Legend from '../../components/Legend'

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
const simplifyGeoJSON = async (url) => {
  const response = await fetch(url)
  const data = await response.json()
  return simplify(data, 0.01) // Adjust the tolerance as needed
}
export default function Home() {
  const { loading, setLoading } = useLoading()
  const [meliponaryData, setMeliponaryData] = useState(null)
  const [apiaryData, setApiaryData] = useState(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  )
  const [geojsons, setGeojsons] = useState([])

  useEffect(() => {
    const getMyData = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/meliponary/all')
        const { data: apiary } = await api.get('/apiary/all')
        setMeliponaryData(data)
        setApiaryData(apiary)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const getMaps = async () => {
      setLoading(true)
      try {
        const urls = [
          'https://raw.githubusercontent.com/mesquitadev/geobee-fe/main/src/components/Mapa/geobee.geojson',
          // 'https://gist.githubusercontent.com/mesquitadev/b3454497da1301c26d8f165c31151e64/raw/10d1b940cdc22fe36e87579feb2605703ae8cc31/VEGETACAO_GEOBEE%2520(1).json',
        ]
        const geojsonData = await Promise.all(
          urls.map(async (url) => {
            const response = await fetch(url)
            return response.json()
          }),
        )
        setGeojsons(geojsonData)
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

    Promise.all([getMyData(), getMaps()])
    getUserLocation()
  }, [setLoading])

  return (
    <>
      <BackdropLoading isLoading={loading} />
      <MapContainer
        center={[-2.5555334824608353, -44.208297729492195]}
        zoom={13}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {geojsons.map((geojson, index) => (
          <GeoJSON
            key={index}
            data={geojson}
            style={(feature) => {
              const type = feature.properties.VEGETACAO
              return { color: getColor(type) }
            }}
          />
        ))}
        {meliponaryData?.map((data) => {
          return (
            <>
              <Marker
                icon={meliponaryIcon}
                key={data.id}
                position={[Number(data.latitude), Number(data.longitude)]}
              >
                <Popup>
                  Meliponário {data.name} - Capacidade de Suporte :{' '}
                  {data.capacidadeDeSuporte ? data.capacidadeDeSuporte : '0'}
                </Popup>
              </Marker>
              <CircleMarker
                center={[Number(data.latitude), Number(data.longitude)]}
                radius={20} // Ajuste o raio conforme necessário
                color="blue" // Ajuste a cor conforme necessário
              />
            </>
          )
        })}

        {apiaryData?.map((data) => {
          return (
            <>
              <Marker
                icon={myIcon}
                key={data.id}
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
            </>
          )
        })}

        {userLocation && (
          <>
            <Marker position={userLocation}>
              <Popup>Você está aqui</Popup>
            </Marker>
            <CircleMarker
              center={userLocation}
              radius={20} // Ajuste o raio conforme necessário
              color="blue" // Ajuste a cor conforme necessário
            />
          </>
        )}
        <Legend />
      </MapContainer>
    </>
  )
}
