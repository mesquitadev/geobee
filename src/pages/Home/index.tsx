import { useEffect, useState } from 'react'
import api from '../../services'
import { useLoading } from '../../hooks/useLoading.tsx'
import BackdropLoading from '../../components/BackdropLoading'
import { GeoJSON, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

export default function Home() {
  const { loading, setLoading } = useLoading()
  const [businessData, setBusinessData] = useState(null)
  const [geojsonData, setGeojsonData] = useState(null)
  useEffect(() => {
    const getMyData = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/meliponary/all')
        setBusinessData(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const getMaps = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/mesquitadev/geobee-fe/main/src/components/Mapa/geobee.geojson',
        )
        const data = await response.json()
        setGeojsonData(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    Promise.all([getMyData(), getMaps()])
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
        <GeoJSON data={geojsonData} />

        {businessData?.map((data) => (
          <Marker
            key={data.id}
            position={[Number(data.latitude), Number(data.longitude)]}
          >
            <Popup>
              {data.name} : Capacidade de Suporte | {data.tipoInstalacao}
              {data.capacidadeDeSuporte ? data.capacidadeDeSuporte : '0'}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  )
}
