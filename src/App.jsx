import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Analytics } from '@vercel/analytics/react'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import LeaderboardRsg from './pages/LeaderboardRsg'
import LeaderboardRanked from './pages/LeaderboardRanked'
import LeaderboardDraftout from './pages/LeaderboardDraftout'
import Mrm from './pages/Mrm'
import MrmPrediction from './pages/MrmPrediction'
import Tournament from './pages/Tournament'
import Admin from './pages/Admin/Admin'

function ScrollToTop() {
  const { pathname } = useLocation()
  const previousPathRef = useRef(pathname)
  useEffect(() => {
    const previousPath = previousPathRef.current
    previousPathRef.current = pathname
    const isPlayerProfileSwitch =
      /^\/prediction\/mrm\/[^/]+$/.test(pathname) &&
      /^\/prediction\/mrm\/[^/]+$/.test(previousPath)
    if (!isPlayerProfileSwitch) {
      window.scrollTo(0, 0)
    }
  }, [pathname])
  return null
}

const SEO_BY_PATH = {
  '/': {
    title: 'Minecraft Speedrun France',
    description: 'Classements Minecraft speedrun France, résultats de tournois MRM et pronostics de la communauté MSF.',
  },
  '/rsg': {
    title: 'Classement any%',
    description: 'Consultez le classement Any% Random Seed Glitchless des runners Minecraft Speedrun France.',
  },
  '/ranked': {
    title: 'Classement MCSR Ranked',
    description: 'Consultez le classement saisonnier MCSR Ranked des joueurs Minecraft Speedrun France.',
  },
  '/draftout': {
    title: 'Classement Draftout',
    description: 'Consultez le classement Draftout et les statistiques des runners de la communauté MSF.',
  },
  '/mrm': {
    title: 'MSF Ranked Masters',
    description: 'Suivez les groupes, scores et résultats des tournois MRM de Minecraft Speedrun France.',
  },
  '/prediction/mrm': {
    title: 'Pronostics MRM',
    description: 'Faites vos pronostics et consultez le classement de la communauté pour les tournois MRM.',
  },
  '/tournament': {
    title: 'Archives des tournois',
    description: 'Retrouvez les informations et résultats des anciens tournois Minecraft Speedrun France.',
  },
}

function Seo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const metadata = SEO_BY_PATH[pathname] ?? {
      title: 'Minecraft Speedrun France',
      description: 'Classements et tournois Minecraft Speedrun France.',
    }
    const isAdmin = pathname.startsWith('/admin')
    const canonicalUrl = `https://minecraftspeedrunfrance.fr${pathname}`

    document.title = metadata.title
    document.documentElement.lang = 'fr'

    const setMeta = (selector, attribute, value) => {
      const element = document.head.querySelector(selector)
      if (element) element.setAttribute(attribute, value)
    }

    setMeta('meta[name="description"]', 'content', metadata.description)
    setMeta('meta[property="og:title"]', 'content', metadata.title)
    setMeta('meta[property="og:description"]', 'content', metadata.description)
    setMeta('meta[property="og:url"]', 'content', canonicalUrl)
    setMeta('meta[name="twitter:title"]', 'content', metadata.title)
    setMeta('meta[name="twitter:description"]', 'content', metadata.description)
    setMeta('meta[name="robots"]', 'content', isAdmin ? 'noindex, nofollow' : 'index, follow')
    setMeta('link[rel="canonical"]', 'href', isAdmin ? 'https://minecraftspeedrunfrance.fr/' : canonicalUrl)
  }, [pathname])

  return null
}

function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Seo />
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rsg" element={<LeaderboardRsg />} />
          <Route path="/ranked" element={<LeaderboardRanked />} />
          <Route path="/draftout" element={<LeaderboardDraftout />} />
          <Route path="/mrm" element={<Mrm />} />
          <Route path="/prediction/mrm/:discordId" element={<MrmPrediction />} />
          <Route path="/prediction/mrm" element={<MrmPrediction />} />
          <Route path="/tournament" element={<Tournament />} />
          <Route path="/admin" element={<Navigate to="/admin/mrm" replace />} />
          <Route path="/admin/:template" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <Analytics />
    </div>
  )
}

export default App
