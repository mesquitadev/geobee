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
import { useGetMeliponaryQuery } from '../../redux/slices/meliponarySlice'
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
import { ArrowLeft, Check, MapPin, X } from 'lucide-react'

const meliponaryIcon = new L.Icon({
  iconUrl: beebox as string,
  iconRetinaUrl: beebox as string,
  popupAnchor: [-0, -0],
  iconSize: [32, 32],
})

const conditionFields: { key: string; label: string }[] = [
  { key: 'fontesNectarPolen', label: 'Fontes de Néctar/Pólen' },
  { key: 'disponibilidadeAgua', label: 'Disponibilidade de Água' },
  { key: 'sombreamentoNatural', label: 'Sombreamento Natural' },
  { key: 'protecaoVentosFortes', label: 'Proteção contra Ventos Fortes' },
  { key: 'distanciaSeguraContaminacao', label: 'Distância Segura de Contaminação' },
  { key: 'distanciaMinimaConstrucoes', label: 'Distância Mínima de Construções' },
  { key: 'distanciaSeguraLavouras', label: 'Distância Segura de Lavouras' },
  { key: 'acessoVeiculos', label: 'Acesso a Veículos' },
]

function isConditionMet(value: string | undefined): boolean {
  if (!value) return false
  const v = value.toLowerCase()
  return v === 'sim' || v === 'yes' || v === 'true' || v === '1'
}

export default function FindMeliponary() {
  const { setLoading } = useLoading()
  const navigate = useNavigate()
  const [geojson, setGeojson] = useState(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  )
  const [selectedCoordinates, setSelectedCoordinates] = useState<
    [number, number] | null
  >(null)
  const { id } = useParams<{ id: string }>()
  const {
    data: meliponary,
    isLoading: meliponaryLoading,
    error: meliponaryError,
  } = useGetMeliponaryQuery(id!, { skip: !id })

  React.useEffect(() => {
    setLoading(meliponaryLoading)
  }, [meliponaryLoading, setLoading])

  React.useEffect(() => {
    if (meliponaryError) {
      toast.error('Erro ao carregar meliponário')
    }
  }, [meliponaryError])

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
    if (meliponary && meliponary.latitude && meliponary.longitude) {
      setSelectedCoordinates([
        Number(meliponary.latitude),
        Number(meliponary.longitude),
      ])
    }
  }, [meliponary])

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {meliponaryError && (
        <div className="p-4 text-red-600">Erro ao carregar meliponário.</div>
      )}
      {meliponary && meliponary.latitude && meliponary.longitude && (
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

              {userLocation && (
                <React.Fragment>
                  <Marker position={userLocation}>
                    <Popup>Você está aqui</Popup>
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
              onClick={() => navigate('/meus-meliponarios')}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{meliponary.name}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {meliponary.tipoInstalacao && (
                    <Badge variant="secondary">{meliponary.tipoInstalacao}</Badge>
                  )}
                  {meliponary.especieAbelha && (
                    <Badge variant="outline">{meliponary.especieAbelha}</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Coordinates */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {meliponary.latitude}, {meliponary.longitude}
                  </span>
                </div>

                {meliponary.quantidadeColmeias && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Qtd. Colmeias: </span>
                    <span className="font-medium">{meliponary.quantidadeColmeias}</span>
                  </div>
                )}

                {meliponary.outrosMeliponariosRaio1km && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Outros meliponários (raio 1km): </span>
                    <span className="font-medium">{meliponary.outrosMeliponariosRaio1km}</span>
                  </div>
                )}

                {meliponary.qtdColmeiasOutrosMeliponarios && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Colmeias outros meliponários: </span>
                    <span className="font-medium">{meliponary.qtdColmeiasOutrosMeliponarios}</span>
                  </div>
                )}

                <Separator />

                {/* Capacidade de Suporte */}
                <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    Capacidade de Suporte
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-200">
                    {meliponary.capacidadeDeSuporte ?? 'N/A'}
                  </p>
                </div>

                <Separator />

                {/* Condition fields */}
                <div>
                  <p className="mb-2 text-sm font-medium">Condições</p>
                  <div className="flex flex-wrap gap-2">
                    {conditionFields.map(({ key, label }) => {
                      const value = (meliponary as Record<string, unknown>)[key] as string | undefined
                      const met = isConditionMet(value)
                      return (
                        <Badge
                          key={key}
                          variant="outline"
                          className={
                            met
                              ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-400'
                              : 'border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500'
                          }
                        >
                          {met ? (
                            <Check className="mr-1 h-3 w-3" />
                          ) : (
                            <X className="mr-1 h-3 w-3" />
                          )}
                          {label}
                        </Badge>
                      )
                    })}
                  </div>
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
