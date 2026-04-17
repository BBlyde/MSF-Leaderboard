import './Admin.css'
import PlayerForm from './PlayerForm'

function formGroup1(formData) {
  const player = formData.get('player-1-display')
  alert(`You searched for '${player}'`)
}

function formGroup2(formData) {
  const player = formData.get('player-1 -display')
  alert(`You searched for '${player}'`)
}

const playerFields = [1, 2, 3, 4, 5, 6, 7, 8]

function Admin() {
  return (
    <div className="d-flex flex-column align-items-center text-white home-container">
      <h1 className="home-title">MSF ADMIN</h1>
      <span className="info">Page d'administration générale</span>

      <div className="section-divider" />

      <div className="header">
        <span>Groupe 1</span>
        <span>Nom</span>
        <span>Id</span>
        <span>Seed 1</span>
        <span>Seed 2</span>
        <span>Seed 3</span>
        <span>Seed 4</span>
        <span>Seed 5</span>
        <span>Seed 6</span>
        <span>Total</span>
      </div>
      <form action={formGroup1} className='form-mrm-1'>
        {playerFields.map((playerNumber) => (
          <PlayerForm key={playerNumber} playerNumber={playerNumber} />
        ))}
        <button type="submit">Valider</button>
      </form>

      <div className="header">
        <span>Groupe 2</span>
        <span>Nom</span>
        <span>Id</span>
        <span>Seed 1</span>
        <span>Seed 2</span>
        <span>Seed 3</span>
        <span>Seed 4</span>
        <span>Seed 5</span>
        <span>Seed 6</span>
        <span>Total</span>
      </div>
      <form action={formGroup2} className='form-mrm-2'>
        {playerFields.map((playerNumber) => (
          <PlayerForm key={playerNumber} playerNumber={playerNumber} />
        ))}
        <button type="submit">Valider</button>
      </form>
    </div>
  )
}

export default Admin
