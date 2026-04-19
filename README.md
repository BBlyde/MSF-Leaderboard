## MSF Leaderboard
React + Vite Website displaying both RSG and Ranked MSF Leaderboards aswell as informations about tournaments that we hosted

Live at : https://minecraftspeedrunfrance.fr

## API proxy architecture
- Frontend code calls only relative endpoints like `/api/prediction/mrm/leaderboard`.
- In local dev, Vite serves those routes through `vite-dev-api-plugin.js`.
- In production, `/api/*` routes are handled by serverless handlers in `api/`.
- Those handlers call the upstream backend defined by `BACKEND_API_BASE_URL` (or default `https://back.mcsr-game.com`).