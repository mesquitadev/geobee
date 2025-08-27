// @ts-nocheck
import { yupResolver } from '@hookform/resolvers/yup'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useSnackbar } from 'notistack'
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
  const { enqueueSnackbar } = useSnackbar()
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
      enqueueSnackbar('Selecione as coordenadas no mapa ou use sua localização.', {
        variant: 'warning',
      })
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
      enqueueSnackbar('Meliponário criado com sucesso!', { variant: 'success' })
      navigate('/meus-meliponarios')
    } catch (err) {
      enqueueSnackbar('Erro ao criar meliponário', { variant: 'error' })
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
      enqueueSnackbar(message, { variant })
    })
    setDisabled(shouldDisableForm)
  }, [validateFormFields, enqueueSnackbar])

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
    <div className="h-full w-full p-10 pb-0">
      <Breadcumbs pageName="Cadastrar Meliponário" />
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="mb-5">
          <p className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-700">
            Selecione as Coordenadas
          </p>
          <button
            onClick={getUserLocation}
            className="my-3 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
            <div className="mx-3 mb-6 flex flex-wrap">
              <InputContainer className="mb-6  w-full px-3 md:mb-0">
                <InputLabel label="Nome" name="name" />
                <Input
                  className="mb-3 block w-full appearance-none rounded border border-red-500 bg-gray-200 px-4 py-3 leading-tight text-gray-700 focus:bg-white focus:outline-none"
                  control={control}
                  name="name"
                  placeholder="Nome para identificação do meliponário..."
                  errors={errors?.name?.message}
                />
              </InputContainer>

              <InputContainer className="mb-6 w-full px-3 md:mb-0 md:w-1/2">
                <InputLabel label="Latitude" name="latitude" />
                <Input
                  className="mb-3 block w-full appearance-none rounded border border-red-500 bg-gray-200 px-4 py-3 leading-tight text-gray-700 focus:bg-white focus:outline-none"
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
                  className="mb-3 block w-full appearance-none rounded border border-red-500 bg-gray-200 px-4 py-3 leading-tight text-gray-700 focus:bg-white focus:outline-none"
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
                  className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
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
                  className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
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
                  className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
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
                  className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
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
                    className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
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
                  className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
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
                  className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
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
                  className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
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
                  className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
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
                  className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
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
                  className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
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
                  className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
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
                  className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
                  errors={errors?.acessoVeiculos?.message}
                />
              </SelectContainer>
            </div>

            <button
              disabled={isLoading || disabled}
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Cadastrar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default memo(NewMeliponary)
memo(NewMeliponary).displayName = 'NewMeliponary'
