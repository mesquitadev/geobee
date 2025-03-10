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
import { PrivateRoute, PublicRoute } from './Route'

function AppRoutes() {
  return (
    <BrowserRouter>
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

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
