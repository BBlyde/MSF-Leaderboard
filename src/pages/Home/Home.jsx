import MyComponent from '../../components/MyComponent'

function Home() {
  return (
    <div className="vh-100 text-white">
      <MyComponent title="Bienvenue" description="Ceci est un composant réutilisable" />
      <div style={{ padding: '2rem' }}>
        <h2>Bienvenue sur MSF Leaderboard</h2>
        <p>Découvrez les meilleurs joueurs et leurs scores.</p>
      </div>
    </div>
  )
}

export default Home
