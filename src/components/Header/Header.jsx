import { Link } from 'react-router-dom'
import msfLogo from '../../assets/msf.png'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <img src={msfLogo} alt="MSF Logo" className="logo-image" />
          <span id="msf">MSF </span><span id="leaderboard">LEADERBOARD</span>
        </div>
        <nav className="header-nav">
          <ul>
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/rsg">Classement Any%</Link></li>
            <li><Link to="/ranked">Classement Ranked</Link></li>
            <li><Link to="/about">À propos</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header