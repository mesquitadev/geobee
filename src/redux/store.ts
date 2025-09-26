import { mapsApiSlice } from './slices/mapsSlice'
import { apiSlice } from '../services/apiSlice'
import { apiariesApiSlice } from './slices/apiariesSlice'
import { meliponaryApiSlice } from './slices/meliponarySlice'
import { usersApiSlice } from './slices/usersSlice'
import {
  type Action,
  combineReducers,
  configureStore,
  type ThunkAction,
} from '@reduxjs/toolkit'

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  maps: mapsApiSlice.reducer,
  apiaries: apiariesApiSlice.reducer,
  meliponary: meliponaryApiSlice.reducer,
  users: usersApiSlice.reducer,
})

export const setupStore = (preloadedState?: any) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignora essas actions que podem conter dados não serializáveis (como objetos File, Map, etc)
          ignoredActions: [
            'persist/PERSIST',
            'persist/REHYDRATE',
            'persist/PAUSE',
            'persist/PURGE',
            'persist/REGISTER',
            'persist/FLUSH',
            // Actions do RTK Query que podem conter dados grandes
            'api/executeQuery/fulfilled',
            'api/executeMutation/fulfilled',
          ],
          // Ignora paths do estado que podem conter dados grandes ou não serializáveis
          ignoredPaths: [
            'api.queries',
            'api.mutations',
            'maps.data',
          ],
          // Reduz o threshold de tempo para desenvolvimento mais ágil
          warnAfter: 128,
        },
        immutableCheck: {
          // Ignora os mesmos paths para verificação de imutabilidade
          ignoredPaths: [
            'api.queries',
            'api.mutations',
            'maps.data',
          ],
          warnAfter: 128,
        },
      }).concat(apiSlice.middleware),
  })
}

export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
export type RootState = ReturnType<typeof rootReducer>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
