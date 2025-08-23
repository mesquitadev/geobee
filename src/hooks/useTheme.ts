import { useEffect, useState } from 'react'

const useTheme = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    )
  })

  // Aplica a classe no <body> para modo escuro ou claro
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  // Retorna o estado e função para alternar o tema
  return { darkMode, toggleTheme: () => setDarkMode((prev) => !prev) }
}

export default useTheme
