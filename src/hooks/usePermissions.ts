import { useGetMeQuery } from '@/redux/slices/usersSlice'

export function usePermissions() {
  const { data: user, isLoading } = useGetMeQuery()

  const perfis: string[] = user?.perfis ?? []
  const isAdmin = perfis.includes('Admin')
  const isApicultor = perfis.includes('Apicultor')
  const isMeliponicultor = perfis.includes('Meliponicultor')

  return { user, isLoading, perfis, isAdmin, isApicultor, isMeliponicultor }
}
