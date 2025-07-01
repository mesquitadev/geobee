import { yupResolver } from '@hookform/resolvers/yup'
import 'leaflet/dist/leaflet.css'
import { useSnackbar } from 'notistack'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Resolver, SubmitHandler, useForm } from 'react-hook-form'
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
import BackdropLoading from '../../components/BackdropLoading'
import Breadcumbs from '../../components/Breadcumbs'
import Input from '../../components/Input'
import InputContainer from '../../components/Input/Container.tsx'
import InputLabel from '../../components/Input/Label.tsx'
import Select from '../../components/Select'
import SelectContainer from '../../components/Select/Container.tsx'
import { useLoading } from '../../hooks/useLoading.tsx'
import api from '../../services'

import L from 'leaflet'
import {
  options,
  outrosApiariosRaio3kmOptions,
  qtdColmeiasOptions,
  qtdColmeiasOutrosApiariosOptions,
  simNaoOptions,
  tempoIntineranteOptions,
} from '../../utils/options.ts'

interface Inputs {
  name: string
  latitude: number
  longitude: number
  tipoInstalacao: string
  tempoItinerante?: string | null
  quantidadeColmeias: string
  outrosApiariosRaio3km: string
  qtdColmeiasOutrosApiarios?: string | null
  fontesNectarPolen: string
  disponibilidadeAgua: string
  sombreamentoNatural: string
  protecaoVentosFortes: string
  distanciaSeguraContaminacao: string
  distanciaMinimaConstrucoes: string
  distanciaSeguraLavouras: string
  acessoVeiculos: string
}

// Tipo para as notificações de validação
interface ValidationNotification {
  message: string
  variant: 'warning' | 'info' | 'error' | 'success'
  disableForm?: boolean
}

export default function NewApiary() {
  const { enqueueSnackbar } = useSnackbar()
  const { loading, setLoading } = useLoading()
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

  const apiarioFormSchema = yup.object().shape({
    name: yup.string().required('Este campo é obrigatório'),
    latitude: yup.number().optional(),
    longitude: yup.number().optional(),
    tipoInstalacao: yup.string().required('Este campo é obrigatório'),
    tempoItinerante: yup.string().nullable().optional(),
    quantidadeColmeias: yup.string().required('Este campo é obrigatório'),
    outrosApiariosRaio3km: yup.string().required('Este campo é obrigatório'),
    qtdColmeiasOutrosApiarios: yup.string().nullable().optional(),
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
  })

  const { handleSubmit, formState, control, watch } = useForm<Inputs>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: yupResolver<Inputs>(apiarioFormSchema) as Resolver<Inputs>,
  })
  const { errors } = formState

  const watchedFields = watch([
    'tipoInstalacao',
    'outrosApiariosRaio3km',
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
    tipoInstalacao,
    outrosApiariosRaio3km,
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

  // Função para validar os campos do formulário e exibir notificações apropriadas
  const validateFormFields = useCallback(() => {
    const notifications: ValidationNotification[] = []

    if (fontesNectarPolen === 'false') {
      notifications.push({
        message: 'OOPS! Aqui não é um local adequado para colocar o apiário!',
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
        message: 'OOPS! Aqui não é um local adequado para colocar o apiário!',
        variant: 'warning',
        disableForm: true,
      })
    }

    if (distanciaSeguraContaminacao === 'false') {
      notifications.push({
        message: 'OOPS! Aqui não é um local adequado para colocar o apiário!',
        variant: 'warning',
        disableForm: true,
      })
    }

    if (distanciaMinimaConstrucoes === 'false') {
      notifications.push({
        message: 'OOPS! Aqui não é um local adequado para colocar o apiário!',
        variant: 'warning',
        disableForm: true,
      })
    }

    if (distanciaSeguraLavouras === 'false') {
      notifications.push({
        message: 'OOPS! Aqui não é um local adequado para colocar o apiário!',
        variant: 'warning',
        disableForm: true,
      })
    }

    if (acessoVeiculos === 'false') {
      notifications.push({
        message: 'É necessário que haja acesso para entrada e saída do apiário',
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

  // Efeito para validar os campos quando eles mudarem
  useEffect(() => {
    const { notifications, shouldDisableForm } = validateFormFields()

    // Atualiza o estado de desabilitado
    setDisabled(shouldDisableForm)

    // Exibe as notificações
    notifications.forEach((notification) => {
      enqueueSnackbar(notification.message, { variant: notification.variant })
    })
  }, [validateFormFields, enqueueSnackbar])

  const handleSignUp: SubmitHandler<Inputs> = useCallback(
    async (data: Inputs) => {
      setLoading(true)
      try {
        const updatedData = {
          ...data,
          latitude: String(latitude),
          longitude: String(longitude),
        }

        await api.post('apiaries/', updatedData)

        enqueueSnackbar('Cadastro realizado com sucesso!', {
          variant: 'success',
        })

        // Redireciona para a lista de apiários após o sucesso
        navigate('/meus-apiarios')
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Erro desconhecido'
        enqueueSnackbar(`Erro no cadastro! ${errorMessage}`, {
          variant: 'error',
        })
      } finally {
        setLoading(false)
      }
    },
    [enqueueSnackbar, latitude, longitude, setLoading, navigate],
  )

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setLatitude(lat)
    setLongitude(lng)
    setPosition({ lat, lng })
  }, [])

  // Componente separado para corrigir o erro do Hook
  const LocationMarker = ({
    onLocationSelect,
    position,
    icon,
  }: {
    onLocationSelect: (lat: number, lng: number) => void
    position: { lat: number; lng: number } | null
    icon: L.Icon
  }) => {
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

  const getUserLocation = useCallback(() => {
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
          enqueueSnackbar('Não foi possível obter sua localização', {
            variant: 'error',
          })
        },
      )
    } else {
      enqueueSnackbar('Seu navegador não suporta geolocalização', {
        variant: 'warning',
      })
    }
  }, [handleLocationSelect, enqueueSnackbar])

  return (
    <div className="h-full w-full p-10 pb-0">
      <Breadcumbs pageName="Cadastrar Apiário" />
      <BackdropLoading isLoading={loading} />
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
            <LocationMarker
              onLocationSelect={handleLocationSelect}
              position={position}
              icon={myIcon}
            />
          </MapContainer>
        </div>
        <div className="mb-0">
          <form
            onSubmit={handleSubmit(handleSignUp)}
            className="mb-0 w-full pb-24 md:pb-20"
          >
            <div className="mx-1 mb-6 flex flex-wrap md:mx-3">
              <InputContainer className="mb-6  w-full px-3 md:mb-0">
                <InputLabel label="Nome" name="name" />
                <Input<Inputs>
                  className="mb-3 block w-full appearance-none rounded border border-red-500 bg-gray-200 px-4 py-3 leading-tight text-gray-700 focus:bg-white focus:outline-none"
                  control={control}
                  name="name"
                  placeholder="Nome para identificação do apiário..."
                  errors={errors?.name?.message}
                />
              </InputContainer>
              <InputContainer className="mb-6 w-full px-3 md:mb-0 md:w-1/2">
                <InputLabel label="Latitude" name="latitude" />
                <Input<Inputs>
                  className="mb-3 block w-full appearance-none rounded border border-red-500 bg-gray-200 px-4 py-3 leading-tight text-gray-700 focus:bg-white focus:outline-none"
                  control={control}
                  name="latitude"
                  placeholder="0"
                  value={latitude}
                  disabled
                  errors={errors?.longitude?.message}
                />
              </InputContainer>
              <InputContainer className="mb-6 w-full px-3 md:mb-0 md:w-1/2">
                <InputLabel label="Longitude" name="longitude" />
                <Input<Inputs>
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
                  label="O apiário a ser instalado será?"
                  name="tipoInstalacao"
                />
                <Select<Inputs>
                  options={options}
                  control={control}
                  name="tipoInstalacao"
                  className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
                  errors={errors?.tipoInstalacao?.message}
                />
              </SelectContainer>

              {tipoInstalacao === 'Intinerante' && (
                <SelectContainer className="w-full px-3 py-2">
                  <InputLabel
                    label="Caso você tenha respondido intinerante, por quanto tempo pretende ficar neste local?"
                    name="role"
                  />
                  <Select<Inputs>
                    options={tempoIntineranteOptions}
                    control={control}
                    name="tempoItinerante"
                    className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
                    errors={errors?.tempoItinerante?.message}
                  />
                </SelectContainer>
              )}
              <SelectContainer className="w-full px-3 py-2">
                <InputLabel
                  label="Quantas Colméias pretende instalar nesse apiário?"
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
                  label="Há outros apiários no raio de 3 KM?"
                  name="outrosApiariosRaio3km"
                />
                <Select<Inputs>
                  options={outrosApiariosRaio3kmOptions}
                  control={control}
                  name="outrosApiariosRaio3km"
                  className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
                  errors={errors?.quantidadeColmeias?.message}
                />
              </SelectContainer>
              {outrosApiariosRaio3km === 'true' ? (
                <SelectContainer className="w-full px-3 py-2">
                  <InputLabel
                    label="Caso haja outros apiários no raio de 3 KM, qual a quantidade de colméias?"
                    name="qtdColmeiasOutrosApiarios"
                  />
                  <Select<Inputs>
                    options={qtdColmeiasOutrosApiariosOptions}
                    control={control}
                    name="qtdColmeiasOutrosApiarios"
                    className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
                    errors={errors?.qtdColmeiasOutrosApiarios?.message}
                  />
                </SelectContainer>
              ) : null}
              <SelectContainer className="w-full px-3 py-2">
                <InputLabel
                  label="Há fontes de néctar e pólen (flores) até 3km do local que pretende instalar o apiário?"
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
                  label="O local onde pretende instalar seu apiario atende a uma distancia mínima (400m) de currais, casas, escolas, estradas movimentadas, aviários e outras construções?"
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
              disabled={disabled}
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {position ? 'Cadastrar' : 'Selecione as coordenadas no mapa'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
