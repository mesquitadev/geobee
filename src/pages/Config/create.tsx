// @ts-nocheck
import React, { useCallback } from 'react'
import { useLoading } from '../../hooks/useLoading.tsx'
import Breadcumbs from '../../components/Breadcumbs'
import 'leaflet/dist/leaflet.css'
import InputContainer from '../../components/Input/Container.tsx'
import InputLabel from '../../components/Input/Label.tsx'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useSnackbar } from 'notistack'
import BackdropLoading from '../../components/BackdropLoading'

import axios from 'axios'
import { useHistory } from 'react-router-dom'
import api from '../../services'

interface Inputs {
  files: FileList
}

export default function AddMap() {
  const { enqueueSnackbar } = useSnackbar()
  const { loading, setLoading } = useLoading()
  const history = useHistory()

  const apiarioFormSchema = yup.object().shape({
    files: yup.mixed().required('Este campo é obrigatório'),
  })
  const { handleSubmit, formState, register } = useForm<Inputs>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: yupResolver(apiarioFormSchema),
  })
  const { errors } = formState

  const handleSignUp = async (data: Inputs) => {
    setLoading(true)
    try {
      const formData = new FormData()
      Array.from(data.files).forEach((file) => {
        formData.append('files', file)
      })

      await Promise.all([
        api.post('/maps/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }),
      ])
      enqueueSnackbar('Cadastro realizado com sucesso!', {
        variant: 'success',
      })
      history.goBack()
    } catch (err) {
      enqueueSnackbar(
        `Erro no cadastro! Ocorreu um erro ao cadastrar, ${err.response.data.message}`,
        {
          variant: 'error',
        },
      )
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-full p-10">
      <Breadcumbs pageName="Cadastrar Mapa" />
      <BackdropLoading isLoading={loading} />
      <div className="grid grid-cols-2">
        <div className="mb-5">
          <form onSubmit={handleSubmit(handleSignUp)} className="w-full">
            <div className="flex flex-wrap mx-3 mb-6">
              <InputContainer className="w-full  px-3 mb-6 md:mb-0">
                <InputLabel label="Arquivo" name="files" />
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                  type="file"
                  {...register('files')}
                  multiple
                  accept={'.geojson'}
                />
                {errors.files && (
                  <p className="text-red-500 text-xs italic">
                    {errors.files.message}
                  </p>
                )}
              </InputContainer>
            </div>

            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Salvar Mapa
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
