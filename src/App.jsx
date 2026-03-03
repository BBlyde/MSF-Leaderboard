import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import LeaderboardRsg from './pages/LeaderboardRsg'
import LeaderboardRanked from './pages/LeaderboardRanked'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rsg" element={<LeaderboardRsg />} />
        <Route path="/ranked" element={<LeaderboardRanked />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
