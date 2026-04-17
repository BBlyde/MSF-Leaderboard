import { useMemo, useState } from 'react'
import SeedSelect from './SeedSelect'

const seedFields = [1, 2, 3, 4, 5, 6]
const initialSeeds = Object.fromEntries(seedFields.map((seedNumber) => [seedNumber, '0']))

function PlayerForm({ playerNumber }) {
  const [seeds, setSeeds] = useState(initialSeeds)

  const total = useMemo(
    () => Object.values(seeds).reduce((sum, value) => sum + Number(value), 0),
    [seeds],
  )

  const handleSeedChange = (seedNumber, value) => {
    setSeeds((currentSeeds) => ({
      ...currentSeeds,
      [seedNumber]: value,
    }))
  }

  return (
    <div className='form-player'>
      <div className='player-name'>
        <input id={`player-${playerNumber}-display`} name={`player-${playerNumber}-display`} className='player-field' placeholder={`Player ${playerNumber}`}/>
      </div>
      <div className='player-id'>
        <input id={`player-${playerNumber}-id`} name={`player-${playerNumber}-id`} className='player-field' placeholder={`ID ${playerNumber}`}/>
      </div>
      {seedFields.map((seedNumber) => (
        <SeedSelect
          key={`${playerNumber}-${seedNumber}`}
          seedNumber={seedNumber}
          value={seeds[seedNumber]}
          onChange={handleSeedChange}
          id={`player-${playerNumber}-seed-${seedNumber}`}
          name={`player-${playerNumber}-seed-${seedNumber}`}
        />
      ))}
      <div className='total'>
        <input
          id={`player-${playerNumber}-total`}
          name={`player-${playerNumber}-total`}
          className='total-field'
          value={total}
          readOnly
        />
        <br></br>
      </div>
    </div>
  )
}

export default PlayerForm
