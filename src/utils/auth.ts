// Utilitário para centralizar a leitura do token de autenticação
import Cookies from 'js-cookie'

export function getToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return (
    window.localStorage.getItem('GeoToken') ||
    window.sessionStorage.getItem('GeoToken') ||
    Cookies.get('GeoToken')
  )
}

export function setToken(token: string) {
  window.localStorage.setItem('GeoToken', token)
  Cookies.set('GeoToken', token, { expires: 7 })
}

export function removeToken() {
  window.localStorage.removeItem('GeoToken')
  window.sessionStorage.removeItem('GeoToken')
  Cookies.remove('GeoToken')
}
