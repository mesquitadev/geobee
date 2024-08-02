import { useEffect, useState } from 'react'
import api from '../../services'
import { useLoading } from '../../hooks/useLoading.tsx'
import BackdropLoading from '../../components/BackdropLoading'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import marker from '../../assets/apiary.png'
import beebox from '../../assets/bee-hive.png'

const myIcon = new L.Icon({
  iconUrl: marker,
  iconRetinaUrl: marker,
  popupAnchor: [-0, -0],
  iconSize: [32, 45],
})

const meliponaryIcon = new L.Icon({
  iconUrl: beebox,
  iconRetinaUrl: beebox,
  popupAnchor: [-0, -0],
  iconSize: [32, 45],
})
export default function Home() {
  const { loading, setLoading } = useLoading()
  const [meliponaryData, setMeliponaryData] = useState(null)
  const [apiaryData, setApiaryData] = useState(null)
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

    // const getMaps = async () => {
    //   setLoading(true)
    //   try {
    //     const response = await fetch(
    //       'https://raw.githubusercontent.com/mesquitadev/geobee-fe/main/src/components/Mapa/geobee.geojson',
    //     )
    //     // const data = await response.json()
    //   } catch (err) {
    //     console.error(err)
    //   } finally {
    //     setLoading(false)
    //   }
    // }

    Promise.all([getMyData()])
  }, [setLoading])

  return (
    <>
      <BackdropLoading isLoading={loading} />
      <MapContainer
        center={[-2.5555334824608353, -44.208297729492195]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {/* <GeoJSON data={seg} /> */}

        {meliponaryData?.map((data) => {
          return (
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
          )
        })}

        {apiaryData?.map((data) => {
          return (
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
          )
        })}
      </MapContainer>
    </>
  )
}
