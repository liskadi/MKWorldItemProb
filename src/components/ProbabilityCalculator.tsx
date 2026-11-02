import React, { useEffect, useMemo, useState } from 'react';
import { ITEMS_BY_KEY, MKW_DATA } from '../data/mkwData';
import type { TableId } from '../types/mkw';
import {
  computeColumnDistribution,
  getPhaseForSeconds,
  ordinal,
} from '../utils/lotteryEngine';

export interface CalculatorExternalState {
  itemKey: string;
  placement: number;
  lobbySize: number;
  seconds: number;
  tableId: TableId;
}

interface ProbabilityCalculatorProps {
  calcState: CalculatorExternalState;
  setCalcState: React.Dispatch<React.SetStateAction<CalculatorExternalState>>;
}

const PHASE_CHIPS = [
  { seconds: 0, label: '0s–25s (P1)', pid: 1 },
  { seconds: 25, label: '25s–30s (P2)', pid: 2 },
  { seconds: 30, label: '30s–35s (P3)', pid: 3 },
  { seconds: 35, label: '35s–45s (P4)', pid: 4 },
  { seconds: 45, label: '45s+ (P5)', pid: 5 },
];

const TABLE_SOURCE_TOOLTIP =
  'Standard Race: The primary item probability table used by human players in Grand Prix, VS Race, and Online Race modes.\nCPU/AI Racers: The dedicated item probability table used by computer-controlled (COM) opponents.';

export const ProbabilityCalculator: React.FC<ProbabilityCalculatorProps> = ({
  calcState,
  setCalcState,
}) => {
  const [heldItemKey, setHeldItemKey] = useState<string>('None');
  const [distanceMeters, setDistanceMeters] = useState<number>(0);

  const { itemKey, placement, lobbySize, seconds, tableId } = calcState;
  const [lobbyInputStr, setLobbyInputStr] = useState<string>(String(lobbySize));

  useEffect(() => {
    setLobbyInputStr(String(lobbySize));
  }, [lobbySize]);

  const item = ITEMS_BY_KEY[itemKey];
  const ph = getPhaseForSeconds(seconds);

  const dist = useMemo(
    () =>
      computeColumnDistribution({
        placement,
        lobbySize,
        seconds,
        tableId,
        heldItemKey,
        distanceMeters,
      }),
    [placement, lobbySize, seconds, tableId, heldItemKey, distanceMeters]
  );

  const itemRes = dist.items[item.key];
  const pct = itemRes.pct;

  let doubleBoxPct = 0;
  if (pct > 0 && dist.totalWeight > 0) {
    let secondSlotMissHit = 0;
    for (const other of MKW_DATA.items) {
      if (other.key === item.key) continue;
      const otherWeight = dist.items[other.key].effectiveWeight;
      if (otherWeight <= 0) continue;

      const slot2Total = dist.totalWeight - (other.canHaveSameItem ? 0 : otherWeight);
      if (slot2Total > 0) {
        secondSlotMissHit +=
          (otherWeight / dist.totalWeight) * (itemRes.effectiveWeight / slot2Total);
      }
    }
    doubleBoxPct = pct + secondSlotMissHit * 100;
  }

  const placementBars = useMemo(
    () =>
      Array.from({ length: lobbySize }, (_, idx) => {
        const p = idx + 1;
        const pDist = computeColumnDistribution({
          placement: p,
          lobbySize,
          seconds,
          tableId,
          heldItemKey,
          distanceMeters,
        });
        return {
          placement: p,
          finalRank: pDist.rankInfo.finalRank,
          isClamped: pDist.rankInfo.isClamped,
          pct: pDist.items[item.key].pct,
        };
      }),
    [lobbySize, seconds, tableId, heldItemKey, distanceMeters, item.key]
  );

  const sortedRouletteItems = MKW_DATA.items
    .map((it) => ({ item: it, res: dist.items[it.key] }))
    .filter((e) => e.res.pct > 0 || e.res.rawWeight > 0 || e.item.key === item.key)
    .sort((a, b) => b.res.pct - a.res.pct || b.res.rawWeight - a.res.rawWeight);

  const applyLobbySize = (size: number) => {
    setCalcState((prev) => ({
      ...prev,
      lobbySize: size,
      placement: Math.min(prev.placement, size),
    }));
  };

  const handleLobbyInputChange = (rawVal: string) => {
    setLobbyInputStr(rawVal);
    const parsed = parseInt(rawVal, 10);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 24) {
      applyLobbySize(parsed);
    }
  };

  const handleLobbyInputBlur = () => {
    const parsed = parseInt(lobbyInputStr, 10);
    const clamped = Number.isNaN(parsed) ? 12 : Math.min(24, Math.max(1, parsed));
    setLobbyInputStr(String(clamped));
    applyLobbySize(clamped);
  };

  const { rankInfo } = dist;
  const oddsText = pct > 0 ? `1 in ${(100 / pct).toFixed(2)} pulls` : itemRes.status;

  return (
    <section id="section-calculator" className="panel-card">
      <div className="panel-header">
        <div className="panel-title-group">
          <div className="section-eyebrow">03 • REAL-TIME SCENARIO SIMULATOR &amp; ODDS ENGINE</div>
          <h2>Interactive Item Probability Calculator</h2>
          <p className="panel-desc">
            Configure your exact placement, target item, race phase, and held Slot 1 item (simulating duplicate slot
            prevention) to compute exact single-box and double-box pull odds.
          </p>
        </div>
      </div>

      <div className="calculator-grid">
        <div className="calc-inputs-card">
          <h3 className="calc-subheading">1. Race &amp; Player Parameters</h3>

          <div className="form-group">
            <label htmlFor="calc-item-select">Target Item</label>
            <div className="item-select-row">
              <img src={item.icon} alt={item.name} className="calc-item-preview-img" />
              <select
                id="calc-item-select"
                className="sleek-select full-width"
                value={itemKey}
                onChange={(e) => setCalcState((prev) => ({ ...prev, itemKey: e.target.value }))}
              >
                {MKW_DATA.items.map((it) => (
                  <option key={it.key} value={it.key}>
                    {it.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="calc-position-select">Your Placement</label>
              <select
                id="calc-position-select"
                className="sleek-select full-width"
                value={placement}
                onChange={(e) =>
                  setCalcState((prev) => ({
                    ...prev,
                    placement: Number(e.target.value),
                  }))
                }
              >
                {Array.from({ length: lobbySize }, (_, idx) => {
                  const p = idx + 1;
                  return (
                    <option key={p} value={p}>
                      {ordinal(p)} Place
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="calc-lobby-size">Total Racers in Lobby (1–24)</label>
              <input
                type="number"
                id="calc-lobby-size"
                className="sleek-input full-width"
                min={1}
                max={24}
                value={lobbyInputStr}
                onChange={(e) => handleLobbyInputChange(e.target.value)}
                onBlur={handleLobbyInputBlur}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="slider-label-row">
              <label>Race Elapsed Time</label>
              <span className="mono-badge">
                Phase {ph.id} ({ph.timeRange})
              </span>
            </div>
            <div className="phase-quick-chips">
              {PHASE_CHIPS.map((chip) => (
                <button
                  key={chip.pid}
                  type="button"
                  className={`chip-btn ${ph.id === chip.pid ? 'active' : ''}`}
                  onClick={() => setCalcState((prev) => ({ ...prev, seconds: chip.seconds }))}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <h3 className="calc-subheading">2. Inventory &amp; Ruleset</h3>

          <div className="form-group">
            <label
              htmlFor="calc-held-select"
              title="All items except Single Mushroom block pulling a duplicate in Slot 2 while held in Slot 1."
            >
              Item Already Held in Slot 1
            </label>
            <select
              id="calc-held-select"
              className="sleek-select full-width"
              value={heldItemKey}
              onChange={(e) => setHeldItemKey(e.target.value)}
            >
              <option value="None">None (Empty Slot 1 / Fresh Pull)</option>
              {MKW_DATA.items.map((it) => (
                <option key={it.key} value={it.key}>
                  {it.name} ({it.canHaveSameItem ? 'Duplicate Allowed' : 'Blocks Slot 2 Duplicate'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label
                htmlFor="calc-table-select"
                className="th-tooltip"
                title={TABLE_SOURCE_TOOLTIP}
              >
                <span>Ruleset / Table</span> <span className="info-icon">?</span>
              </label>
              <select
                id="calc-table-select"
                className="sleek-select full-width"
                value={tableId}
                onChange={(e) =>
                  setCalcState((prev) => ({ ...prev, tableId: e.target.value as TableId }))
                }
              >
                {MKW_DATA.tablesMeta.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label
                htmlFor="calc-distance-input"
                title="When you fall 250m or further behind 1st place, the game can promote your item pool toward deeper comeback positions."
              >
                Distance Behind 1st (m) ⓘ
              </label>
              <input
                type="number"
                id="calc-distance-input"
                className="sleek-input full-width"
                min={0}
                max={2000}
                step={25}
                value={distanceMeters}
                onChange={(e) => setDistanceMeters(Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
          </div>
        </div>

        <div className="calc-results-column">
          <div className="calc-hero-card">
            <div className="hero-item-side">
              <div className="hero-item-img-box">
                <img src={item.icon} alt={item.name} className="hero-item-img" />
              </div>
              <div className="hero-item-info">
                <div className="section-eyebrow">
                  {ordinal(placement)} OF {lobbySize} RACERS • PHASE {ph.id} ({ph.timeRange})
                </div>
                <h3 className="hero-item-title">{item.name}</h3>
                <div className="hero-badges-row">
                  <span className="version-pill">Base Pool: {ordinal(rankInfo.baseRank)}</span>
                  {rankInfo.distancePromotions > 0 && (
                    <span className="clamp-pill">
                      +{rankInfo.distancePromotions} Distance Shift → {ordinal(rankInfo.promotedRank)}
                    </span>
                  )}
                  {rankInfo.isClamped ? (
                    <span className="clamp-pill">{rankInfo.clampApplied}</span>
                  ) : (
                    <span
                      className="version-pill"
                      style={{
                        borderColor: 'rgba(16,185,129,0.4)',
                        color: '#34d399',
                        background: 'rgba(16,185,129,0.12)',
                      }}
                    >
                      Effective Pool: {ordinal(rankInfo.finalRank)}
                    </span>
                  )}
                </div>
                <p className="hero-item-notes">{item.notes}</p>
              </div>
            </div>

            <div className="hero-metrics-side">
              <div className="hero-stat">
                <span className="hero-stat-label">Single Item Box</span>
                <span className="hero-stat-main">{pct.toFixed(2)}%</span>
                <span className="hero-stat-sub">
                  Weight: {itemRes.effectiveWeight} / {dist.totalWeight} (Raw: {itemRes.rawWeight})
                </span>
                <span className="hero-stat-sub" style={{ color: 'var(--accent-gold)' }}>
                  {oddsText}
                </span>
              </div>

              <div className="hero-stat hero-stat-divider">
                <span className="hero-stat-label">Double Item Box (≥1)</span>
                <span className="hero-stat-secondary">{doubleBoxPct.toFixed(2)}%</span>
                <span className="hero-stat-sub">Exact 2-Slot Non-Duplicate Odds</span>
                <span className="hero-stat-sub">
                  Max Held ({lobbySize <= 12 ? '12P' : '24P'}):{' '}
                  {lobbySize <= 12 ? item.maxHolders12P : item.maxHolders24P} racers
                </span>
              </div>
            </div>
          </div>

          <div className="calc-charts-grid">
            <div className="calc-subcard">
              <div className="subcard-header">
                <h4>{item.name} Across All Placements</h4>
                <span className="subcard-badge">
                  1st – {ordinal(lobbySize)} (Phase {ph.id})
                </span>
              </div>
              <div className="bar-chart-list">
                {placementBars.map((pRow) => (
                  <div
                    key={pRow.placement}
                    className={`bar-row bar-row-pos ${pRow.placement === placement ? 'is-selected' : ''}`}
                    onClick={() =>
                      setCalcState((prev) => ({ ...prev, placement: pRow.placement }))
                    }
                  >
                    <div className="bar-row-label">
                      <span>{ordinal(pRow.placement)}</span>
                      <small
                        style={{
                          color: pRow.isClamped ? 'var(--accent-gold)' : 'var(--text-muted)',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '0.68rem',
                        }}
                      >
                        {pRow.isClamped
                          ? `${ordinal(pRow.finalRank)} (Clamped)`
                          : ordinal(pRow.finalRank)}
                      </small>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${Math.min(100, pRow.pct).toFixed(1)}%` }}
                      />
                    </div>
                    <div
                      className="bar-val"
                      style={{
                        color: pRow.pct > 0 ? 'var(--text-main)' : 'var(--text-muted)',
                      }}
                    >
                      {pRow.pct.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="calc-subcard">
              <div className="subcard-header">
                <h4>Full Roulette at {ordinal(placement)} Place</h4>
                <span className="subcard-badge">
                  Pool: {ordinal(rankInfo.finalRank)} • ΣW = {dist.totalWeight}
                </span>
              </div>
              <div className="bar-chart-list">
                {sortedRouletteItems.map(({ item: it, res }) => (
                  <div
                    key={it.key}
                    className={`bar-row bar-row-item ${it.key === item.key ? 'is-selected' : ''}`}
                    onClick={() => setCalcState((prev) => ({ ...prev, itemKey: it.key }))}
                  >
                    <div className="bar-row-label" title={`${it.name} (${res.status})`}>
                      <img src={it.icon} alt={it.name} />
                      <span className="bar-item-name">{it.name}</span>
                      {res.pct <= 0 && res.rawWeight > 0 && (
                        <small className="bar-lock-note">({res.status})</small>
                      )}
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${Math.min(100, res.pct).toFixed(1)}%` }}
                      />
                    </div>
                    <div
                      className="bar-val"
                      style={{
                        color: res.pct > 0 ? 'var(--text-main)' : 'var(--text-muted)',
                      }}
                    >
                      {res.pct.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
