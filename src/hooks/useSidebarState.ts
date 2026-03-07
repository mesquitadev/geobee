import { useState, useEffect } from 'react'

const STORAGE_KEY = 'geobee-sidebar-collapsed'

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'true'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  const toggle = () => setCollapsed((prev) => !prev)

  return { collapsed, setCollapsed, toggle }
}
