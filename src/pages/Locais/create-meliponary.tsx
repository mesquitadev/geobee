import { useCallback, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from 'react-leaflet'

import { Wizard } from '@/components/wizard/wizard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

import { useCreateMeliponaryMutation } from '@/redux/slices/meliponarySlice'
import {
  especiesAbelhasOptions,
  tipoInstalacaoApiarioOptions,
  qtdColmeiasOptions,
  outrosApiariosRaio3kmOptions,
  qtdColmeiasOutrosApiariosOptions,
  simNaoOptions,
} from '@/utils/options'
import marker from '@/assets/apiary.png'

interface MeliponaryFormData {
  nome: string
  tipoInstalacao: string
  especieAbelha: string
  quantidadeColmeias: string
  latitude: string
  longitude: string
  outrosMeliponariosRaio1km: string
  qtdColmeiasOutrosMeliponarios: string
  fontesNectarPolen: string
  disponibilidadeAgua: string
  sombreamentoNatural: string
  protecaoVentosFortes: string
  distanciaSeguraContaminacao: string
  distanciaMinimaConstrucoes: string
  distanciaSeguraLavouras: string
  acessoVeiculos: string
}

function LocationMarker({
  onSelect,
  position,
  icon,
}: {
  onSelect: (lat: number, lng: number) => void
  position: { lat: number; lng: number } | null
  icon: L.Icon
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return position ? (
    <Marker position={position} icon={icon}>
      <Popup>Coordenadas selecionadas</Popup>
    </Marker>
  ) : null
}

export default function CreateMeliponary() {
  const navigate = useNavigate()
  const [createMeliponary, { isLoading }] = useCreateMeliponaryMutation()
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  const {
    control,
    watch,
    trigger,
    getValues,
    setValue,
  } = useForm<MeliponaryFormData>({
    defaultValues: {
      nome: '',
      tipoInstalacao: '',
      especieAbelha: '',
      quantidadeColmeias: '',
      latitude: '',
      longitude: '',
      outrosMeliponariosRaio1km: '',
      qtdColmeiasOutrosMeliponarios: '',
      fontesNectarPolen: '',
      disponibilidadeAgua: '',
      sombreamentoNatural: '',
      protecaoVentosFortes: '',
      distanciaSeguraContaminacao: '',
      distanciaMinimaConstrucoes: '',
      distanciaSeguraLavouras: '',
      acessoVeiculos: '',
    },
  })

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
          toast.error('Nao foi possivel obter sua localizacao')
        },
      )
    } else {
      toast.warning('Seu navegador nao suporta geolocalizacao')
    }
  }, [handleLocationSelect])

  const watchedOutrosMeliponarios = watch('outrosMeliponariosRaio1km')

  // Condition field labels
  const conditionFields = [
    { name: 'fontesNectarPolen' as const, label: 'Ha fontes de nectar e polen (flores) ate 2km do local que pretende instalar o meliponario?' },
    { name: 'disponibilidadeAgua' as const, label: 'Ha disponibilidade de agua de qualidade ate 500m a partir do local escolhido?' },
    { name: 'sombreamentoNatural' as const, label: 'Ha sombreamento natural para as colmeias?' },
    { name: 'protecaoVentosFortes' as const, label: 'Ha protecao contra ventos fortes?' },
    { name: 'distanciaSeguraContaminacao' as const, label: 'Ha uma distancia segura (minimo de 3km) de possiveis fontes de contaminacao?' },
    { name: 'distanciaMinimaConstrucoes' as const, label: 'O local atende a uma distancia minima (400m) de estradas movimentadas, currais, aviarios e outras construcoes?' },
    { name: 'distanciaSeguraLavouras' as const, label: 'O local possui uma distancia segura (3km) de lavouras (milho, soja, transgenicos, etc.)?' },
    { name: 'acessoVeiculos' as const, label: 'O local e de facil acesso para entrada e saida de veiculos?' },
  ]

  const validateStep1 = async () => {
    const result = await trigger(['nome', 'tipoInstalacao', 'especieAbelha', 'quantidadeColmeias'])
    const values = getValues()
    if (!values.nome || !values.tipoInstalacao || !values.especieAbelha || !values.quantidadeColmeias) {
      toast.error('Preencha todos os campos obrigatorios')
      return false
    }
    return result
  }

  const validateStep2 = async () => {
    const values = getValues()
    if (!values.latitude || !values.longitude) {
      toast.error('Selecione as coordenadas no mapa ou use sua localizacao')
      return false
    }
    return true
  }

  const validateStep3 = async () => {
    const values = getValues()
    const requiredConditions = [
      'outrosMeliponariosRaio1km',
      'fontesNectarPolen',
      'disponibilidadeAgua',
      'sombreamentoNatural',
      'protecaoVentosFortes',
      'distanciaSeguraContaminacao',
      'distanciaMinimaConstrucoes',
      'distanciaSeguraLavouras',
      'acessoVeiculos',
    ] as const
    for (const field of requiredConditions) {
      if (!values[field]) {
        toast.error('Responda todas as perguntas sobre as condicoes do local')
        return false
      }
    }

    // Validation warnings
    if (values.fontesNectarPolen === 'false') {
      toast.warning('Aqui nao e um local adequado para colocar o meliponario!')
      return false
    }
    if (values.protecaoVentosFortes === 'false') {
      toast.warning('Aqui nao e um local adequado para colocar o meliponario!')
      return false
    }
    if (values.distanciaSeguraContaminacao === 'false') {
      toast.warning('Aqui nao e um local adequado para colocar o meliponario!')
      return false
    }
    if (values.distanciaMinimaConstrucoes === 'false') {
      toast.warning('Aqui nao e um local adequado para colocar o meliponario!')
      return false
    }
    if (values.distanciaSeguraLavouras === 'false') {
      toast.warning('Aqui nao e um local adequado para colocar o meliponario!')
      return false
    }

    if (values.disponibilidadeAgua === 'false') {
      toast.info('Sera necessario adicionar agua de qualidade no local!')
    }
    if (values.sombreamentoNatural === 'false') {
      toast.info('Sera necessario colocar as caixas a sombra!')
    }
    if (values.acessoVeiculos === 'false') {
      toast.warning('E necessario que haja acesso para entrada e saida do meliponario')
    }

    return true
  }

  const handleComplete = async () => {
    const data = getValues()
    try {
      await createMeliponary({
        name: data.nome,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        tipoInstalacao: data.tipoInstalacao,
        especieAbelha: data.especieAbelha,
        quantidadeColmeias: data.quantidadeColmeias,
        outrosMeliponariosRaio1km: data.outrosMeliponariosRaio1km,
        qtdColmeiasOutrosMeliponarios: data.qtdColmeiasOutrosMeliponarios || undefined,
        fontesNectarPolen: data.fontesNectarPolen,
        disponibilidadeAgua: data.disponibilidadeAgua,
        sombreamentoNatural: data.sombreamentoNatural,
        protecaoVentosFortes: data.protecaoVentosFortes,
        distanciaSeguraContaminacao: data.distanciaSeguraContaminacao,
        distanciaMinimaConstrucoes: data.distanciaMinimaConstrucoes,
        distanciaSeguraLavouras: data.distanciaSeguraLavouras,
        acessoVeiculos: data.acessoVeiculos,
      } as any).unwrap()
      toast.success('Meliponario criado com sucesso!')
      navigate('/meus-locais')
    } catch {
      toast.error('Erro ao criar meliponario')
    }
  }

  const allValues = watch()

  const steps = [
    {
      title: 'Dados Basicos',
      description: 'Informacoes gerais do meliponario',
      validate: validateStep1,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Controller
              name="nome"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  id="nome"
                  placeholder="Nome para identificacao do meliponario..."
                  {...field}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Instalacao *</Label>
            <Controller
              name="tipoInstalacao"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de instalacao" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoInstalacaoApiarioOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Especie de Abelha *</Label>
            <Controller
              name="especieAbelha"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a especie" />
                  </SelectTrigger>
                  <SelectContent>
                    {especiesAbelhasOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Quantidade de Colmeias *</Label>
            <Controller
              name="quantidadeColmeias"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a quantidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {qtdColmeiasOptions.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Localizacao',
      description: 'Selecione a localizacao do meliponario no mapa',
      validate: validateStep2,
      content: (
        <div className="space-y-4">
          <Button type="button" variant="outline" className="w-full" onClick={getUserLocation}>
            Usar Minha Localizacao
          </Button>

          <div className="overflow-hidden rounded-lg border">
            <MapContainer
              center={[-2.5555334824608353, -44.208297729492195]}
              zoom={13}
              style={{ height: '350px', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {userLocation && (
                <Marker icon={myIcon} position={userLocation}>
                  <Popup>Voce esta aqui</Popup>
                </Marker>
              )}
              <LocationMarker
                onSelect={handleLocationSelect}
                position={position}
                icon={myIcon}
              />
            </MapContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input value={allValues.latitude || ''} disabled placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input value={allValues.longitude || ''} disabled placeholder="0" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Condicoes',
      description: 'Condicoes do local de instalacao',
      validate: validateStep3,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Ha outros meliponarios no raio de 1 KM?</Label>
            <Controller
              name="outrosMeliponariosRaio1km"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {outrosApiariosRaio3kmOptions.map((opt) => (
                      <SelectItem key={String(opt.value)} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {watchedOutrosMeliponarios === 'true' && (
            <div className="space-y-2">
              <Label>Quantidade de colmeias nos outros meliponarios</Label>
              <Controller
                name="qtdColmeiasOutrosMeliponarios"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {qtdColmeiasOutrosApiariosOptions.map((opt) => (
                        <SelectItem key={String(opt.value)} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {conditionFields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label>{field.label}</Label>
              <Controller
                name={field.name}
                control={control}
                render={({ field: controllerField }) => (
                  <Select onValueChange={controllerField.onChange} value={controllerField.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {simNaoOptions.map((opt) => (
                        <SelectItem key={String(opt.value)} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Resumo',
      description: 'Revise os dados antes de confirmar',
      content: (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Nome:</span>
                  <p className="font-medium">{allValues.nome}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo de Instalacao:</span>
                  <p className="font-medium">{allValues.tipoInstalacao}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Especie:</span>
                  <Badge variant="secondary" className="mt-1">{allValues.especieAbelha}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Colmeias:</span>
                  <p className="font-medium">{allValues.quantidadeColmeias}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Latitude:</span>
                  <p className="font-medium">{allValues.latitude}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Longitude:</span>
                  <p className="font-medium">{allValues.longitude}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {position && (
            <div className="overflow-hidden rounded-lg border">
              <MapContainer
                center={[position.lat, position.lng]}
                zoom={15}
                style={{ height: '200px', width: '100%' }}
                dragging={false}
                zoomControl={false}
                scrollWheelZoom={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={position} icon={myIcon}>
                  <Popup>Localizacao do meliponario</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          <Card>
            <CardContent className="p-4 space-y-2 text-sm">
              <h4 className="font-semibold">Condicoes do Local</h4>
              <div className="grid grid-cols-1 gap-1">
                <SummaryRow label="Outros meliponarios no raio de 1km" value={allValues.outrosMeliponariosRaio1km} />
                {allValues.outrosMeliponariosRaio1km === 'true' && (
                  <SummaryRow label="Qtd colmeias outros meliponarios" value={allValues.qtdColmeiasOutrosMeliponarios} />
                )}
                <SummaryRow label="Fontes de nectar e polen" value={allValues.fontesNectarPolen} />
                <SummaryRow label="Disponibilidade de agua" value={allValues.disponibilidadeAgua} />
                <SummaryRow label="Sombreamento natural" value={allValues.sombreamentoNatural} />
                <SummaryRow label="Protecao contra ventos" value={allValues.protecaoVentosFortes} />
                <SummaryRow label="Distancia de contaminacao" value={allValues.distanciaSeguraContaminacao} />
                <SummaryRow label="Distancia de construcoes" value={allValues.distanciaMinimaConstrucoes} />
                <SummaryRow label="Distancia de lavouras" value={allValues.distanciaSeguraLavouras} />
                <SummaryRow label="Acesso a veiculos" value={allValues.acessoVeiculos} />
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6">
      <Wizard
        steps={steps}
        onComplete={handleComplete}
        onCancel={() => navigate('/meus-locais')}
        submitLabel="Cadastrar Meliponario"
        isSubmitting={isLoading}
      />
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <Badge variant={value === 'true' ? 'default' : value === 'false' ? 'destructive' : 'outline'}>
        {value === 'true' ? 'Sim' : value === 'false' ? 'Nao' : value || '--'}
      </Badge>
    </div>
  )
}
