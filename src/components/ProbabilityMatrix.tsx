import React, { useMemo, useState } from 'react';
import { ITEMS_BY_KEY, MKW_DATA } from '../data/mkwData';
import type {
  Matrix24Layout,
  MatrixDisplayMode,
  PlayerCountOption,
  TableId,
} from '../types/mkw';
import {
  computeColumnDistribution,
  getColumnsForMatrix,
  getHeatmapBg,
  ordinal,
} from '../utils/lotteryEngine';
import { useStickyThead } from '../utils/useStickyThead';

export interface MatrixCellSelection {
  itemKey: string;
  placement: number;
  lobbySize: PlayerCountOption;
  seconds: number;
  tableId: TableId;
}

interface ProbabilityMatrixProps {
  onSelectCell: (selection: MatrixCellSelection) => void;
  onPhaseChangeSync?: (repSeconds: number) => void;
}

const TABLE_SOURCE_TOOLTIP =
  'Standard Race: The primary item probability table used by human players in Grand Prix, VS Race, and Online Race modes.\nCPU/AI Racers: The dedicated item probability table used by computer-controlled (COM) opponents.';

const PODIUM_CLASSES: Record<number, string> = {
  1: 'podium-1',
  2: 'podium-2',
  3: 'podium-3',
};

export const ProbabilityMatrix: React.FC<ProbabilityMatrixProps> = ({
  onSelectCell,
  onPhaseChangeSync,
}) => {
  const [players, setPlayers] = useState<PlayerCountOption>(12);
  const [layout24, setLayout24] = useState<Matrix24Layout>('expanded');
  const [phaseId, setPhaseId] = useState<number>(5);
  const [tableId, setTableId] = useState<TableId>('ItemTableStandard');
  const [displayMode, setDisplayMode] = useState<MatrixDisplayMode>('pct');
  const [hideZero, setHideZero] = useState<boolean>(false);
  const theadRef = useStickyThead<HTMLTableSectionElement>();

  const activePhase = MKW_DATA.phases[phaseId - 1];
  const cols = getColumnsForMatrix(players, layout24);
  const is12ColMode = cols.length <= 12;

  const colDistributions = useMemo(
    () =>
      cols.map((col) =>
        computeColumnDistribution({
          placement: col.repPlacement,
          lobbySize: players,
          seconds: activePhase.repSeconds,
          tableId,
        })
      ),
    [players, layout24, activePhase.repSeconds, tableId]
  );

  const lockedCountInPhase = MKW_DATA.items.filter(
    (item) => item.openingLockoutSeconds > activePhase.repSeconds
  ).length;

  const handlePhaseClick = (id: number) => {
    setPhaseId(id);
    onPhaseChangeSync?.(MKW_DATA.phases[id - 1].repSeconds);
  };

  return (
    <section id="section-matrix" className="panel-card">
      <div className="panel-header matrix-header-row">
        <div className="panel-title-group">
          <div className="section-eyebrow">01 • DECOMPILED ITEM BOX ENGINE</div>
          <h2>Interactive Item Probability Table</h2>
          <p className="panel-desc">
            Switch between <strong>12 Players</strong> and <strong>24 Players</strong> and scrub across the{' '}
            <strong>5 Opening-to-Normal Race Phases</strong>. Click any cell to inspect it in the Probability
            Calculator below.
          </p>
        </div>

        <div className="matrix-header-controls">
          <div className="controls-top-row">
            <div className="control-box">
              <span className="control-label">Lobby Size</span>
              <div className="segmented-switch" role="group" aria-label="Matrix Player Count">
                <button
                  type="button"
                  className={`seg-btn ${players === 12 ? 'active' : ''}`}
                  onClick={() => setPlayers(12)}
                >
                  <span className="seg-dot" /> 12 Players <small>(1st–12th)</small>
                </button>
                <button
                  type="button"
                  className={`seg-btn ${players === 24 ? 'active' : ''}`}
                  onClick={() => setPlayers(24)}
                >
                  <span className="seg-dot" /> 24 Players <small>(1st–24th)</small>
                </button>
              </div>
            </div>

            <div className="control-box">
              <label
                className="control-label th-tooltip"
                htmlFor="matrix-table-select"
                title={TABLE_SOURCE_TOOLTIP}
              >
                <span>Item Table Source</span> <span className="info-icon">?</span>
              </label>
              <select
                id="matrix-table-select"
                className="sleek-select"
                title={TABLE_SOURCE_TOOLTIP}
                value={tableId}
                onChange={(e) => setTableId(e.target.value as TableId)}
              >
                {MKW_DATA.tablesMeta.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            className={`control-box layout-24p-box ${players === 12 ? 'is-disabled' : ''}`}
            title={
              players === 12
                ? 'Switch Lobby Size to 24 Players to toggle between 24 individual columns and 12 grouped tiers'
                : 'Choose how the 24 placements are displayed'
            }
          >
            <span className="control-label">24P Column Layout</span>
            <div className="segmented-switch">
              <button
                type="button"
                disabled={players === 12}
                className={`seg-btn ${layout24 === 'expanded' ? 'active' : ''}`}
                onClick={() => setLayout24('expanded')}
              >
                All 24 Columns
              </button>
              <button
                type="button"
                disabled={players === 12}
                className={`seg-btn ${layout24 === 'grouped' ? 'active' : ''}`}
                onClick={() => setLayout24('grouped')}
              >
                12 Grouped Tiers
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="phase-selector-container">
        <div className="phase-bar-header">
          <div className="phase-bar-title">
            <span className="pulse-indicator" />
            <span>
              Race Time Phase Switch <small>(Seconds Elapsed from Race Start)</small>
            </span>
          </div>
          <div className="matrix-sub-toggles">
            <div className="segmented-switch compact">
              <button
                type="button"
                className={`seg-btn ${displayMode === 'pct' ? 'active' : ''}`}
                onClick={() => setDisplayMode('pct')}
              >
                % Only
              </button>
              <button
                type="button"
                className={`seg-btn ${displayMode === 'both' ? 'active' : ''}`}
                onClick={() => setDisplayMode('both')}
              >
                % + Weight
              </button>
              <button
                type="button"
                className={`seg-btn ${displayMode === 'weight' ? 'active' : ''}`}
                onClick={() => setDisplayMode('weight')}
              >
                Weight (W)
              </button>
            </div>

            <label
              className={`checkbox-pill ${lockedCountInPhase === 0 ? 'pill-muted' : ''}`}
              title={
                lockedCountInPhase === 0
                  ? 'All 27 items are unlocked in Phase 5 (45s+). Switch to Phases 1–4 (0s–45s) to see time-locked rows hidden.'
                  : `Hides the ${lockedCountInPhase} items that are locked out during Phase ${activePhase.id}.`
              }
            >
              <input
                type="checkbox"
                checked={hideZero}
                onChange={(e) => setHideZero(e.target.checked)}
              />
              <span>
                Hide Time-Locked Items{' '}
                <small style={{ color: 'var(--text-muted)' }}>({lockedCountInPhase} locked)</small>
              </span>
            </label>
          </div>
        </div>

        <div className="phase-tabs" role="tablist">
          {MKW_DATA.phases.map((ph) => (
            <button
              key={ph.id}
              type="button"
              className={`phase-tab-btn ${ph.id === phaseId ? 'active' : ''}`}
              onClick={() => handlePhaseClick(ph.id)}
            >
              <div className="phase-tab-top">
                <span className="phase-num-badge">PHASE {ph.id}</span>
                <span className="phase-pool-count">{ph.unlockedCount}/27 Items</span>
              </div>
              <div className="phase-tab-time">{ph.timeRange}</div>
              <div className="phase-tab-frames">{ph.subtitle}</div>
            </button>
          ))}
        </div>

        <div className="phase-telemetry-banner">
          <div className="telemetry-left">
            <div className="telemetry-headline">
              <span>{activePhase.name}</span>
              <span className="clamp-pill">{activePhase.clampSummary}</span>
            </div>
            <div className="telemetry-desc">{activePhase.description}</div>
          </div>

          <div className="telemetry-unlocks">
            <span className="telemetry-unlocks-label">
              {activePhase.id === 1 ? 'Initial Pool (0s):' : `Unlocked at ${activePhase.repSeconds}s:`}
            </span>
            {activePhase.newlyUnlocked.map((key) => {
              const item = ITEMS_BY_KEY[key];
              return (
                <span
                  key={key}
                  className="unlock-chip"
                  title={`${item.name} unlocks in Phase ${activePhase.id}`}
                >
                  <img src={item.icon} alt={item.name} />
                  {item.name}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`table-scroll-container ${is12ColMode ? 'no-scroll-12p' : ''}`}>
        <table className={`prob-matrix-table ${is12ColMode ? 'is-12-col' : 'is-24-col'}`}>
          <thead ref={theadRef}>
            <tr>
              <th className="sticky-col">
                Item ({players}P • Phase {activePhase.id})
              </th>
              {cols.map((col, cIdx) => {
                const { rankInfo } = colDistributions[cIdx];
                const posPoolLabel = rankInfo.isClamped
                  ? `${ordinal(rankInfo.finalRank)} (Clamped)`
                  : ordinal(rankInfo.finalRank);
                return (
                  <th
                    key={col.label}
                    className={PODIUM_CLASSES[col.repPlacement] ?? ''}
                    title={`${col.label} pulls from ${posPoolLabel} item pool`}
                  >
                    <div className="col-pos-label">{col.label}</div>
                    <div className={`col-rank-sub ${rankInfo.isClamped ? 'is-clamped' : ''}`}>
                      {posPoolLabel}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {MKW_DATA.items.map((item) => {
              const { key } = item;
              const isLockedInPhase = item.openingLockoutSeconds > activePhase.repSeconds;
              const isNewlyUnlocked =
                activePhase.id > 1 && activePhase.newlyUnlocked.includes(key);

              if (hideZero && colDistributions.every((d) => d.items[key].pct <= 0)) {
                return null;
              }

              return (
                <tr key={key} className={isLockedInPhase ? 'row-locked' : ''}>
                  <td className="sticky-col">
                    <div className="item-cell-inner">
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="matrix-item-icon"
                        loading="lazy"
                      />
                      <div className="matrix-item-names">
                        <div className="matrix-item-en">
                          <span className="matrix-item-title-text">{item.name}</span>
                        </div>
                        <div className="matrix-item-meta">{item.jpName}</div>
                      </div>
                      {isLockedInPhase && (
                        <span className="badge-locked">&lt; {item.openingLockoutSeconds}s</span>
                      )}
                      {!isLockedInPhase && isNewlyUnlocked && (
                        <span className="badge-new-unlock">+{item.openingLockoutSeconds}s</span>
                      )}
                    </div>
                  </td>

                  {cols.map((col, cIdx) => {
                    const dist = colDistributions[cIdx];
                    const { pct, effectiveWeight: w, rawWeight: rawW } = dist.items[key];

                    const handleCellClick = () =>
                      onSelectCell({
                        itemKey: key,
                        placement: col.repPlacement,
                        lobbySize: players,
                        seconds: activePhase.repSeconds,
                        tableId,
                      });

                    if (w <= 0) {
                      const lockHint =
                        isLockedInPhase && rawW > 0
                          ? `${item.name} at ${col.label}: Locked until ${item.openingLockoutSeconds}s (Base weight: ${rawW})`
                          : `${item.name} at ${col.label}: 0%`;
                      return (
                        <td
                          key={col.label}
                          className="prob-cell zero-cell"
                          title={lockHint}
                          onClick={handleCellClick}
                        >
                          <div className="prob-cell-content">—</div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={col.label}
                        className="prob-cell"
                        style={{ background: getHeatmapBg(pct) }}
                        title={`Click to inspect in Calculator: ${item.name} at ${col.label} = ${pct.toFixed(
                          2
                        )}% (Weight ${w} / ${dist.totalWeight})`}
                        onClick={handleCellClick}
                      >
                        <div className="prob-cell-content">
                          {displayMode === 'pct' && (
                            <span className="prob-val-pct">{pct.toFixed(2)}%</span>
                          )}
                          {displayMode === 'both' && (
                            <>
                              <span className="prob-val-pct">{pct.toFixed(2)}%</span>
                              <span className="prob-val-w">
                                ({w}/{dist.totalWeight})
                              </span>
                            </>
                          )}
                          {displayMode === 'weight' && (
                            <>
                              <span className="prob-val-pct">{w}</span>
                              <span className="prob-val-w">/ {dist.totalWeight}</span>
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr>
              <td className="sticky-col">Total Column Weight (ΣW)</td>
              {colDistributions.map((dist, idx) => (
                <td key={cols[idx].label}>
                  100% <span style={{ color: 'var(--text-muted)' }}>({dist.totalWeight})</span>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="matrix-legend">
        <div className="legend-item">
          <span className="legend-swatch swatch-clamped" />
          <span>
            <strong>Clamped Pool:</strong> Opening 25s–30s position override
          </span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch swatch-newly-unlocked" />
          <span>
            <strong>Newly Unlocked:</strong> Unlocks at this phase&apos;s time threshold
          </span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch swatch-locked" />
          <span>
            <strong>Locked Out (—):</strong> Unavailable until unlock time
          </span>
        </div>
      </div>
    </section>
  );
};
