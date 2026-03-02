import { Link, useLocation } from 'react-router-dom'
import msfLogo from '../../assets/msf.png'
import './Header.css'

function Header() {
  const location = useLocation()
  
  let headerClass = 'header header-home'
  if (location.pathname === '/rsg') {
    headerClass = 'header header-rsg'
  } else if (location.pathname === '/ranked') {
    headerClass = 'header header-ranked'
  }

  return (
    <header className={headerClass}>
      <div className="header-container">
        <div className="header-logo">
          <img src={msfLogo} alt="MSF Logo" className="logo-image" />
          <div><span id="msf">MSF</span><span id="leaderboard">LEADERBOARD</span></div>
        </div>
        <nav className="header-nav">
          <ul>
            <li className='nav-home'><Link to="/">Accueil</Link></li>
            <li className='nav-rsg'><Link to="/rsg">Classement Any%</Link></li>
            <li className='nav-ranked'><Link to="/ranked">Classement Ranked</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header