import { Link, useLocation } from 'react-router-dom'
import msfLogo from '../../assets/msf.png'
import './Header.css'

function Header() {
  const location = useLocation()
  
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
  } else if (location.pathname === '/mrm') {
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
                <li className='nav-tournament'><Link to="/tournament">ARCHIVES</Link></li>
              </ul>
            </li>
            
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header