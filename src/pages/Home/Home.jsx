import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="d-flex flex-column align-items-center text-white home-container">
      <h1 className="home-title">MSF LEADERBOARD</h1>
      <span className="info">Site en cours d'évolution..</span>
      <div className="home-btn-container d-flex flex-wrap justify-content-center">
        <Link to="/rsg" className='home-btn-rsg home-btn'>ANY% LEADERBOARD</Link>
        <Link to="/ranked" className='home-btn-ranked home-btn'>RANKED LEADERBOARD</Link>
      </div>
      <div className="home-about home-card">
        <h2 className="card-title">À PROPOS</h2>
        <p>Le site web MSF a pour objectif de fournir un classement précis et actualisé des performances des runners francophones en Speedrun Minecraft</p>
      </div>
      <div className="home-text home-card">
        <h2 className="card-title contact-title">CONTACT</h2>
        <p>Pour toute demande d'inclusion ou de correction d'information dans l'un des deux classements, veuillez contacter <span className="discord-handle">@blyde_</span> sur Discord</p>
      </div>
    </div>
  )
}

export default Home
