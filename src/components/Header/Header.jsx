import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import msfLogo from '../../assets/msf.png'
import { discordAvatarUrl, discordDisplayName } from '../../utils/discordUser'
import './Header.css'

function Header() {
  const location = useLocation()
  const [discordUser, setDiscordUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        const data = res.ok ? await res.json() : { user: null }
        if (!cancelled) setDiscordUser(data.user ?? null)
      } catch {
        if (!cancelled) setDiscordUser(null)
      } finally {
        if (!cancelled) setAuthChecked(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [location.pathname])

  useEffect(() => {
    setUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!userMenuOpen) return
    const onDocPointerDown = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [userMenuOpen])

  let headerClass = 'header header-home'
  let leaderboardClass = 'leaderboard-home'
  let leaderboardLabel = 'HOME'
  if (location.pathname === '/rsg') {
    headerClass = 'header header-rsg'
    leaderboardClass = 'leaderboard-rsg'
    leaderboardLabel = 'LEADERBOARD'
  } else if (location.pathname === '/ranked') {
    headerClass = 'header header-ranked'
    leaderboardClass = 'leaderboard-ranked'
    leaderboardLabel = 'LEADERBOARD'
  } else if (
    location.pathname === '/mrm' ||
    location.pathname === '/prediction/mrm' ||
    location.pathname.startsWith('/prediction/mrm/')
  ) {
    headerClass = 'header header-mrm'
    leaderboardClass = 'leaderboard-ranked'
    leaderboardLabel = 'TOURNAMENT'
  } else if (location.pathname === '/tournament') {
    headerClass = 'header header-tournament'
    leaderboardClass = 'leaderboard-tournament'
    leaderboardLabel = 'TOURNAMENT'
  }

  return (
    <header className={headerClass}>
      <div className="header-container">
        <div className="header-logo">
          <img src={msfLogo} alt="MSF Logo" className="logo-image" />
          <div><span id="msf">MSF</span><span id="leaderboard" className={leaderboardClass}>{leaderboardLabel}</span></div>
        </div>
        <nav className="header-nav">
          <ul>
            <li className='nav-home'><Link to="/">ACCUEIL</Link></li>
            <li className='nav-classement'>
              <span className='nav-classement-label'>CLASSEMENT<span className='nav-classement-arrow'>▾</span></span>
              <ul className='nav-dropdown'>
                <li className='nav-rsg'><Link to="/rsg">CLASSEMENT ANY%</Link></li>
                <li className='nav-ranked'><Link to="/ranked">CLASSEMENT RANKED</Link></li>
              </ul>
            </li>
            <li className='nav-tournois'>
              <span className='nav-tournois-label'>TOURNOIS<span className='nav-tournois-arrow'>▾</span></span>
              <ul className='nav-dropdown'>
                <li className='nav-mrm'><Link to="/mrm">MRM</Link></li>
                {/* <li className='nav-mrm-prediction'><Link to="/prediction/mrm">PRONOSTICS</Link></li> */}
                <li className='nav-tournament'><Link to="/tournament">ARCHIVES</Link></li>
              </ul>
            </li>
            <li className="header-auth">
              {!authChecked ? (
                <span className="header-auth-placeholder" aria-hidden="true" />
              ) : discordUser ? (
                <div className="header-user-menu" ref={userMenuRef}>
                  <button
                    type="button"
                    className="header-user-trigger"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    onClick={() => setUserMenuOpen((open) => !open)}
                  >
                    <img
                      src={discordAvatarUrl(discordUser.id, discordUser.avatar)}
                      alt=""
                      className="header-user-avatar"
                      width={32}
                      height={32}
                    />
                    <span className="header-user-name">{discordDisplayName(discordUser)}</span>
                    <span className='nav-classement-arrow'>▾</span>
                  </button>
                  {userMenuOpen ? (
                    <div className="header-user-dropdown" role="menu">
                      <a
                        className="header-user-logout"
                        href="/api/auth/logout"
                        role="menuitem"
                      >
                        Déconnexion
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : (
                <a className="header-login-btn" href="/api/auth/discord">
                  Connexion Discord
                </a>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
