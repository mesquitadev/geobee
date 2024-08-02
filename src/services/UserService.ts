import api from './index.tsx'
export interface UserPayload {
  id: number
  fullName: string
  cpf: string
  email: string
  phone: string
  password: string
  role: 'APICULTOR' | 'MELIPONICULTOR'
}
class UserService {
  buscarDadosUsuarioLogado() {
    return new Promise<UserPayload>((resolve, reject) => {
      api
        .get('/user/me')
        .then((response) => resolve(response.data))
        .catch((error) => reject(error))
    })
  }
}

export const userService = new UserService()
