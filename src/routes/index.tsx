import { BrowserRouter, Route, Routes } from 'react-router-dom'
import {
  AddFile,
  Config,
  FindMeliponary,
  FindOne,
  Home,
  MyApiaries,
  MyMeliponaries,
  NewApiary,
  NewMeliponary,
  SignIn,
  SignUp,
} from '../pages'
import NotFound from '../pages/NotFound'
import UsersPage from '../pages/Users'
import UserForm from '../pages/Users/form'
import { PrivateRoute, PublicRoute } from './Route'

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
        </Route>

        <Route path="/meus-mapas" element={<PrivateRoute />}>
          <Route index element={<Config />} />
          <Route path="novo" element={<AddFile />} />
        </Route>

        <Route path="/meus-apiarios" element={<PrivateRoute />}>
          <Route index element={<MyApiaries />} />
          <Route path="novo" element={<NewApiary />} />
          <Route path=":id" element={<FindOne />} />
        </Route>

        <Route path="/meus-meliponarios" element={<PrivateRoute />}>
          <Route index element={<MyMeliponaries />} />
          <Route path="novo" element={<NewMeliponary />} />
          <Route path=":id" element={<FindMeliponary />} />
        </Route>

        <Route path="/usuarios" element={<PrivateRoute />}>
          <Route index element={<UsersPage />} />
          <Route path="novo" element={<UserForm />} />
          <Route path=":userId/editar" element={<UserForm />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
