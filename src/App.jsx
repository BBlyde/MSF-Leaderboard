import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Home from './pages/Home'
import LeaderboardRsg from './pages/LeaderboardRsg'
import LeaderboardRanked from './pages/LeaderboardRanked'
import About from './pages/About'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rsg" element={<LeaderboardRsg />} />
        <Route path="/ranked" element={<LeaderboardRanked />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  )
}

export default App
