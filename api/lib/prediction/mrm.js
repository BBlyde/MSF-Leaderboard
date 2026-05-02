/**
 * Alias pour `/api/predictions/mrm` — même handler (proxy + enrichissement GET).
 * Le front et Quarkus utilisent `/api/prediction/mrm` ; Vercel mappe les routes depuis `api/<chemin>.js`.
 */
export { default } from '../predictions/mrm.js'
