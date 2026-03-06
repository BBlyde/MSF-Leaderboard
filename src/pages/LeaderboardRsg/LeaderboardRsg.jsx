import { useState, useEffect } from 'react'
import axios from 'axios'
import './LeaderboardRsg.css'

function LeaderboardRsg() {
  const [players, setPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const SHEET_ID = '1Fgn-assiNCTxiGCUALdRX5i3wRrQHbwE7iSisWynj78'

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  useEffect(() => {
    const filtered = players.filter(player =>
      player.runner.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredPlayers(filtered)
  }, [searchTerm, players])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`
      
      const response = await axios.get(sheetUrl)
      const data = parseCSV(response.data)
      
      setPlayers(data)
      setLoading(false)
    } catch (err) {
      console.error('Erreur de récupération du classement :', err)
      setError('Erreur de récupération du classement')
      setLoading(false)
    }
  }

  const parseCSV = (csv) => {
    const lines = csv.trim().split('\n')
    if (lines.length < 2) return []
    
    const headers = lines[0].split(',').map(h => h.trim())
    const data = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length === headers.length) {
        const obj = {}
        headers.forEach((header, index) => {
          obj[header.toLowerCase()] = values[index]
        })
        data.push(obj)
      }
    }
    
    return data
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>CLASSEMENT ANY%</h1>
        <span className="info">Catégorie RSG 1.16.1</span>
      </div>

      {loading && <div className="loading">Chargement du classement...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="section-divider" />
          <div className="search-container">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Rechercher un runner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
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
                    <th className="wins">Temps</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((player, index) => (
                    console.log(player),
                      <tr 
                        className="rank-row" 
                        key={`${player.id || player.runner}-${searchTerm}`}
                        onClick={() => window.open(`${player.lien}`, '_blank')}
                        style={{ cursor: 'pointer', animationDelay: `${index * 30}ms` }}
                      >
                      <td className="rank">
                        <span className={`rank-number rank-${player.classement}`}>{player.classement}</span>
                      </td>
                      <td className="player-name">
                        <span className="player-name-inner">
                          <img
                            src={`https://mc-heads.net/avatar/${player.pseudomc}/24`}
                            alt={player.runner}
                            className="player-head"
                          />
                          <span className="player-username">{player.runner}</span>
                        </span>
                      </td>
                      <td className="time">{player.temps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <a
            className="sheet-source"
            href="https://docs.google.com/spreadsheets/d/1Fgn-assiNCTxiGCUALdRX5i3wRrQHbwE7iSisWynj78/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="sheet-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="#0F9D58" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/>
              <path fill="#fff" d="M7 7h4v2H7zm0 4h4v2H7zm0 4h4v2H7zm6-8h4v2h-4zm0 4h4v2h-4zm0 4h4v2h-4z"/>
            </svg>
            Basé sur la Google Sheet des sub 15 MSF, merci à Avocat & Lunet
          </a>
        </>
      )}
    </div>
  )
}

export default LeaderboardRsg
