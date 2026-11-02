import React, { useState } from 'react';
import { MKW_DATA } from '../data/mkwData';
import type { AvailabilityFilter, PlayerCountOption } from '../types/mkw';
import { ordinal } from '../utils/lotteryEngine';
import { useStickyThead } from '../utils/useStickyThead';

const TOTAL_COOLDOWN_ITEMS = MKW_DATA.items.filter((i) => i.cooldownSeconds > 0).length;
const TOTAL_PERM_ITEMS = MKW_DATA.items.filter((i) => i.isEnablePermission).length;

export const AvailabilityTable: React.FC = () => {
  const [players, setPlayers] = useState<PlayerCountOption>(12);
  const [filter, setFilter] = useState<AvailabilityFilter>('all');
  const [search, setSearch] = useState<string>('');
  const theadRef = useStickyThead<HTMLTableSectionElement>();

  const query = search.trim().toLowerCase();
  const filteredItems = MKW_DATA.items.filter((item) => {
    if (query && !`${item.name} ${item.jpName}`.toLowerCase().includes(query)) {
      return false;
    }
    if (filter.startsWith('phase-')) {
      return item.unlockPhase === Number(filter.slice(6));
    }
    if (filter === 'cooldown') return item.cooldownSeconds > 0;
    if (filter === 'permission') return item.isEnablePermission;
    return true;
  });

  return (
    <section id="section-availability" className="panel-card">
      <div className="panel-header">
        <div className="panel-title-group">
          <div className="section-eyebrow">02 • GLOBAL RACER CAPS &amp; TIMING GATES</div>
          <h2>Item Availability, Pool Caps &amp; Cooldown Timers</h2>
          <p className="panel-desc">
            Maximum simultaneous items that can be held/active in a race, exact opening lockout times when each item
            first becomes available, and global post-use cooldown timers. Hover over any column header for details.
          </p>
        </div>

        <div className="header-controls">
          <div className="control-box">
            <span className="control-label">Availability Lobby Switch</span>
            <div className="segmented-switch" role="group" aria-label="Availability Player Count">
              <button
                type="button"
                className={`seg-btn ${players === 12 ? 'active' : ''}`}
                onClick={() => setPlayers(12)}
              >
                <span className="seg-dot" /> 12 Players
              </button>
              <button
                type="button"
                className={`seg-btn ${players === 24 ? 'active' : ''}`}
                onClick={() => setPlayers(24)}
              >
                <span className="seg-dot" /> 24 Players
              </button>
            </div>
          </div>

          <div className="control-box">
            <label className="control-label" htmlFor="avail-filter-select">
              Filter by Unlock / Rule
            </label>
            <select
              id="avail-filter-select"
              className="sleek-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value as AvailabilityFilter)}
            >
              <option value="all">All 27 Race Items</option>
              <option value="phase-1">Unlocked at 0s (Phase 1)</option>
              <option value="phase-2">Unlocks at 25s (Phase 2)</option>
              <option value="phase-3">Unlocks at 30s (Phase 3)</option>
              <option value="phase-4">Unlocks at 35s (Phase 4)</option>
              <option value="phase-5">Unlocks at 45s (Phase 5)</option>
              <option value="cooldown">Has Global Cooldown (&gt; 0s)</option>
              <option value="permission">Online Server Check Required</option>
            </select>
          </div>

          <div className="control-box">
            <label className="control-label" htmlFor="avail-search-input">
              Quick Search
            </label>
            <input
              type="text"
              id="avail-search-input"
              className="sleek-input"
              placeholder="Search item name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="avail-kpi-strip">
        <div
          className="kpi-box has-tooltip"
          title={`Maximum ${players * 2} total item slots across all ${players} racers in the lobby.`}
        >
          <div className="kpi-label">Active Lobby Mode ⓘ</div>
          <div className="kpi-value">{players} Players</div>
        </div>
        <div
          className="kpi-box has-tooltip"
          title="Elapsed race time milestones when new tiers of items unlock in item boxes."
        >
          <div className="kpi-label">Opening Lockout Tiers ⓘ</div>
          <div className="kpi-value">0s • 25s • 30s • 35s • 45s</div>
        </div>
        <div
          className="kpi-box has-tooltip"
          title="Blooper (30s), Kamek (45s), Spiny Shell (90s), and Lightning (90s) trigger a room-wide cooldown after use."
        >
          <div className="kpi-label">Global Cooldown Items ⓘ</div>
          <div className="kpi-value">{TOTAL_COOLDOWN_ITEMS} Items</div>
        </div>
        <div
          className="kpi-box has-tooltip"
          title="In online matches, the game server verifies and approves these item pulls while your roulette spins so race-wide limits are never exceeded."
        >
          <div className="kpi-label">Online Server Check ⓘ</div>
          <div className="kpi-value">{TOTAL_PERM_ITEMS} Items</div>
        </div>
      </div>

      <div className="table-scroll-container no-scroll-avail">
        <table className="avail-table">
          <thead ref={theadRef}>
            <tr>
              <th className="th-tooltip avail-item-col" title="In-game pullable race item icon and name.">
                <span>Item</span> <span className="info-icon">?</span>
              </th>
              <th
                className="th-tooltip"
                title={`Maximum number of racers who can simultaneously hold this item in a ${players}-player race based on the global racer cap and per-pull count.`}
              >
                <span>Max Held ({players}P)</span> <span className="info-icon">?</span>
              </th>
              <th
                className="th-tooltip"
                title="Maximum total instances of this item allowed active on the track and held by racers at the same time."
              >
                <span>World Racer Cap</span> <span className="info-icon">?</span>
              </th>
              <th
                className="th-tooltip"
                title="Number of individual item pieces or throws spawned from a single item box pull (for example, 3 for Triple items, 8 for Fire/Ice Flower, 12 for Hammer)."
              >
                <span>Racer Pull Count</span> <span className="info-icon">?</span>
              </th>
              <th
                className="th-tooltip"
                title={`Number of placements in a ${players}-player Standard Race that have a greater than 0% chance to roll this item.`}
              >
                <span>Eligible Spots ({players}P)</span> <span className="info-icon">?</span>
              </th>
              <th
                className="th-tooltip"
                title="Race time elapsed from the starting signal before this item unlocks and can appear in item boxes."
              >
                <span>First Available</span> <span className="info-icon">?</span>
              </th>
              <th
                className="th-tooltip"
                title="Wait timer after this item is used before any racer in the room can pull another one."
              >
                <span>Global Cooldown</span> <span className="info-icon">?</span>
              </th>
              <th
                className="th-tooltip"
                title="Maximum duration the item's power-up effect or multi-throw timer stays active after first activation."
              >
                <span>Max Hold / Active Timer</span> <span className="info-icon">?</span>
              </th>
              <th
                className="th-tooltip"
                title="Per-racer duplicate slot rules and whether online matches require game server verification before awarding the item."
              >
                <span>Slot &amp; Online Rules</span> <span className="info-icon">?</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((item) => {
              const maxHolders = players === 12 ? item.maxHolders12P : item.maxHolders24P;
              const maxSlots = players === 12 ? item.maxSlots12P : item.maxSlots24P;
              const eligSpots = players === 12 ? item.eligibleCount12P : item.eligibleCount24P;
              const holderPct = Math.min(100, (maxHolders / players) * 100);
              const eligRangeText = `Pullable in ${ordinal(item.eligibleRanks[0])}–${ordinal(
                item.eligibleRanks[item.eligibleRanks.length - 1]
              )} pool`;

              return (
                <tr key={item.key}>
                  <td className="avail-item-col">
                    <div className="item-cell-inner avail-item-cell" title={item.notes}>
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="matrix-item-icon"
                        loading="lazy"
                      />
                      <div className="matrix-item-names">
                        <div className="matrix-item-en">{item.name}</div>
                        <div className="matrix-item-meta">{item.jpName}</div>
                      </div>
                    </div>
                  </td>

                  <td
                    className="avail-held-col"
                    title={`Up to ${maxHolders} of ${players} racers (${Math.round(
                      holderPct
                    )}%) can hold ${item.name} simultaneously.`}
                  >
                    <div className="holder-meter-wrap">
                      <div className="holder-meter-top">
                        <span className="holder-count-text">
                          {maxHolders} / {players} racers
                        </span>
                        <span className="holder-pct-text">{Math.round(holderPct)}%</span>
                      </div>
                      <div className="holder-bar-track">
                        <div
                          className="holder-bar-fill"
                          style={{ width: `${holderPct.toFixed(1)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td
                    className="mono-cell"
                    title={`Shared pool cap: ${item.worldActorCap} maximum active in race (${item.itemType} pool).`}
                  >
                    <strong>{item.worldActorCap}</strong> max active
                  </td>

                  <td
                    className="mono-cell"
                    title={`Each pull counts as ${item.entryNum} toward the ${item.worldActorCap} cap.`}
                  >
                    {item.entryNum} per pull
                  </td>

                  <td className="mono-cell" title={eligRangeText}>
                    <strong>{eligSpots}</strong> / {players} spots
                  </td>

                  <td
                    title={
                      item.openingLockoutSeconds === 0
                        ? 'Available immediately from the start of the race (0s).'
                        : `Locked out for the first ${item.openingLockoutSeconds} seconds of the race.`
                    }
                  >
                    <span
                      className={`time-pill ${
                        item.openingLockoutSeconds === 0 ? 'instant' : 'delayed'
                      }`}
                    >
                      {item.openingLockoutSeconds}s • Phase {item.unlockPhase}
                    </span>
                  </td>

                  <td
                    className="mono-cell"
                    title={
                      item.cooldownSeconds === 0
                        ? 'No global cooldown after use.'
                        : `After this item is used, no racer can pull another ${item.name} for ${item.cooldownSeconds} seconds.`
                    }
                  >
                    {item.cooldownSeconds === 0 ? (
                      <span style={{ color: 'var(--text-muted)' }}>0s (None)</span>
                    ) : (
                      <span>{item.cooldownSeconds}s</span>
                    )}
                  </td>

                  <td
                    className="mono-cell"
                    title={
                      item.useMaxSeconds
                        ? `Active effect or multi-use timer lasts ${item.useMaxSeconds} seconds.`
                        : 'No time limit while held in inventory; instant effect on use.'
                    }
                  >
                    {item.useMaxSeconds ? `${item.useMaxSeconds}s` : 'Unlimited / Instant'}
                  </td>

                  <td className="avail-rules-col">
                    <div className="avail-rules-inner">
                      {item.canHaveSameItem ? (
                        <span
                          className="rule-tag dup-ok"
                          title="A single racer can hold two of this item in both inventory slots at the same time."
                        >
                          2x Slot OK ({maxSlots} slots)
                        </span>
                      ) : (
                        <span
                          className="rule-tag no-dup"
                          title="Duplicate Slot Prevention: A racer holding this item in Slot 1 cannot roll a second copy in Slot 2."
                        >
                          1 per Racer
                        </span>
                      )}
                      {item.isEnablePermission && (
                        <span
                          className="rule-tag perm"
                          title="Online Server Check: In online matches, the game server verifies and approves the pull while your roulette spins so race-wide item caps and cooldowns are never exceeded."
                        >
                          Online Server Check
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
