import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import '../Mrm.css'
import groupe1Baseline from '../groupe1.json'
import groupe2Baseline from '../groupe2.json'
import { reconcileOrder } from '../mrmPredictionStorage'
import MrmPronosLeaderboard from '../MrmPronosLeaderboard'

/** Aligné backend Quarkus : POST/GET /api/prediction/{event} (pas /api/predictions/...). */
const mrmPredictionApiUrl = '/api/prediction/mrm'

const DEFAULT_HEAD = 'https://mc-heads.net/avatar/0385/48'

function mcHeadUrl(uuid) {
  if (uuid != null && String(uuid).trim() !== '') {
    return `https://mc-heads.net/avatar/${uuid}/48`
  }
  return DEFAULT_HEAD
}

/** @param {1 | 2} group */
function playerId(group, baselineIndex) {
  return `g${group}:${baselineIndex}`
}

function semi1PairIds(order1, order2) {
  return [playerId(1, order1[0]), playerId(2, order2[1])]
}

function semi2PairIds(order1, order2) {
  return [playerId(2, order2[0]), playerId(1, order1[1])]
}

function SortableGroupRow({ id, qualify, dragDisabled, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: dragDisabled,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  const rowClass = [
    qualify ? 'row-qualify' : '',
    dragDisabled ? 'mrm-sortable-row--locked' : 'mrm-sortable-row',
    isDragging ? 'mrm-sortable-row--dragging' : '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={rowClass}
      {...attributes}
      {...(dragDisabled ? {} : listeners)}
    >
      {children}
    </tr>
  )
}

function SortableGroupTable({
  groupNum,
  baseline,
  order,
  onOrderChange,
  titleClassName,
  groupTitle,
  interactionsEnabled,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const sortableIds = useMemo(() => order.map((idx) => playerId(groupNum, idx)), [order, groupNum])

  const onDragEnd = useCallback(
    (event) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const a = String(active.id)
      const b = String(over.id)
      const oldIndex = sortableIds.indexOf(a)
      const newIndex = sortableIds.indexOf(b)
      if (oldIndex < 0 || newIndex < 0) return
      onOrderChange(arrayMove(order, oldIndex, newIndex))
    },
    [onOrderChange, order, sortableIds],
  )

  return (
    <div className={`group-table group-table-${groupNum}`}>
      <div className="group-table-scroll">
        <div className={`group-title ${titleClassName}`}>{groupTitle}</div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <table>
            <thead>
              <tr>
                <th className="col-rank">#</th>
                <th className="col-player">Runner</th>
                <th>S1</th>
                <th>S2</th>
                <th>S3</th>
                <th>S4</th>
                <th>S5</th>
                <th>S6</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                {order.map((baselineIdx, rank) => {
                  const p = baseline[baselineIdx]
                  const sid = playerId(groupNum, baselineIdx)
                  return (
                    <SortableGroupRow key={sid} id={sid} qualify={rank < 2} dragDisabled={!interactionsEnabled}>
                      <td className="col-rank">{rank + 1}</td>
                      <td className="col-player">
                        <img src={mcHeadUrl(p.uuid)} alt="" className="player-head" />
                        &nbsp; &nbsp;
                        {p.name}
                      </td>
                      <td>{p.s1}</td>
                      <td>{p.s2}</td>
                      <td>{p.s3}</td>
                      <td>{p.s4}</td>
                      <td>{p.s5}</td>
                      <td>{p.s6}</td>
                      <td className="col-pts">{p.total}</td>
                    </SortableGroupRow>
                  )
                })}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>
    </div>
  )
}

function BracketPlayerButton({ pid, player, winnerId, onPick, pickable }) {
  const isWinner = pid != null && winnerId === pid
  const isTbd =
    pid == null ||
    !player ||
    !player.name ||
    String(player.name).trim() === '' ||
    player.name === 'TBD'
  if (isTbd) {
    return (
      <div className="player tbd">
        <img src={DEFAULT_HEAD} alt="" className="player-head" width={24} height={24} />
        <span>TBD</span>
      </div>
    )
  }
  const isLoser = winnerId != null && !isWinner
  const cls = ['player', 'mrm-match-pickable']
  if (isWinner) cls.push('mrm-match-winner')
  else if (isLoser) cls.push('mrm-match-loser')
  if (!pickable) cls.push('mrm-match-pickable--disabled')
  return (
    <button
      type="button"
      className={cls.join(' ')}
      disabled={!pickable}
      onClick={() => {
        if (!pickable || pid == null) return
        onPick(isWinner ? null : pid)
      }}
    >
      <img src={mcHeadUrl(player.uuid)} alt="" className="player-head mrm-bracket-head" width={24} height={24} />
      <span className="mrm-bracket-name">{player.name}</span>
    </button>
  )
}

function MrmPrediction() {
  const location = useLocation()
  const g1 = groupe1Baseline
  const g2 = groupe2Baseline

  const [discordUser, setDiscordUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  const [order1, setOrder1] = useState(() => Array.from({ length: g1.length }, (_, i) => i))
  const [order2, setOrder2] = useState(() => Array.from({ length: g2.length }, (_, i) => i))
  const [semi1Winner, setSemi1Winner] = useState(null)
  const [semi2Winner, setSemi2Winner] = useState(null)
  const [finalWinner, setFinalWinner] = useState(null)
  const [hydrated, setHydrated] = useState(false)

  /** Payload JSON dernier aligné serveur / dernier POST réussi — pas de POST si identique à l’état courant. */
  const baselinePredictionPayloadRef = useRef(null)
  /** Après GET : une capture de baseline depuis l’état React (post-effets de réconciliation), puis false. */
  const captureBaselineAfterHydrateRef = useRef(false)

  const canEdit = authChecked && discordUser != null && hydrated

  const predictionStateRef = useRef({
    order1,
    order2,
    semi1Winner,
    semi2Winner,
    finalWinner,
  })
  predictionStateRef.current = { order1, order2, semi1Winner, semi2Winner, finalWinner }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        const data = res.ok ? await res.json() : { user: null }
        if (!cancelled) setDiscordUser(data.user ?? null)
      } catch {
        if (!cancelled) setDiscordUser(null)
      } finally {
        if (!cancelled) setAuthChecked(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [location.pathname])

  useEffect(() => {
    if (!authChecked) return

    if (!discordUser) {
      captureBaselineAfterHydrateRef.current = false
      baselinePredictionPayloadRef.current = null
      setOrder1(Array.from({ length: g1.length }, (_, i) => i))
      setOrder2(Array.from({ length: g2.length }, (_, i) => i))
      setSemi1Winner(null)
      setSemi2Winner(null)
      setFinalWinner(null)
      setHydrated(true)
      return
    }

    baselinePredictionPayloadRef.current = null
    captureBaselineAfterHydrateRef.current = false
    setHydrated(false)
    let cancelled = false
    ;(async () => {
      const defaultOrder1 = Array.from({ length: g1.length }, (_, i) => i)
      const defaultOrder2 = Array.from({ length: g2.length }, (_, i) => i)

      try {
        const res = await fetch(mrmPredictionApiUrl, { credentials: 'include' })
        const data = res.ok ? await res.json() : {}
        const pred = data?.prediction
        if (cancelled) return

        if (pred && typeof pred === 'object') {
          const o1 = reconcileOrder(g1.length, pred.order1)
          const o2 = reconcileOrder(g2.length, pred.order2)
          setOrder1(o1)
          setOrder2(o2)
          const s1 = semi1PairIds(o1, o2)
          const s2 = semi2PairIds(o1, o2)
          const w1 = pred.semi1Winner && s1.includes(pred.semi1Winner) ? pred.semi1Winner : null
          const w2 = pred.semi2Winner && s2.includes(pred.semi2Winner) ? pred.semi2Winner : null
          setSemi1Winner(w1)
          setSemi2Winner(w2)
          const finalists = [w1, w2].filter(Boolean)
          const fw =
            pred.finalWinner && finalists.length === 2 && finalists.includes(pred.finalWinner)
              ? pred.finalWinner
              : null
          setFinalWinner(fw)
        } else {
          setOrder1(defaultOrder1)
          setOrder2(defaultOrder2)
          setSemi1Winner(null)
          setSemi2Winner(null)
          setFinalWinner(null)
        }
      } catch {
        if (!cancelled) {
          setOrder1(defaultOrder1)
          setOrder2(defaultOrder2)
          setSemi1Winner(null)
          setSemi2Winner(null)
          setFinalWinner(null)
        }
      } finally {
        if (!cancelled) {
          captureBaselineAfterHydrateRef.current = true
          setHydrated(true)
        }
      }
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- g1/g2 lengths follow imports
  }, [authChecked, discordUser, location.pathname])

  useEffect(() => {
    if (!hydrated) return
    const s1 = semi1PairIds(order1, order2)
    const s2 = semi2PairIds(order1, order2)
    setSemi1Winner((w) => (w && s1.includes(w) ? w : null))
    setSemi2Winner((w) => (w && s2.includes(w) ? w : null))
  }, [hydrated, order1, order2])

  useEffect(() => {
    if (!hydrated) return
    const finalists = [semi1Winner, semi2Winner].filter(Boolean)
    if (finalists.length !== 2) {
      setFinalWinner(null)
      return
    }
    setFinalWinner((w) => (w && finalists.includes(w) ? w : null))
  }, [hydrated, semi1Winner, semi2Winner])

  /** Après GET + effets de réconciliation : figer la baseline sans POST (état lu après le prochain tick). */
  useEffect(() => {
    if (!hydrated || !canEdit || !captureBaselineAfterHydrateRef.current) return
    const t = setTimeout(() => {
      if (!captureBaselineAfterHydrateRef.current) return
      const s = predictionStateRef.current
      baselinePredictionPayloadRef.current = JSON.stringify({
        order1: s.order1,
        order2: s.order2,
        semi1Winner: s.semi1Winner ?? null,
        semi2Winner: s.semi2Winner ?? null,
        finalWinner: s.finalWinner ?? null,
      })
      captureBaselineAfterHydrateRef.current = false
    }, 0)
    return () => clearTimeout(t)
  }, [hydrated, canEdit, order1, order2, semi1Winner, semi2Winner, finalWinner])

  useEffect(() => {
    if (!hydrated || !canEdit) return
    if (captureBaselineAfterHydrateRef.current) return

    const payload = {
      order1,
      order2,
      semi1Winner: semi1Winner ?? null,
      semi2Winner: semi2Winner ?? null,
      finalWinner: finalWinner ?? null,
    }
    const payloadStr = JSON.stringify(payload)
    if (baselinePredictionPayloadRef.current !== null && payloadStr === baselinePredictionPayloadRef.current) {
      return
    }

    const syncTimer = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch(mrmPredictionApiUrl, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: payloadStr,
          })
          if (!res.ok) {
            const errText = await res.text().catch(() => '')
            console.warn('[MRM prediction sync]', res.status, errText)
          } else {
            baselinePredictionPayloadRef.current = payloadStr
          }
        } catch (e) {
          console.warn('[MRM prediction sync]', e)
        }
      })()
    }, 450)
    return () => clearTimeout(syncTimer)
  }, [hydrated, canEdit, order1, order2, semi1Winner, semi2Winner, finalWinner])

  const playerMap = useMemo(() => {
    const m = new Map()
    g1.forEach((p, i) => m.set(playerId(1, i), p))
    g2.forEach((p, i) => m.set(playerId(2, i), p))
    return m
  }, [g1, g2])

  const s1Ids = useMemo(() => semi1PairIds(order1, order2), [order1, order2])
  const s2Ids = useMemo(() => semi2PairIds(order1, order2), [order1, order2])

  const finalistIds = useMemo(() => {
    const a = [semi1Winner, semi2Winner].filter(Boolean)
    return a.length === 2 ? a : [null, null]
  }, [semi1Winner, semi2Winner])

  const runnerUpId = useMemo(() => {
    if (!finalWinner || finalistIds[0] == null) return null
    const [x, y] = finalistIds
    if (x === finalWinner) return y
    if (y === finalWinner) return x
    return null
  }, [finalWinner, finalistIds])

  const firstPlayer = finalWinner ? playerMap.get(finalWinner) : null
  const secondPlayer = runnerUpId ? playerMap.get(runnerUpId) : null

  return (
    <div className="d-flex flex-column align-items-center text-white mrm-container mrm-prediction">
      <div className="mrm-header">
        <div className="mrm-title-row">
          <span className="mrm-title">MSF RANKED MASTERS </span>
          <span className="mrm-season">S10</span>
        </div>
        <span className="mrm-subtitle">Prédictions — classe les groupes, choisis les vainqueurs</span>
      </div>

      {authChecked && !discordUser ? (
        <div className="mrm-prediction-auth-banner" role="status">
          <span>
            Connecte-toi avec Discord pour enregistrer et modifier tes prédictions.
          </span>
          <a className="mrm-prediction-auth-link" href="/api/auth/discord">
            Connexion Discord
          </a>
        </div>
      ) : null}

      <div className="section-divider" />

      <div className="mrm-prediction-content-wrap">
      <div className="container">
        <div className="container-first">
          <div className="mrm-playoffs">
            <h2 className="playoffs-title">PHASE FINALE</h2>
            <div className="bracket">
              <div className="bracket-labels">
                <div className="round-label">DEMI-FINALE 1</div>
                <div className="round-label-spacer" />
                <div className="round-label">FINALE</div>
                <div className="round-label-spacer" />
                <div className="round-label">DEMI-FINALE 2</div>
              </div>
              <div className="bracket-matches">
                <div className="match">
                  <BracketPlayerButton
                    pid={s1Ids[0]}
                    player={playerMap.get(s1Ids[0])}
                    winnerId={semi1Winner}
                    onPick={setSemi1Winner}
                    pickable={canEdit}
                  />
                  <BracketPlayerButton
                    pid={s1Ids[1]}
                    player={playerMap.get(s1Ids[1])}
                    winnerId={semi1Winner}
                    onPick={setSemi1Winner}
                    pickable={canEdit}
                  />
                </div>
                <div className="connector connector-left" />
                <div className="match match-final">
                  <BracketPlayerButton
                    pid={finalistIds[0]}
                    player={finalistIds[0] ? playerMap.get(finalistIds[0]) : null}
                    winnerId={finalWinner}
                    onPick={setFinalWinner}
                    pickable={canEdit && finalistIds[0] != null && finalistIds[1] != null}
                  />
                  <BracketPlayerButton
                    pid={finalistIds[1]}
                    player={finalistIds[1] ? playerMap.get(finalistIds[1]) : null}
                    winnerId={finalWinner}
                    onPick={setFinalWinner}
                    pickable={canEdit && finalistIds[0] != null && finalistIds[1] != null}
                  />
                </div>
                <div className="connector connector-right" />
                <div className="match">
                  <BracketPlayerButton
                    pid={s2Ids[0]}
                    player={playerMap.get(s2Ids[0])}
                    winnerId={semi2Winner}
                    onPick={setSemi2Winner}
                    pickable={canEdit}
                  />
                  <BracketPlayerButton
                    pid={s2Ids[1]}
                    player={playerMap.get(s2Ids[1])}
                    winnerId={semi2Winner}
                    onPick={setSemi2Winner}
                    pickable={canEdit}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mrm-podium">
            <h2 className="podium-title">PODIUM</h2>
            <div className="podium-wrapper">
              <div className="podium-player podium-second">
                <div className="podium-head">
                  <img src={secondPlayer ? mcHeadUrl(secondPlayer.uuid) : DEFAULT_HEAD} className="player-head" alt="" />
                </div>
                <div className="podium-name">{secondPlayer?.name ?? 'TBD'}</div>
                <div className="podium-block podium-block-second">
                  <span className="podium-rank">2</span>
                </div>
              </div>
              <div className="podium-player podium-first">
                <div className="podium-head">
                  <img src={firstPlayer ? mcHeadUrl(firstPlayer.uuid) : DEFAULT_HEAD} className="player-head" alt="" />
                </div>
                <div className="podium-name">{firstPlayer?.name ?? 'TBD'}</div>
                <div className="podium-block podium-block-first">
                  <span className="podium-rank">1</span>
                </div>
              </div>
              <div className="podium-player podium-third">
                <div className="podium-head">
                  <img src={DEFAULT_HEAD} className="player-head" alt="" />
                </div>
                <div className="podium-name">TBD</div>
                <div className="podium-block podium-block-third">
                  <span className="podium-rank">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-second">
          <div className="mrm-groups">
            <div className="mrm-prediction-groups-head">
              <h2 className="playoffs-title">PHASE DE GROUPES</h2>
              <div className="mrm-prediction-hint-slot">
                <p className="mrm-prediction-hint">
                  Fais glisser les lignes pour définir ton classement (les deux premiers vont en demi-finales).
                </p>
              </div>
            </div>
            <div className="groups-wrapper">
              <SortableGroupTable
                groupNum={1}
                baseline={g1}
                order={order1}
                onOrderChange={setOrder1}
                titleClassName="group-title-1"
                groupTitle="GROUPE 1"
                interactionsEnabled={canEdit}
              />
              <SortableGroupTable
                groupNum={2}
                baseline={g2}
                order={order2}
                onOrderChange={setOrder2}
                titleClassName="group-title-2"
                groupTitle="GROUPE 2"
                interactionsEnabled={canEdit}
              />
            </div>
          </div>
        </div>

        <div className="section-divider" />

        <div className="container-third">
          <div className="rules-panel">
            <div className="rules-panel-header">QUALIFICATION</div>
            <div className="rules-panel-body">
              <div className="rules-row">
                <i className="bi bi-bar-chart-fill rules-icon" />
                <span>
                  La qualification aux MRM s&apos;effectue en finissant parmi les 16 plus hauts élos au{' '}
                  <Link to="/ranked" className="rules-link">
                    classement Ranked MSF
                  </Link>{' '}
                  à la toute fin de la saison de MCSR Ranked
                </span>
              </div>
              <div className="rules-row">
                <i className="bi bi-people-fill rules-icon" />
                <span>
                  Les 16 participant·e·s sont alors placé·e·s dans deux groupes de 8 de manière aléatoire, à la suite
                  d&apos;un <span className="rules-highlight">tirage au sort</span> effectué en stream la semaine
                  suivante
                </span>
              </div>
              <div className="rules-row">
                <i className="bi bi-calendar-event rules-icon" />
                <span>
                  La phase de groupes se déroulera le samedi <span className="rules-highlight">23/05/2026</span> à la
                  suite des playoffs internationaux, afin de permettre à chacun de pouvoir suivre les deux tournois
                </span>
              </div>
            </div>
          </div>

          <div className="rules-panel">
            <div className="rules-panel-header">PHASE DE GROUPES</div>
            <div className="rules-panel-body">
              <div className="rules-row">
                <i className="bi bi-calendar-check rules-icon" />
                <span>
                  Le <span className="rules-highlight">groupe 1</span> commence à jouer le samedi à{' '}
                  <span className="rules-highlight">14h</span> (fuseau horaire de Paris) et le{' '}
                  <span className="rules-highlight">groupe 2</span> enchaine à{' '}
                  <span className="rules-highlight">16h</span> le même jour
                </span>
              </div>
              <div className="rules-row">
                <i className="bi bi-stopwatch rules-icon" />
                <span>
                  Chaque groupe consiste en <span className="rules-highlight">6 seeds</span> qui s&apos;enchainent,
                  avec une limite de temps de <span className="rules-highlight">15 minutes par seed</span>, avec une
                  pause de 5 minutes entre les seeds 3 et 4
                </span>
              </div>
              <div className="rules-row">
                <i className="bi bi-database rules-icon" />
                <span>
                  Chaque joueur·se accumule des points en fonction de son placement sur chaque seed :{' '}
                  <span className="rules-highlight">10-8-6-5-4-3-2-1</span>, et 0 points pour ceux·celles n&apos;étant
                  pas en mesure de finir
                </span>
              </div>
              <div className="rules-row">
                <i className="bi bi-person-x-fill rules-icon" />
                <span>
                  Après la 3ème seed, les 2 joueur·se·s ayant accumulé le moins de points seront éliminé·e·s, suivi·e·s
                  de 2 après la seed 4, un·e après la seed 5 et un·e après la 6
                </span>
              </div>
              <div className="rules-row">
                <i className="bi bi-check-circle-fill rules-icon" />
                <span>
                  Les deux participant·e·s restant·e·s de chaque groupe se qualifient pour la phase finale des MRM qui
                  se déroulera le lendemain soit le <span className="rules-highlight">24/05/2026</span>
                </span>
              </div>
            </div>
          </div>

          <div className="rules-panel">
            <div className="rules-panel-header">PHASE FINALE</div>
            <div className="rules-panel-body">
              <div className="rules-row">
                <i className="bi bi-intersect rules-icon" />
                <span>
                  Le premier de chaque groupe affronte le second du groupe suivant en demi-finale lors d&apos;un{' '}
                  <span className="rules-highlight">BO5</span> (une seed de chaque type) à partir de{' '}
                  <span className="rules-highlight">14h</span>
                </span>
              </div>
              <div className="rules-row">
                <i className="bi bi-trophy-fill rules-icon" />
                <span>
                  Les finalistes s&apos;affrontent après une pause de 10 minutes suivant la deuxième demi-finale, lors
                  d&apos;un <span className="rules-highlight">BO7</span> comprenant une seed de chaque type{' '}
                  <span className="rules-highlight">+ 1 BT et 1 RP</span> si nécessaire
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MrmPronosLeaderboard highlightUserId={discordUser?.id ?? null} />
      </div>
    </div>
  )
}

export default MrmPrediction
