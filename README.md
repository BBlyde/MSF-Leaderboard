## MSF Leaderboard
React + Vite Website displaying both RSG and Ranked MSF Leaderboards aswell as informations about tournaments that we hosted

Live at : https://minecraftspeedrunfrance.fr

## API proxy architecture
- Frontend code calls only relative endpoints like `/api/prediction/mrm/leaderboard`.
- In local dev, Vite serves those routes through `vite-dev-api-plugin.js`, which relays most `/api/*` calls to `BACKEND_API_BASE_URL` (see `api/lib/backendApiProxy.js`). Exceptions: `/api/auth/*`, and `/api/prediction/mrm` / `/api/predictions/mrm` (handler enrichi sur GET).
- On Vercel, only the explicit `api/*` handlers (auth, `predictions/mrm`, etc.) are deployed; there is no catch-all proxy—host your API on the same origin or add handlers as needed.