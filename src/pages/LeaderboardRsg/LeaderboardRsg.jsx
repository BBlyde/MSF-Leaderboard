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
        <h1>Classement Any%</h1>
        <span className="info">Catégorie RSG 1.16.1</span>
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
                    <th className="wins">Temps</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((player, index) => (
                      <tr key={index} className={`rank-row`}>
                      <td className="rank">
                        <span className={`rank-number rank-${index + 1}`}>{index + 1}</span>
                      </td>
                      <td className="player-name">{player.runner}</td>
                      <td className="time">{player.temps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default LeaderboardRsg
