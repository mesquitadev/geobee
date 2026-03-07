import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
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

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Search */}
      <div className="border-b p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar localidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="apiaries" className="flex min-h-0 flex-1 flex-col">
        <div className="border-b px-3 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="apiaries" className="flex-1">
              Apiarios ({filteredApiaries.length})
            </TabsTrigger>
            <TabsTrigger value="meliponaries" className="flex-1">
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
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum apiario encontrado
              </p>
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
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum meliponario encontrado
              </p>
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
