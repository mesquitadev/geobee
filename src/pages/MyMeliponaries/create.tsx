// @ts-nocheck
import { yupResolver } from '@hookform/resolvers/yup'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
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
import {
  especiesAbelhasOptions,
  outrosApiariosRaio3kmOptions,
  qtdColmeiasOptions,
  qtdColmeiasOutrosApiariosOptions,
  simNaoOptions,
  tipoInstalacaoApiarioOptions,
} from '../../utils/options.ts'

type Inputs = {
  name: string
  latitude: number
  longitude: number
  tipoInstalacao: string
  especieAbelha?: string
  quantidadeColmeias: string
  outrosMeliponariosRaio1km: boolean
  qtdColmeiasOutrosMeliponarios?: string | null
  fontesNectarPolen: boolean
  disponibilidadeAgua: boolean
  sombreamentoNatural: boolean
  protecaoVentosFortes: boolean
  distanciaSeguraContaminacao: boolean
  distanciaMinimaConstrucoes: boolean
  distanciaSeguraLavouras: boolean
  acessoVeiculos: boolean
  capacidadeDeSuporte?: number
}

export default function NewMeliponary() {
  const { loading, setLoading } = useLoading()
  const [disabled, setDisabled] = useState(false)
  const [latitude, setLatitude] = useState<number>(0)
  const [longitude, setLongitude] = useState<number>(0)
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null,
  )
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  )

  const meliponarioFormSchema = yup.object().shape({
    name: yup.string().required('Este campo é obrigatório'),
    latitude: yup.number().optional(),
    longitude: yup.number().optional(),
    tipoInstalacao: yup.string().required('Este campo é obrigatório'),
    especieAbelha: yup.string().required('Este campo é obrigatório'),
    quantidadeColmeias: yup.string().required('Este campo é obrigatório'),
    outrosMeliponariosRaio1km: yup
      .boolean()
      .required('Este campo é obrigatório'),
    qtdColmeiasOutrosMeliponarios: yup.string().nullable().optional(),
    fontesNectarPolen: yup.boolean().required('Este campo é obrigatório'),
    disponibilidadeAgua: yup.boolean().required('Este campo é obrigatório'),
    sombreamentoNatural: yup.boolean().required('Este campo é obrigatório'),
    protecaoVentosFortes: yup.boolean().required('Este campo é obrigatório'),
    distanciaSeguraContaminacao: yup
      .boolean()
      .required('Este campo é obrigatório'),
    distanciaMinimaConstrucoes: yup
      .boolean()
      .required('Este campo é obrigatório'),
    distanciaSeguraLavouras: yup.boolean().required('Este campo é obrigatório'),
  })
  const { handleSubmit, formState, control, watch } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: yupResolver(meliponarioFormSchema),
  })
  const { errors } = formState

  const handleSignUp: SubmitHandler<Inputs> = useCallback(
    async (data: Inputs) => {
      setLoading(true)
      try {
        const updatedData = {
          ...data,
          latitude: String(latitude),
          longitude: String(longitude),
        }

        await Promise.all([api.post('meliponary/', updatedData)])
        // @ts-ignore
        enqueueSnackbar({
          message: 'Cadastro realizado com sucesso!',
          variant: 'success',
        })
      } catch (err) {
        enqueueSnackbar({
          message: `Erro no cadastro! Ocorreu um erro ao cadastrar, ${err.response.data.message}`,
          variant: 'error',
        })
        setLoading(false)
      } finally {
        setLoading(false)
      }
    },
    [latitude, longitude, setLoading],
  )

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat)
    setLongitude(lng)
    setPosition({ lat, lng })
  }

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        handleLocationSelect(e.latlng.lat, e.latlng.lng)
      },
    })
    return position === null ? null : <Marker position={position}></Marker>
  }
  // @ts-ignore
  const outrosMeliponariosRaio1km = watch('outrosMeliponariosRaio1km')
  // @ts-ignore
  const fontesNectarPolen = watch('fontesNectarPolen')
  // @ts-ignore
  const disponibilidadeAgua = watch('disponibilidadeAgua')
  // @ts-ignore
  const sombreamentoNatural = watch('sombreamentoNatural')
  // @ts-ignore
  const protecaoVentosFortes = watch('protecaoVentosFortes')
  // @ts-ignore
  const distanciaSeguraContaminacao = watch('distanciaSeguraContaminacao')
  // @ts-ignore
  const distanciaMinimaConstrucoes = watch('distanciaMinimaConstrucoes')
  // @ts-ignore
  const distanciaSeguraLavouras = watch('distanciaSeguraLavouras')

  useEffect(() => {
    if (fontesNectarPolen === 'false') {
      setDisabled(true)
      enqueueSnackbar(
        'OOPS! Aqui não é um local adequado para colocar o meliponário!',
        {
          variant: 'warning',
        },
      )
    }

    if (disponibilidadeAgua === 'false') {
      enqueueSnackbar(
        'OOPS! Será necessário adicionar água de qualidade no local!',
        {
          variant: 'info',
        },
      )
    }

    if (sombreamentoNatural === 'false') {
      enqueueSnackbar('OOPS! Será necessário colocar as caixas à sombra! ', {
        variant: 'info',
      })
    }
    if (protecaoVentosFortes === 'false') {
      enqueueSnackbar(
        'OOPS! Aqui não é um local adequado para colocar o meliponário!',
        { variant: 'warning' },
      )
    }
    if (distanciaSeguraContaminacao === 'false') {
      enqueueSnackbar(
        'OOPS! Aqui não é um local adequado para colocar o meliponário!',
        { variant: 'warning' },
      )
    }
    if (distanciaMinimaConstrucoes === 'false') {
      enqueueSnackbar(
        'OOPS! Aqui não é um local adequado para colocar o meliponário!',
        { variant: 'warning' },
      )
      setDisabled(true)
    } else {
      setDisabled(false)
    }

    if (distanciaSeguraLavouras === 'false') {
      enqueueSnackbar(
        'OOPS! Aqui não é um local adequado para colocar o meliponário!',
        { variant: 'warning' },
      )
      setDisabled(true)
    } else {
      setDisabled(false)
    }
  }, [
    disponibilidadeAgua,
    distanciaMinimaConstrucoes,
    distanciaSeguraContaminacao,
    distanciaSeguraLavouras,
    fontesNectarPolen,
    protecaoVentosFortes,
    sombreamentoNatural,
  ])

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

  const myIcon = new L.Icon({
    iconUrl: marker as string,
    iconRetinaUrl: marker as string,
    popupAnchor: [-0, -0],
    iconSize: [32, 32],
  })

  return (
    <div className="h-full w-full p-10">
      <Breadcumbs pageName="Cadastrar Meliponário" />
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
            <LocationMarker />
          </MapContainer>
        </div>
        <div className="mb-5">
          <form onSubmit={handleSubmit(handleSignUp)} className="w-full">
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
                <Select
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
                <Select
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
                <Select
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
                <Select
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
                  <Select
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
                <Select
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
                <Select
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
                <Select
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
                <Select
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
                <Select
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
                <Select
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
                <Select
                  options={simNaoOptions}
                  control={control}
                  name="distanciaSeguraLavouras"
                  className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
                  errors={errors?.distanciaSeguraLavouras?.message}
                />
              </SelectContainer>
            </div>

            <button
              disabled={disabled}
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
