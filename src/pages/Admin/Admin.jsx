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

function formBracket(formData) {

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

      <form action={formBracket} className='form-bracket'>
        <div className='admin-match'>
          <span>DEMIE 1</span>
          <div className='player-name'>
            <input id="player1-semi-name" name="player1-semi-name" className='player-field' placeholder="Player 1" />
          </div>
          <div className='player-id'>
            <input id="player1-semi-id" name="player1-semi-id" className='player-field' placeholder="ID 1" />
          </div>
          <input type="number" min="0" max="2" id="player1-semi-score" placeholder='0'></input>
          VS
          <div className='player-name'>
            <input id="player2-semi-name" name="player2-semi-name" className='player-field' placeholder="Player 2" />
          </div>
          <div className='player-id'>
            <input id="player2-semi-id" name="player2-semi-id" className='player-field' placeholder="ID 2" />
          </div>
          <input type="number" min="0" max="2" id="player1-semi-score" placeholder='0'></input>
        </div>

        <div className='admin-match'>
          <span>DEMIE 2</span>
          <div className='player-name'>
            <input id="player3-semi-name" name="player3-semi-name" className='player-field' placeholder="Player 3" />
          </div>
          <div className='player-id'>
            <input id="player3-semi-id" name="player3-semi-id" className='player-field' placeholder="ID 3" />
          </div>
          <input type="number" min="0" max="2" id="player1-semi-score" placeholder='0'></input>
          VS
          <div className='player-name'>
            <input id="player4-semi-name" name="player4-semi-name" className='player-field' placeholder="Player 4" />
          </div>
          <div className='player-id'>
            <input id="player4-semi-id" name="player4-semi-id" className='player-field' placeholder="ID 4" />
          </div>
          <input type="number" min="0" max="2" id="player1-semi-score" placeholder='0'></input>
        </div>

        <div className='admin-match'>
          <span>LOWER</span>
          <div className='player-name'>
            <input id="player3-semi-name" name="player3-semi-name" className='player-field' placeholder="Player 3" />
          </div>
          <div className='player-id'>
            <input id="player3-semi-id" name="player3-semi-id" className='player-field' placeholder="ID 3" />
          </div>
          <input type="number" min="0" max="2" id="player1-semi-score" placeholder='0'></input>
          VS
          <div className='player-name'>
            <input id="player4-semi-name" name="player4-semi-name" className='player-field' placeholder="Player 4" />
          </div>
          <div className='player-id'>
            <input id="player4-semi-id" name="player4-semi-id" className='player-field' placeholder="ID 4" />
          </div>
          <input type="number" min="0" max="2" id="player1-semi-score" placeholder='0'></input>
        </div>

        <div className='admin-match'>
          <span>FINALE</span>
          <div className='player-name'>
            <input id="player3-semi-name" name="player3-semi-name" className='player-field' placeholder="Player 3" />
          </div>
          <div className='player-id'>
            <input id="player3-semi-id" name="player3-semi-id" className='player-field' placeholder="ID 3" />
          </div>
          <input type="number" min="0" max="2" id="player1-semi-score" placeholder='0'></input>
          VS
          <div className='player-name'>
            <input id="player4-semi-name" name="player4-semi-name" className='player-field' placeholder="Player 4" />
          </div>
          <div className='player-id'>
            <input id="player4-semi-id" name="player4-semi-id" className='player-field' placeholder="ID 4" />
          </div>
          <input type="number" min="0" max="2" id="player1-semi-score" placeholder='0'></input>
        </div>
      </form>
    </div>
  )
}

export default Admin
