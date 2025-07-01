import React, { useEffect, useState } from 'react'
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
import beebox from '../../assets/bee-hive.png'
import { getColor } from '../../utils'
import Legend from '../../components/Legend'
import { useParams } from 'react-router-dom'

const meliponaryIcon = new L.Icon({
  iconUrl: beebox as string,
  iconRetinaUrl: beebox as string,
  popupAnchor: [-0, -0],
  iconSize: [32, 32],
})

export default function FindMeliponary() {
  const { loading, setLoading } = useLoading()
  const [geojson, setGeojson] = useState(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  )
  const [selectedCoordinates, setSelectedCoordinates] = useState<
    [number, number] | null
  >(null)
  const [meliponary, setMeliponary] = useState<any>()
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    const getMaps = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/mesquitadev/geobee-fe/main/src/components/Mapa/geobee.geojson',
        )
        const data = await response.json()
        setGeojson(data)
      } catch (err) {
        console.error(err)
      }
    }

    const getDataById = async (id: string) => {
      try {
        setLoading(true)
        const { data } = await api.get(`/meliponary/${id}`)
        setMeliponary(data)
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

    if (id) {
      getDataById(id)
      getMaps()
      getUserLocation()
    }
  }, [id, setLoading])

  return (
    <div className="flex h-full w-full flex-col">
      {loading && <BackdropLoading isLoading={loading} />}

      {/* Contêiner do mapa */}
      <div className="relative flex-1">
        <MapContainer
          center={
            selectedCoordinates || [-2.5555334824608353, -44.208297729492195]
          }
          zoom={13}
          className="h-full w-full"
        >
          {/* Camada base do mapa */}
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Dados GeoJSON */}
          {geojson && (
            <GeoJSON
              data={geojson}
              style={(feature) => {
                const type = feature.properties.VEGETACAO
                return { color: getColor(type) }
              }}
            />
          )}

          {/* Marcador do meliponário */}
          {meliponary && (
            <React.Fragment>
              <Marker
                icon={meliponaryIcon}
                position={[
                  Number(meliponary.latitude),
                  Number(meliponary.longitude),
                ]}
              >
                <Popup>
                  Meliponário {meliponary.name} - Cap. de Suporte:{' '}
                  {meliponary.capacidadeDeSuporte || 'N/A'}
                </Popup>
              </Marker>
              <CircleMarker
                center={[
                  Number(meliponary.latitude),
                  Number(meliponary.longitude),
                ]}
                radius={20}
                color="blue"
              />
            </React.Fragment>
          )}

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
