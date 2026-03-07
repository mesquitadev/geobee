// @ts-nocheck
import { yupResolver } from '@hookform/resolvers/yup'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { toast } from 'sonner'
import { useCallback, useEffect, useState, useMemo, memo } from 'react'
import { SubmitHandler, useForm, Resolver } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from 'react-leaflet'
import * as yup from 'yup'
import marker from '../../assets/apiary.png'
import Breadcumbs from '../../components/Breadcumbs'
import Input from '../../components/Input'
import InputContainer from '../../components/Input/Container.tsx'
import InputLabel from '../../components/Input/Label.tsx'
import Select from '../../components/Select'
import SelectContainer from '../../components/Select/Container.tsx'
import { useLoading } from '../../hooks/useLoading.tsx'
import {
  especiesAbelhasOptions,
  outrosApiariosRaio3kmOptions,
  qtdColmeiasOptions,
  qtdColmeiasOutrosApiariosOptions,
  simNaoOptions,
  tipoInstalacaoApiarioOptions,
} from '../../utils/options.ts'
import { useCreateMeliponaryMutation } from '../../redux/slices/meliponarySlice'

interface Inputs {
  name: string
  latitude: string
  longitude: string
  tipoInstalacao: string
  especieAbelha?: string
  quantidadeColmeias: string
  outrosMeliponariosRaio1km: string
  qtdColmeiasOutrosMeliponarios?: string | null
  fontesNectarPolen: string
  disponibilidadeAgua: string
  sombreamentoNatural: string
  protecaoVentosFortes: string
  distanciaSeguraContaminacao: string
  distanciaMinimaConstrucoes: string
  distanciaSeguraLavouras: string
  acessoVeiculos: string
  capacidadeDeSuporte?: string
}

// Tipo para as notificações de validação
interface ValidationNotification {
  message: string
  variant: 'warning' | 'info' | 'error' | 'success'
  disableForm?: boolean
}

const NewMeliponary = () => {
  const { setLoading } = useLoading()
  const navigate = useNavigate()
  const [disabled, setDisabled] = useState(false)
  const [latitude, setLatitude] = useState<number>(0)
  const [longitude, setLongitude] = useState<number>(0)
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null,
  )
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  )
  const [createMeliponary, { isLoading }] = useCreateMeliponaryMutation()

  const meliponarioFormSchema = yup.object().shape({
    name: yup.string().required('Este campo é obrigatório'),
    latitude: yup.string().optional(),
    longitude: yup.string().optional(),
    tipoInstalacao: yup.string().required('Este campo é obrigatório'),
    especieAbelha: yup.string().required('Este campo é obrigatório'),
    quantidadeColmeias: yup.string().required('Este campo é obrigatório'),
    outrosMeliponariosRaio1km: yup
      .string()
      .required('Este campo é obrigatório'),
    qtdColmeiasOutrosMeliponarios: yup.string().nullable().optional(),
    fontesNectarPolen: yup.string().required('Este campo é obrigatório'),
    disponibilidadeAgua: yup.string().required('Este campo é obrigatório'),
    sombreamentoNatural: yup.string().required('Este campo é obrigatório'),
    protecaoVentosFortes: yup.string().required('Este campo é obrigatório'),
    distanciaSeguraContaminacao: yup
      .string()
      .required('Este campo é obrigatório'),
    distanciaMinimaConstrucoes: yup
      .string()
      .required('Este campo é obrigatório'),
    distanciaSeguraLavouras: yup.string().required('Este campo é obrigatório'),
    acessoVeiculos: yup.string().required('Este campo é obrigatório'),
    capacidadeDeSuporte: yup.string().optional(),
  })

  const { handleSubmit, formState, control, watch } = useForm<Inputs>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: yupResolver<Inputs>(meliponarioFormSchema) as Resolver<Inputs>,
  })
  const { errors } = formState

  // Observar todos os campos de uma vez para melhor performance
  const watchedFields = watch([
    'outrosMeliponariosRaio1km',
    'fontesNectarPolen',
    'disponibilidadeAgua',
    'sombreamentoNatural',
    'protecaoVentosFortes',
    'distanciaSeguraContaminacao',
    'distanciaMinimaConstrucoes',
    'distanciaSeguraLavouras',
    'acessoVeiculos',
  ])

  // Desestruturação dos valores observados
  const [
    outrosMeliponariosRaio1km,
    fontesNectarPolen,
    disponibilidadeAgua,
    sombreamentoNatural,
    protecaoVentosFortes,
    distanciaSeguraContaminacao,
    distanciaMinimaConstrucoes,
    distanciaSeguraLavouras,
    acessoVeiculos,
  ] = watchedFields

  // Memoização do ícone do mapa
  const myIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl: marker as string,
        iconRetinaUrl: marker as string,
        popupAnchor: [-0, -0],
        iconSize: [32, 32],
      }),
    [],
  )

  const onSubmit = async (data: Inputs) => {
    // Garantir que as coordenadas foram selecionadas
    if (!latitude || !longitude) {
      toast.warning('Selecione as coordenadas no mapa ou use sua localização.')
      return
    }

    const payload = {
      ...data,
      latitude: String(latitude),
      longitude: String(longitude),
    }

    setLoading(true)
    try {
      await createMeliponary(payload).unwrap()
      toast.success('Meliponário criado com sucesso!')
      navigate('/meus-meliponarios')
    } catch (err) {
      toast.error('Erro ao criar meliponário')
    } finally {
      setLoading(false)
    }
  }

  const validateFormFields = useCallback(() => {
    const notifications: ValidationNotification[] = []

    if (fontesNectarPolen === 'false') {
      notifications.push({
        message:
          'OOPS! Aqui não é um local adequado para colocar o meliponário!',
        variant: 'warning',
        disableForm: true,
      })
    }

    if (disponibilidadeAgua === 'false') {
      notifications.push({
        message: 'OOPS! Será necessário adicionar água de qualidade no local!',
        variant: 'info',
      })
    }

    if (sombreamentoNatural === 'false') {
      notifications.push({
        message: 'OOPS! Será necessário colocar as caixas à sombra!',
        variant: 'info',
      })
    }

    if (protecaoVentosFortes === 'false') {
      notifications.push({
        message:
          'OOPS! Aqui não é um local adequado para colocar o meliponário!',
        variant: 'warning',
        disableForm: true,
      })
    }

    if (distanciaSeguraContaminacao === 'false') {
      notifications.push({
        message:
          'OOPS! Aqui não é um local adequado para colocar o meliponário!',
        variant: 'warning',
        disableForm: true,
      })
    }

    if (distanciaMinimaConstrucoes === 'false') {
      notifications.push({
        message:
          'OOPS! Aqui não é um local adequado para colocar o meliponário!',
        variant: 'warning',
        disableForm: true,
      })
    }

    if (distanciaSeguraLavouras === 'false') {
      notifications.push({
        message:
          'OOPS! Aqui não é um local adequado para colocar o meliponário!',
        variant: 'warning',
        disableForm: true,
      })
    }

    if (acessoVeiculos === 'false') {
      notifications.push({
        message:
          'É necessário que haja acesso para entrada e saída do meliponário',
        variant: 'warning',
      })
    }

    return {
      notifications,
      shouldDisableForm: notifications.some((n) => n.disableForm),
    }
  }, [
    fontesNectarPolen,
    disponibilidadeAgua,
    sombreamentoNatural,
    protecaoVentosFortes,
    distanciaSeguraContaminacao,
    distanciaMinimaConstrucoes,
    distanciaSeguraLavouras,
    acessoVeiculos,
  ])

  useEffect(() => {
    const { notifications, shouldDisableForm } = validateFormFields()
    notifications.forEach(({ message, variant }) => {
      toast[variant](message)
    })
    setDisabled(shouldDisableForm)
  }, [validateFormFields])

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat)
    setLongitude(lng)
    setPosition({ lat, lng })
  }

  // Definindo o componente LocationMarker com displayName
  const LocationMarker = memo(() => {
    useMapEvents({
      click(e) {
        handleLocationSelect(e.latlng.lat, e.latlng.lng)
      },
    })
    return position === null ? null : (
      <Marker position={position} icon={myIcon}>
        <Popup>Coordenadas selecionadas</Popup>
      </Marker>
    )
  })
  // Adicionando displayName explícito para o componente memoizado
  LocationMarker.displayName = 'LocationMarker'

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationSelect(
            position.coords.latitude,
            position.coords.longitude,
          )
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.error(error)
        },
      )
    }
  }

  return (
    <div className="h-full w-full p-4 pb-0 md:p-6 lg:p-10">
      <Breadcumbs pageName="Cadastrar Meliponário" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="mb-5">
          <p className="mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
            Selecione as Coordenadas
          </p>
          <button
            onClick={getUserLocation}
            className="my-3 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Usar Minha Localização
          </button>
          <MapContainer
            center={[-2.5555334824608353, -44.208297729492195]}
            zoom={13}
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {userLocation && (
              <Marker icon={myIcon} position={userLocation}>
                <Popup>Você está aqui</Popup>
              </Marker>
            )}
            <LocationMarker />
          </MapContainer>
        </div>
        <div className="mb-0">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mb-0 w-full pb-24 md:pb-20"
          >
            <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
              <InputContainer className="mb-6  w-full px-3 md:mb-0">
                <InputLabel label="Nome" name="name" />
                <Input
                  className=""
                  control={control}
                  name="name"
                  placeholder="Nome para identificação do meliponário..."
                  errors={errors?.name?.message}
                />
              </InputContainer>

              <InputContainer className="mb-6 w-full px-3 md:mb-0 md:w-1/2">
                <InputLabel label="Latitude" name="latitude" />
                <Input
                  className=""
                  control={control}
                  name="latitude"
                  placeholder="0"
                  value={latitude}
                  disabled
                  errors={errors?.latitude?.message}
                />
              </InputContainer>
              <InputContainer className="mb-6 w-full px-3 md:mb-0 md:w-1/2">
                <InputLabel label="Longitude" name="longitude" />
                <Input
                  className=""
                  control={control}
                  name="longitude"
                  placeholder="0"
                  value={longitude}
                  disabled
                  errors={errors?.longitude?.message}
                />
              </InputContainer>

              <SelectContainer className="w-full px-3 py-2">
                <InputLabel
                  label="O meliponário a ser instalado será?"
                  name="tipoInstalacao"
                />
                <Select<Inputs>
                  options={tipoInstalacaoApiarioOptions}
                  control={control}
                  name="tipoInstalacao"
                  className=""
                  errors={errors?.tipoInstalacao?.message}
                />
              </SelectContainer>

              <SelectContainer className="w-full px-3 py-2">
                <InputLabel
                  label="Qual a espécie de abelha sem ferrão pretende criar?"
                  name="role"
                />
                <Select<Inputs>
                  options={especiesAbelhasOptions}
                  control={control}
                  name="especieAbelha"
                  className=""
                  errors={errors?.especieAbelha?.message}
                />
              </SelectContainer>

              <SelectContainer className="w-full px-3 py-2">
                <InputLabel
                  label="Quantas Colméias pretende instalar nesse meliponário?"
                  name="quantidadeColmeias"
                />
                <Select<Inputs>
                  options={qtdColmeiasOptions}
                  control={control}
                  name="quantidadeColmeias"
                  className=""
                  errors={errors?.quantidadeColmeias?.message}
                />
              </SelectContainer>

              <SelectContainer className="w-full px-3 py-2">
                <InputLabel
                  label="Há outros meliponários no raio de 1 KM?"
                  name="outrosMeliponariosRaio1km"
                />
                <Select<Inputs>
                  options={outrosApiariosRaio3kmOptions}
                  control={control}
                  name="outrosMeliponariosRaio1km"
                  className=""
                  errors={errors?.outrosMeliponariosRaio1km?.message}
                />
              </SelectContainer>

              {/* @ts-ignore */}
              {outrosMeliponariosRaio1km === 'true' && (
                <SelectContainer className="w-full px-3 py-2">
                  <InputLabel
                    label="Caso haja outros meliponários no raio de 1 KM, qual a quantidade de colméias?"
                    name="qtdColmeiasOutrosApiarios"
                  />
                  <Select<Inputs>
                    options={qtdColmeiasOutrosApiariosOptions}
                    control={control}
                    name="qtdColmeiasOutrosMeliponarios"
                    className=""
                    errors={errors?.qtdColmeiasOutrosMeliponarios?.message}
                  />
                </SelectContainer>
              )}

              <SelectContainer className="w-full px-3 py-2">
                <InputLabel
                  label="Há fontes de néctar e pólen (flores) até 2km do local que pretende instalar o meliponário?"
                  name="fontesNectarPolen"
                />
                <Select<Inputs>
                  options={simNaoOptions}
                  control={control}
                  name="fontesNectarPolen"
                  className=""
                  errors={errors?.fontesNectarPolen?.message}
                />
              </SelectContainer>
              <SelectContainer className="w-full px-3 py-2">
                <InputLabel
                  label="Há disponibilidade de água de qualidade até 500m a partir do local escolhido?"
                  name="disponibilidadeAgua"
                />
                <Select<Inputs>
                  options={simNaoOptions}
                  control={control}
                  name="disponibilidadeAgua"
                  className=""
                  errors={errors?.disponibilidadeAgua?.message}
                />
              </SelectContainer>
              <SelectContainer className="w-full px-3 py-2">
                <InputLabel
                  label="Há sombreamento natural para as colméias?"
                  name="sombreamentoNatural"
                />
                <Select<Inputs>
                  options={simNaoOptions}
                  control={control}
                  name="sombreamentoNatural"
                  className=""
                  errors={errors?.sombreamentoNatural?.message}
                />
              </SelectContainer>

              <SelectContainer className="w-full px-3 py-2">
                <InputLabel
                  label="Há proteção contra ventos fortes?"
                  name="protecaoVentosFortes"
                />
                <Select<Inputs>
                  options={simNaoOptions}
                  control={control}
                  name="protecaoVentosFortes"
                  className=""
                  errors={errors?.protecaoVentosFortes?.message}
                />
              </SelectContainer>

              <SelectContainer className="w-full px-3 py-2">
                <InputLabel
                  label="Há uma distancia segura (mínimo de 3km) de possíveis fontes de contaminação (lixões, matadouros, fábrica de doces, engenhos, dentre outros)?"
                  name="distanciaSeguraContaminacao"
                />
                <Select<Inputs>
                  options={simNaoOptions}
                  control={control}
                  name="distanciaSeguraContaminacao"
                  className=""
                  errors={errors?.distanciaSeguraContaminacao?.message}
                />
              </SelectContainer>
              <SelectContainer className="w-full px-3 py-2">
                <InputLabel
                  label="O local onde pretende instalar seu meliponário atende a uma distância mínima (400m) de estradas movimentadas, currais, aviários, pocilgas e outras construções?"
                  name="distanciaMinimaConstrucoes"
                />
                <Select<Inputs>
                  options={simNaoOptions}
                  control={control}
                  name="distanciaMinimaConstrucoes"
                  className=""
                  errors={errors?.distanciaMinimaConstrucoes?.message}
                />
              </SelectContainer>

              <SelectContainer className="w-full px-3 py-2">
                <InputLabel
                  label="O local possui uma distância segura (3km) de lavouras (milho, soja, transgênicos, dentre outros)?"
                  name="distanciaSeguraLavouras"
                />
                <Select<Inputs>
                  options={simNaoOptions}
                  control={control}
                  name="distanciaSeguraLavouras"
                  className=""
                  errors={errors?.distanciaSeguraLavouras?.message}
                />
              </SelectContainer>

              <SelectContainer className="w-full px-3 py-2">
                <InputLabel
                  label="O local pretendido apiário é de fácil acesso para entrada e saída de veiculos automobilisticos?   "
                  name="acessoVeiculos"
                />
                <Select
                  options={simNaoOptions}
                  control={control}
                  name="acessoVeiculos"
                  className=""
                  errors={errors?.acessoVeiculos?.message}
                />
              </SelectContainer>
            </div>

            <button
              disabled={isLoading || disabled}
              type="submit"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar Meliponário'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default memo(NewMeliponary)
memo(NewMeliponary).displayName = 'NewMeliponary'
