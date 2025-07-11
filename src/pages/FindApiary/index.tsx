import React, { useEffect, useState } from 'react'
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
import { useGetApiaryQuery } from '../../redux/slices/apiariesSlice'
import { useSnackbar } from 'notistack'

const meliponaryIcon = new L.Icon({
  iconUrl: beebox as string,
  iconRetinaUrl: beebox as string,
  popupAnchor: [-0, -0],
  iconSize: [32, 32],
})

export default function FindApiary() {
  const [geojson, setGeojson] = useState(null)
  const { setLoading } = useLoading()
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  )
  const [selectedCoordinates, setSelectedCoordinates] = useState<
    [number, number] | null
  >(null)
  const { id } = useParams<{ id: string }>()
  const {
    data: apiary,
    isLoading: apiaryLoading,
    error: apiaryError,
  } = useGetApiaryQuery(id!, { skip: !id })
  const { enqueueSnackbar } = useSnackbar()

  // Adiciona controle de loading global
  React.useEffect(() => {
    setLoading(apiaryLoading)
  }, [apiaryLoading, setLoading])

  React.useEffect(() => {
    if (apiaryError) {
      enqueueSnackbar('Erro ao carregar apiário', { variant: 'error' })
    }
  }, [apiaryError, enqueueSnackbar])

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
      getMaps()
      getUserLocation()
    }
  }, [id])

  useEffect(() => {
    if (apiary && apiary.latitude && apiary.longitude) {
      setSelectedCoordinates([apiary.latitude, apiary.longitude])
    }
  }, [apiary])

  return (
    <div className="flex h-full w-full flex-col">
      {/* {(loading || apiaryLoading) && <BackdropLoading isLoading={true} />} */}
      {apiaryError && (
        <div className="p-4 text-red-600">Erro ao carregar apiário.</div>
      )}
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
