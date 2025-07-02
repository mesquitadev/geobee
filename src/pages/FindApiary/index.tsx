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

export default function FindApiary() {
  const { loading, setLoading } = useLoading()
  const [geojson, setGeojson] = useState(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  )
  const [selectedCoordinates, setSelectedCoordinates] = useState<
    [number, number] | null
  >(null)
  const [apiary, setApiary] = useState<any>()
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

    if (id) {
      getDataById(id)
      getMaps()
      getUserLocation()
    }
  }, [id, setLoading])

  return (
    <div className="flex h-full w-full flex-col">
      {loading && <BackdropLoading isLoading={loading} />}

      {apiary && apiary.latitude && apiary.longitude && (
        <>
          {/* Título e Legenda do mapa - agora acima do mapa */}
          <div className="px-3 py-2">
            <h2 className="mb-2 text-lg font-semibold">
              Apiário: {apiary.name}
            </h2>
            <Legend />
          </div>

          {/* Contêiner do mapa */}
          <div className="relative flex-1">
            <MapContainer
              center={
                selectedCoordinates || [
                  -2.5555334824608353, -44.208297729492195,
                ]
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

              {/* Marcador do apiário */}
              {apiary && (
                <React.Fragment>
                  <Marker
                    icon={meliponaryIcon}
                    position={[
                      Number(apiary.latitude),
                      Number(apiary.longitude),
                    ]}
                  >
                    <Popup>
                      Apiário {apiary.name} - Cap. de Suporte:{' '}
                      {apiary.capacidadeDeSuporte || 'N/A'}
                    </Popup>
                  </Marker>
                  <CircleMarker
                    center={[Number(apiary.latitude), Number(apiary.longitude)]}
                    radius={20}
                    color="blue"
                  />
                </React.Fragment>
              )}

              {/* Marcador da localização do usuário */}
              {userLocation && (
                <React.Fragment>
                  <Marker position={userLocation}>
                    <Popup>Sua localização</Popup>
                  </Marker>
                  <CircleMarker
                    center={userLocation}
                    radius={20}
                    color="blue"
                  />
                </React.Fragment>
              )}
            </MapContainer>
          </div>
        </>
      )}
    </div>
  )
}
