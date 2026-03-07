import { BrowserRouter, Route, Routes } from 'react-router-dom'
import {
  AddFile,
  Config,
  FindMeliponary,
  FindOne,
  Home,
  Locais,
  NewApiary,
  NewMeliponary,
  SignIn,
  SignUp,
} from '../pages'
import NotFound from '../pages/NotFound'
import UsersPage from '../pages/Users'
import UserForm from '../pages/Users/form'
import AccountPage from '../pages/Account'
import { PrivateRoute, PublicRoute } from './Route'
import { AdminRoute } from './AdminRoute'

function AppRoutes() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<SignIn />} />
          <Route path="/cadastre-se" element={<SignUp />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/minha-conta" element={<AccountPage />} />
        </Route>

        <Route path="/meus-mapas" element={<PrivateRoute />}>
          <Route index element={<AdminRoute><Config /></AdminRoute>} />
          <Route path="novo" element={<AdminRoute><AddFile /></AdminRoute>} />
        </Route>

        <Route path="/meus-locais" element={<PrivateRoute />}>
          <Route index element={<Locais />} />
          <Route path="novo-apiario" element={<NewApiary />} />
          <Route path="novo-meliponario" element={<NewMeliponary />} />
          <Route path="apiario/:id" element={<FindOne />} />
          <Route path="meliponario/:id" element={<FindMeliponary />} />
        </Route>

        <Route path="/usuarios" element={<PrivateRoute />}>
          <Route index element={<AdminRoute><UsersPage /></AdminRoute>} />
          <Route path="novo" element={<AdminRoute><UserForm /></AdminRoute>} />
          <Route path=":userId/editar" element={<AdminRoute><UserForm /></AdminRoute>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
