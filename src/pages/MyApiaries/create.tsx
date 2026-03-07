import { useCallback, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import marker from '@/assets/apiary.png'
import { useCreateApiaryMutation } from '@/redux/slices/apiariesSlice'
import { Wizard } from '@/components/wizard/wizard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ApiaryFormData {
  name: string
  tipoInstalacao: string
  tempoItinerante?: string
  quantidadeColmeias: string
  latitude: string
  longitude: string
  fontesNectarPolen: boolean
  disponibilidadeAgua: boolean
  sombreamentoNatural: boolean
  protecaoVentosFortes: boolean
  distanciaSeguraContaminacao: boolean
  distanciaMinimaConstrucoes: boolean
  distanciaSeguraLavouras: boolean
  acessoVeiculos: boolean
  outrosApiariosRaio3km: boolean
  qtdColmeiasOutrosApiarios?: string
}

function LocationMarker({
  onLocationSelect,
  position,
  icon,
}: {
  onLocationSelect: (lat: number, lng: number) => void
  position: { lat: number; lng: number } | null
  icon: L.Icon
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  return position === null ? null : (
    <Marker icon={icon} position={position}>
      <Popup>Localização selecionada</Popup>
    </Marker>
  )
}

export default function NewApiary() {
  const navigate = useNavigate()
  const [createApiary, { isLoading }] = useCreateApiaryMutation()
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<ApiaryFormData>({
    defaultValues: {
      name: '',
      tipoInstalacao: '',
      tempoItinerante: '',
      quantidadeColmeias: '',
      latitude: '',
      longitude: '',
      fontesNectarPolen: false,
      disponibilidadeAgua: false,
      sombreamentoNatural: false,
      protecaoVentosFortes: false,
      distanciaSeguraContaminacao: false,
      distanciaMinimaConstrucoes: false,
      distanciaSeguraLavouras: false,
      acessoVeiculos: false,
      outrosApiariosRaio3km: false,
      qtdColmeiasOutrosApiarios: '',
    },
  })

  const tipoInstalacao = watch('tipoInstalacao')
  const outrosApiariosRaio3km = watch('outrosApiariosRaio3km')

  const myIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl: marker as string,
        iconRetinaUrl: marker as string,
        popupAnchor: [0, 0],
        iconSize: [32, 32],
      }),
    [],
  )

  const handleLocationSelect = useCallback(
    (lat: number, lng: number) => {
      setPosition({ lat, lng })
      setValue('latitude', String(lat))
      setValue('longitude', String(lng))
    },
    [setValue],
  )

  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleLocationSelect(pos.coords.latitude, pos.coords.longitude)
          setUserLocation([pos.coords.latitude, pos.coords.longitude])
        },
        () => {
          toast.error('Não foi possível obter sua localização')
        },
      )
    } else {
      toast.warning('Seu navegador não suporta geolocalização')
    }
  }, [handleLocationSelect])

  const onSubmit = async (data: ApiaryFormData) => {
    try {
      // Convert booleans to string "true"/"false" for backend compatibility
      const payload = {
        name: data.name,
        tipoInstalacao: data.tipoInstalacao,
        tempoItinerante: data.tempoItinerante || null,
        quantidadeColmeias: data.quantidadeColmeias,
        latitude: data.latitude,
        longitude: data.longitude,
        fontesNectarPolen: String(data.fontesNectarPolen),
        disponibilidadeAgua: String(data.disponibilidadeAgua),
        sombreamentoNatural: String(data.sombreamentoNatural),
        protecaoVentosFortes: String(data.protecaoVentosFortes),
        distanciaSeguraContaminacao: String(data.distanciaSeguraContaminacao),
        distanciaMinimaConstrucoes: String(data.distanciaMinimaConstrucoes),
        distanciaSeguraLavouras: String(data.distanciaSeguraLavouras),
        acessoVeiculos: String(data.acessoVeiculos),
        outrosApiariosRaio3km: String(data.outrosApiariosRaio3km),
        qtdColmeiasOutrosApiarios: data.qtdColmeiasOutrosApiarios || null,
      }
      await createApiary(payload).unwrap()
      toast.success('Cadastro realizado com sucesso!')
      navigate('/meus-apiarios')
    } catch {
      toast.error('Erro no cadastro!')
    }
  }

  const allValues = watch()

  const boolLabel = (v: boolean) => (v ? 'Sim' : 'Não')

  const steps = [
    {
      title: 'Dados Básicos',
      description: 'Informações gerais do apiário',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Nome para identificação do apiário"
              {...register('name', { required: 'Este campo é obrigatório' })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo de Instalação *</Label>
            <Controller
              name="tipoInstalacao"
              control={control}
              rules={{ required: 'Este campo é obrigatório' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixo">Fixo</SelectItem>
                    <SelectItem value="Intinerante">Itinerante</SelectItem>
                    <SelectItem value="Misto">Misto</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tipoInstalacao && (
              <p className="text-sm text-destructive">{errors.tipoInstalacao.message}</p>
            )}
          </div>

          {tipoInstalacao && tipoInstalacao !== 'Fixo' && (
            <div className="space-y-2">
              <Label htmlFor="tempoItinerante">Tempo Itinerante</Label>
              <Controller
                name="tempoItinerante"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Até 30 Dias">Até 30 Dias</SelectItem>
                      <SelectItem value="Até 60 Dias">Até 60 Dias</SelectItem>
                      <SelectItem value="Até 90 Dias">Até 90 Dias</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantidadeColmeias">Quantidade de Colmeias *</Label>
            <Input
              id="quantidadeColmeias"
              type="number"
              placeholder="Número de colmeias"
              {...register('quantidadeColmeias', { required: 'Este campo é obrigatório' })}
            />
            {errors.quantidadeColmeias && (
              <p className="text-sm text-destructive">{errors.quantidadeColmeias.message}</p>
            )}
          </div>
        </div>
      ),
      validate: () => trigger(['name', 'tipoInstalacao', 'quantidadeColmeias']),
    },
    {
      title: 'Localização',
      description: 'Selecione a localização no mapa ou insira coordenadas',
      content: (
        <div className="space-y-4">
          <button
            type="button"
            onClick={getUserLocation}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Usar Minha Localização
          </button>

          <MapContainer
            center={[-2.5555334824608353, -44.208297729492195]}
            zoom={13}
            style={{ height: '350px', width: '100%' }}
            className="rounded-md"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {userLocation && (
              <Marker icon={myIcon} position={userLocation}>
                <Popup>Você está aqui</Popup>
              </Marker>
            )}
            <LocationMarker
              onLocationSelect={handleLocationSelect}
              position={position}
              icon={myIcon}
            />
          </MapContainer>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                placeholder="0"
                {...register('latitude')}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  if (!isNaN(val)) {
                    const lng = parseFloat(getValues('longitude') || '0')
                    setPosition({ lat: val, lng })
                  }
                  register('latitude').onChange(e)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                placeholder="0"
                {...register('longitude')}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  if (!isNaN(val)) {
                    const lat = parseFloat(getValues('latitude') || '0')
                    setPosition({ lat, lng: val })
                  }
                  register('longitude').onChange(e)
                }}
              />
            </div>
          </div>
        </div>
      ),
      validate: () => {
        const lat = getValues('latitude')
        const lng = getValues('longitude')
        if (!lat || !lng) {
          toast.error('Selecione uma localização no mapa ou preencha as coordenadas')
          return false
        }
        return true
      },
    },
    {
      title: 'Condições',
      description: 'Condições do local para instalação',
      content: (
        <div className="space-y-6">
          {/* Recursos */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Recursos
            </h4>
            <Controller
              name="fontesNectarPolen"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fontesNectarPolen"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="fontesNectarPolen" className="text-sm font-normal">
                    Fontes de néctar e pólen próximas (até 3km)
                  </Label>
                </div>
              )}
            />
            <Controller
              name="disponibilidadeAgua"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="disponibilidadeAgua"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="disponibilidadeAgua" className="text-sm font-normal">
                    Disponibilidade de água de qualidade (até 500m)
                  </Label>
                </div>
              )}
            />
          </div>

          {/* Proteção */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Proteção
            </h4>
            <Controller
              name="sombreamentoNatural"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sombreamentoNatural"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="sombreamentoNatural" className="text-sm font-normal">
                    Sombreamento natural para as colmeias
                  </Label>
                </div>
              )}
            />
            <Controller
              name="protecaoVentosFortes"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="protecaoVentosFortes"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="protecaoVentosFortes" className="text-sm font-normal">
                    Proteção contra ventos fortes
                  </Label>
                </div>
              )}
            />
          </div>

          {/* Segurança */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Segurança
            </h4>
            <Controller
              name="distanciaSeguraContaminacao"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="distanciaSeguraContaminacao"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="distanciaSeguraContaminacao" className="text-sm font-normal">
                    Distância segura de fontes de contaminação (min. 3km)
                  </Label>
                </div>
              )}
            />
            <Controller
              name="distanciaMinimaConstrucoes"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="distanciaMinimaConstrucoes"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="distanciaMinimaConstrucoes" className="text-sm font-normal">
                    Distância mínima de construções (min. 400m)
                  </Label>
                </div>
              )}
            />
            <Controller
              name="distanciaSeguraLavouras"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="distanciaSeguraLavouras"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="distanciaSeguraLavouras" className="text-sm font-normal">
                    Distância segura de lavouras (min. 3km)
                  </Label>
                </div>
              )}
            />
          </div>

          {/* Acesso */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Acesso
            </h4>
            <Controller
              name="acessoVeiculos"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acessoVeiculos"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="acessoVeiculos" className="text-sm font-normal">
                    Acesso para veículos
                  </Label>
                </div>
              )}
            />
          </div>

          {/* Outros apiários */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Há outros apiários no raio de 3km?
            </Label>
            <Controller
              name="outrosApiariosRaio3km"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={String(field.value)}
                  onValueChange={(val) => field.onChange(val === 'true')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="raio-sim" />
                    <Label htmlFor="raio-sim" className="font-normal">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="raio-nao" />
                    <Label htmlFor="raio-nao" className="font-normal">Não</Label>
                  </div>
                </RadioGroup>
              )}
            />

            {outrosApiariosRaio3km && (
              <div className="space-y-2">
                <Label htmlFor="qtdColmeiasOutrosApiarios">
                  Quantidade de colmeias nos outros apiários
                </Label>
                <Input
                  id="qtdColmeiasOutrosApiarios"
                  type="number"
                  placeholder="Quantidade"
                  {...register('qtdColmeiasOutrosApiarios')}
                />
              </div>
            )}
          </div>
        </div>
      ),
      validate: () => true,
    },
    {
      title: 'Resumo',
      description: 'Revise os dados antes de confirmar',
      content: (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold">Dados Básicos</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Nome:</span>
                <span>{allValues.name}</span>
                <span className="text-muted-foreground">Tipo:</span>
                <span>{allValues.tipoInstalacao}</span>
                {allValues.tempoItinerante && (
                  <>
                    <span className="text-muted-foreground">Tempo Itinerante:</span>
                    <span>{allValues.tempoItinerante}</span>
                  </>
                )}
                <span className="text-muted-foreground">Colmeias:</span>
                <span>{allValues.quantidadeColmeias}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold">Localização</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Latitude:</span>
                <span>{allValues.latitude}</span>
                <span className="text-muted-foreground">Longitude:</span>
                <span>{allValues.longitude}</span>
              </div>
              {position && (
                <MapContainer
                  center={[position.lat, position.lng]}
                  zoom={13}
                  style={{ height: '200px', width: '100%' }}
                  className="rounded-md"
                  dragging={false}
                  scrollWheelZoom={false}
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker icon={myIcon} position={[position.lat, position.lng]}>
                    <Popup>Localização selecionada</Popup>
                  </Marker>
                </MapContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold">Condições do Local</h4>
              <div className="grid grid-cols-1 gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fontes de néctar e pólen:</span>
                  <span>{boolLabel(allValues.fontesNectarPolen)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disponibilidade de água:</span>
                  <span>{boolLabel(allValues.disponibilidadeAgua)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sombreamento natural:</span>
                  <span>{boolLabel(allValues.sombreamentoNatural)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Proteção ventos fortes:</span>
                  <span>{boolLabel(allValues.protecaoVentosFortes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dist. segura contaminação:</span>
                  <span>{boolLabel(allValues.distanciaSeguraContaminacao)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dist. mínima construções:</span>
                  <span>{boolLabel(allValues.distanciaMinimaConstrucoes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dist. segura lavouras:</span>
                  <span>{boolLabel(allValues.distanciaSeguraLavouras)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Acesso veículos:</span>
                  <span>{boolLabel(allValues.acessoVeiculos)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outros apiários (3km):</span>
                  <span>{boolLabel(allValues.outrosApiariosRaio3km)}</span>
                </div>
                {allValues.outrosApiariosRaio3km && allValues.qtdColmeiasOutrosApiarios && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Qtd. colmeias outros:</span>
                    <span>{allValues.qtdColmeiasOutrosApiarios}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ),
      validate: () => true,
    },
  ]

  return (
    <div className="p-6">
      <Wizard
        steps={steps}
        onComplete={handleSubmit(onSubmit)}
        onCancel={() => navigate('/meus-apiarios')}
        submitLabel="Cadastrar Apiário"
        isSubmitting={isLoading}
      />
    </div>
  )
}
