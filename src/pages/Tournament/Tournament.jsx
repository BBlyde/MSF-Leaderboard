import { Link } from 'react-router-dom'
import './Tournament.css'

function Tournament() {
  return (
    <div className="d-flex flex-column align-items-center text-white tournament-container">
      <div className="tournament-header">
        <div className="tournament-title-row">
          <span className="tournament-title">ARCHIVES TOURNOIS</span>
        </div>
        <span className="tournament-subtitle">Coming soon...</span>
      </div>

      <div className="section-divider" />

      <div className="tournament-spacer" />

    </div>
  )
}

export default Tournament
