import React, { useEffect, useState } from 'react'
import { useLoading } from '../../hooks/useLoading.tsx'
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
import { useNavigate, useParams } from 'react-router-dom'
import { useGetApiaryQuery } from '../../redux/slices/apiariesSlice'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, MapPin } from 'lucide-react'

const meliponaryIcon = new L.Icon({
  iconUrl: beebox as string,
  iconRetinaUrl: beebox as string,
  popupAnchor: [-0, -0],
  iconSize: [32, 32],
})

export default function FindApiary() {
  const [geojson, setGeojson] = useState(null)
  const { setLoading } = useLoading()
  const navigate = useNavigate()
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

  React.useEffect(() => {
    setLoading(apiaryLoading)
  }, [apiaryLoading, setLoading])

  React.useEffect(() => {
    if (apiaryError) {
      toast.error('Erro ao carregar apiário')
    }
  }, [apiaryError])

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
      setSelectedCoordinates([
        Number(apiary.latitude),
        Number(apiary.longitude),
      ])
    }
  }, [apiary])

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {apiaryError && (
        <div className="p-4 text-red-600">Erro ao carregar apiário.</div>
      )}
      {apiary && apiary.latitude && apiary.longitude && (
        <>
          {/* Map */}
          <div className="relative h-64 flex-1 lg:h-full">
            <MapContainer
              center={
                selectedCoordinates || [
                  -2.5555334824608353, -44.208297729492195,
                ]
              }
              zoom={13}
              className="h-full w-full"
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

          {/* Info Card */}
          <div className="w-full shrink-0 overflow-y-auto p-4 lg:w-96">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4"
              onClick={() => navigate('/meus-locais')}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{apiary.name}</CardTitle>
                {apiary.tipoInstalacao && (
                  <Badge variant="secondary" className="w-fit">
                    {apiary.tipoInstalacao}
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Coordinates */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {apiary.latitude}, {apiary.longitude}
                  </span>
                </div>

                <Separator />

                {/* Capacidade de Suporte */}
                <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    Capacidade de Suporte
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-200">
                    {apiary.capacidadeDeSuporte ?? 'N/A'}
                  </p>
                </div>

                <Separator />

                {/* Legend */}
                <Legend />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
