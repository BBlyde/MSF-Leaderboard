import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MyComponent from './components/MyComponent'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <MyComponent
        title="Bienvenue"
        description="Ceci est un composant réutilisable"
      />
    </>
  )
}

export default App
