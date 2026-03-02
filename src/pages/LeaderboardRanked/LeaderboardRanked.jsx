import { useState, useEffect } from 'react'
import axios from 'axios'
import './LeaderboardRanked.css'

function LeaderboardRanked() {
  const [players, setPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [timeLeft, setTimeLeft] = useState('')

  const API_URL = 'https://back.mcsr-game.com/leaderboard'

  const countryToFlag = (countryCode) => {
    if (!countryCode) return ''
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`
  }

  const formatTimeLeft = () => {
    const targetDate = new Date('2026-05-02T02:00:00').getTime()
    const now = new Date().getTime()
    const difference = targetDate - now

    if (difference <= 0) {
      return 'La saison est terminée'
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((difference / 1000 / 60) % 60)
    const seconds = Math.floor((difference / 1000) % 60)

    return `${days}j ${hours}h ${minutes}m ${seconds}s`
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  useEffect(() => {
    setTimeLeft(formatTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(formatTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const filtered = players.filter(player =>
      (player.name || player.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredPlayers(filtered)
  }, [searchTerm, players])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_URL)

      setPlayers(response.data)
      setLoading(false)
    } catch (err) {
      setError('Erreur de récupération du classement')
      setLoading(false)
    }
  }

  return (
    <div className="leaderboard-ranked">
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <h1>Classement Ranked</h1>
          <span className="info">Top 16 qualifié au MSF Ranked Masters</span>
          <div className="countdown">
            <span className="countdown-text">Fin Saison 10 : <span className="countdown-timer">{timeLeft}</span><span className="countdown-info">2 Juin 2026</span></span>
          </div>
        </div>

        {loading && <div className="loading">Chargement du classement...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <>
            <div className="search-container">
              <input
                type="text"
                placeholder="Rechercher un runner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="leaderboard-list">
              {filteredPlayers.length === 0 ? (
                <p className="no-data">
                  {searchTerm ? `Aucun runner trouvé pour "${searchTerm}"` : 'Aucune donnée disponible'}
                </p>
              ) : (
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th className="rank">#</th>
                      <th className="player-name">Runner</th>
                      <th className="score">Elo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player, index) => (
                      <>
                        <tr
                          className="rank-row"
                          key={player.id || `${player.username}-${index}`}
                          onClick={() => window.open(`https://mcsrranked.com/stats/${player.username}`, '_blank')}
                          style={{ cursor: 'pointer' }}
                        >
                          <td className="rank">
                            <span className={`rank-number rank-${player.placement}`}>{player.placement}</span>
                          </td>
                          <td className="player-name">
                            {player.country && (
                              <img
                                src={countryToFlag(player.country)}
                                alt={player.country}
                                style={{ width: '20px', height: '15px', marginRight: '8px', verticalAlign: 'middle' }}
                              />
                            )}
                            {player.username}
                          </td>
                          <td className="score">{player.elo}</td>
                        </tr>
                        {player.placement === 16 && (
                          <tr className="qualification-threshold">
                            <td colSpan="3">
                              <div className="threshold-line">
                                <span className="threshold-text">Seuil de qualification</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default LeaderboardRanked
