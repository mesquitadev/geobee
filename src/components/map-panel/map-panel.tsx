import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPinned, Plus, Search } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LocationCard } from './location-card'
import type {
  Apiary,
  Meliponary,
} from '@/redux/slices/apiariesAllSlice'

interface MapPanelProps {
  apiaries: Apiary[]
  meliponaries: Meliponary[]
  highlightedId: string | null
  onLocationClick: (item: { id: string; latitude: string | number; longitude: string | number; type: 'APIARY' | 'MELIPONARY'; name: string }) => void
}

export function MapPanel({
  apiaries,
  meliponaries,
  highlightedId,
  onLocationClick,
}: MapPanelProps) {
  const [search, setSearch] = useState('')

  const filteredApiaries = useMemo(() => {
    if (!search.trim()) return apiaries
    const q = search.toLowerCase()
    return apiaries.filter((a) => a.name.toLowerCase().includes(q))
  }, [apiaries, search])

  const filteredMeliponaries = useMemo(() => {
    if (!search.trim()) return meliponaries
    const q = search.toLowerCase()
    return meliponaries.filter((m) => m.name.toLowerCase().includes(q))
  }, [meliponaries, search])

  const totalCount = apiaries.length + meliponaries.length

  return (
    <div className="flex h-full flex-col overflow-hidden bg-card">
      {/* Header */}
      <div className="border-b bg-primary/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <MapPinned className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-sm font-semibold">Localidades</h2>
            <p className="text-xs text-muted-foreground">
              {totalCount} {totalCount === 1 ? 'local cadastrado' : 'locais cadastrados'}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar localidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="apiaries" className="flex min-h-0 flex-1 flex-col">
        <div className="px-3">
          <TabsList className="h-9 w-full">
            <TabsTrigger value="apiaries" className="flex-1 text-xs">
              Apiarios ({filteredApiaries.length})
            </TabsTrigger>
            <TabsTrigger value="meliponaries" className="flex-1 text-xs">
              Meliponarios ({filteredMeliponaries.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="apiaries"
          className="mt-0 flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {filteredApiaries.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <MapPinned className="h-8 w-8 opacity-40" />
                <p className="text-sm">Nenhum apiario encontrado</p>
              </div>
            ) : (
              filteredApiaries.map((apiary) => (
                <LocationCard
                  key={apiary.id}
                  id={apiary.id}
                  name={apiary.name}
                  latitude={apiary.latitude}
                  longitude={apiary.longitude}
                  capacity={apiary.capacidadeDeSuporte}
                  typeBadge={apiary.tipoInstalacao}
                  variant="apiary"
                  isHighlighted={highlightedId === apiary.id}
                  onClick={() =>
                    onLocationClick({
                      id: apiary.id,
                      latitude: apiary.latitude,
                      longitude: apiary.longitude,
                      type: 'APIARY',
                      name: apiary.name,
                    })
                  }
                />
              ))
            )}
          </div>
          <div className="border-t p-3">
            <Button asChild className="w-full" size="sm">
              <Link to="/meus-locais/novo-apiario">
                <Plus className="mr-2 h-4 w-4" />
                Novo Apiario
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent
          value="meliponaries"
          className="mt-0 flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {filteredMeliponaries.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <MapPinned className="h-8 w-8 opacity-40" />
                <p className="text-sm">Nenhum meliponario encontrado</p>
              </div>
            ) : (
              filteredMeliponaries.map((mel) => (
                <LocationCard
                  key={mel.id}
                  id={mel.id}
                  name={mel.name}
                  latitude={mel.latitude}
                  longitude={mel.longitude}
                  capacity={mel.capacidadeDeSuporte}
                  typeBadge={mel.especieAbelha}
                  variant="meliponary"
                  isHighlighted={highlightedId === mel.id}
                  onClick={() =>
                    onLocationClick({
                      id: mel.id,
                      latitude: mel.latitude,
                      longitude: mel.longitude,
                      type: 'MELIPONARY',
                      name: mel.name,
                    })
                  }
                />
              ))
            )}
          </div>
          <div className="border-t p-3">
            <Button asChild className="w-full" size="sm">
              <Link to="/meus-locais/novo-meliponario">
                <Plus className="mr-2 h-4 w-4" />
                Novo Meliponario
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
