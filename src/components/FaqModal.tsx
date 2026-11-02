import React, { useEffect, useState } from 'react';

export interface FaqItem {
  id: string;
  question: string;
  tag: string;
  answer: React.ReactNode;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'what-is-mkworlditemprob',
    tag: 'Project & Decompilation',
    question: 'What is MKWorldItemProb, and how was this data obtained?',
    answer: (
      <>
        <p>
          <strong>MKWorldItemProb</strong> is an interactive item probability matrix, global availability cap reference,
          and real-time scenario calculator for <em>Mario Kart World</em> (<code>v1.8.0</code>).
        </p>
        <p>
          Unlike traditional community charts built from manual item-box sampling, every weight, timing gate, position
          clamp, and cap in this application was extracted directly by <strong>liskadi</strong> through static
          decompilation and reverse engineering of the game&apos;s executable binary (<code>main.elf</code>) and
          parameter archives (<code>general_format.Product_180.sarc.zs</code>).
        </p>
      </>
    ),
  },
  {
    id: 'how-reverse-engineered',
    tag: 'Reverse Engineering',
    question: 'How was Mario Kart World decompiled and reverse engineered for this tool?',
    answer: (
      <>
        <p>
          To reconstruct the exact item roulette logic, <strong>liskadi</strong> decompiled the ARM64 item-slot
          director routines in <code>main.elf</code> and mapped how the game reads its binary parameter tables (
          <code>24KartRace.game__ItemTableGParam.bgyml</code> and{' '}
          <code>RaceCommon.game__ItemSlotDirectorGParam.bgyml</code>).
        </p>
        <p>
          This reverse-engineering work revealed the complete multi-stage decision pipeline: how player placements map into
          item pools in 12-player and 24-player lobbies, how opening race timers clamp placement pools during the first
          30 seconds, when each of the 27 pullable race items unlocks, how distance behind 1st place shifts your pool,
          and how inventory duplicate rules and server checks filter the roulette before a random roll occurs.
        </p>
      </>
    ),
  },
  {
    id: 'weighted-roulette-math',
    tag: 'Lottery Math',
    question: 'How does the game calculate item probabilities from raw weights?',
    answer: (
      <>
        <p>
          Each placement column in an item table assigns integer <strong>weights</strong> (<code>W</code>) to all 27
          pullable race items. When you touch an Item Box, the engine builds your active pool by taking the base weights
          for your effective placement pool and setting <code>W = 0</code> for any item that is currently:
        </p>
        <ul>
          <li>Locked out by the opening race timer (first 25s, 30s, 35s, or 45s)</li>
          <li>Blocked by duplicate slot prevention (already held in your first item slot)</li>
          <li>On an active room-wide post-use cooldown or at its maximum simultaneous race cap</li>
        </ul>
        <p>
          The exact probability of rolling any remaining eligible item is its active weight divided by the sum of all
          active weights in that column: <code>Probability (%) = (W / ΣW) × 100</code>.
        </p>
      </>
    ),
  },
  {
    id: 'five-time-phases-and-clamps',
    tag: 'Phases & Clamps',
    question: 'Why are there 5 Race Time Phases (0s to 45s+), and what do "Clamped" positions mean?',
    answer: (
      <>
        <p>
          <em>Mario Kart World</em> does not activate its full item table immediately when a race starts. Instead, the
          first 45 seconds of every race progress through <strong>5 time phases</strong> controlled by two mechanisms:
          per-item opening lockout timers and opening placement clamps:
        </p>
        <ul>
          <li>
            <strong>Phase 1 (0s – 25s):</strong> Only 11 basic items are unlocked (16 high-impact items are locked out).
            In addition, opening position clamps force <code>1st</code> place to pull from <code>4th</code> place&apos;s
            item pool, <code>2nd–5th</code> to pull from <code>5th</code>, and <code>7th+</code> to pull from{' '}
            <code>7th</code> so the opening pack isn&apos;t immediately flooded with power items.
          </li>
          <li>
            <strong>Phase 2 (25s – 30s):</strong> Front and mid-pack clamps expire (<code>1st–7th</code> pull normally)
            and 9 mid-tier items unlock, while <code>8th+</code> remains clamped to <code>7th</code> place&apos;s pool
            for 5 more seconds.
          </li>
          <li>
            <strong>Phase 3 (30s – 35s):</strong> All position clamps expire so every placement pulls its true pool, and
            Super Horn, Blooper, Kamek, and Bullet Bill unlock.
          </li>
          <li>
            <strong>Phase 4 (35s – 45s):</strong> Golden Mushroom and Spiny Shell (Blue Shell) unlock.
          </li>
          <li>
            <strong>Phase 5 (45s+):</strong> Lightning unlocks, making all 27 race items and all placement pools 100%
            active.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'lobby-size-12p-vs-24p',
    tag: '12P vs. 24P Lobbies',
    question: 'How do 24-Player lobbies map into the 12 item probability pools?',
    answer: (
      <>
        <p>
          Internally, each item probability table defines <strong>12 placement pools</strong> (<code>1st</code> through{' '}
          <code>12th</code>). In a 12-player race, each placement maps 1-to-1 to its matching pool.
        </p>
        <p>
          In a 24-player race, the game uses a decompiled rank-conversion lookup table (<code>rankConvTable</code>) that
          groups the 24 placements into those 12 pools: <code>1st → 1st</code>, <code>2nd → 2nd</code>,{' '}
          <code>3rd → 3rd</code>, <code>4th–5th → 4th</code>, <code>6th–7th → 5th</code>, <code>8th–10th → 6th</code>,{' '}
          <code>11th–13th → 7th</code>, <code>14th–16th → 8th</code>, <code>17th–19th → 9th</code>,{' '}
          <code>20th–21st → 10th</code>, <code>22nd–23rd → 11th</code>, and <code>24th → 12th</code>. You can view
          24-player probabilities either across all 24 individual placements or condensed into the 12 grouped tiers.
        </p>
      </>
    ),
  },
  {
    id: 'table-sources',
    tag: 'Item Tables',
    question: 'What is the difference between "Standard Race" and "CPU/AI Racers"?',
    answer: (
      <>
        <p>
          <strong>Standard Race</strong> (<code>ItemTableStandard</code>) is the primary probability table used by human
          players in Grand Prix, VS Race, and Online Race modes.
        </p>
        <p>
          <strong>CPU/AI Racers</strong> (<code>ItemTableSimpleCom</code>) is a dedicated table used exclusively by
          computer-controlled (COM) opponents. It adjusts the weights of several disruptive and comeback items so AI
          racers behave consistently across single-player and mixed lobbies.
        </p>
      </>
    ),
  },
  {
    id: 'caps-cooldowns-server-check',
    tag: 'Caps & Server Rules',
    question: 'What do "World Racer Cap", "Global Cooldown", and "Online Server Check" mean?',
    answer: (
      <>
        <ul>
          <li>
            <strong>World Racer Cap &amp; Max Held:</strong> Each item type has a maximum limit on how many instances
            can exist on the course and in racer inventories at the same time (for example, at most 1 Spiny Shell, 1
            Blooper, 1 Kamek, or 3 Bullet Bills/Lightnings). Multi-piece items like Triple Shells (<code>3</code> per
            pull) or Fire/Ice Flowers (<code>8</code> per pull) deduct their piece count from the shared cap.
          </li>
          <li>
            <strong>Global Cooldown:</strong> Four items trigger a room-wide cooldown timer after use during which no
            racer can roll another copy: <strong>Blooper (30s)</strong>, <strong>Kamek (45s)</strong>,{' '}
            <strong>Spiny Shell (90s)</strong>, and <strong>Lightning (90s)</strong>.
          </li>
          <li>
            <strong>Online Server Check:</strong> In online matches, restricted items marked with{' '}
            <code>Online Server Check</code> require real-time verification from the game server while your item
            roulette spins to guarantee that global caps and cooldowns are never exceeded across the room.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'double-item-box-odds',
    tag: 'Calculator & Slot 2',
    question: 'How does the Double Item Box (≥1) probability calculation work?',
    answer: (
      <>
        <p>
          In <em>Mario Kart World</em>, the <strong>Single Mushroom</strong> is the only pullable race item that a
          racer is allowed to hold in both inventory slots at the same time. For all other 26 items, holding the item in
          Slot 1 forces its weight to <code>0</code> when rolling for Slot 2.
        </p>
        <p>
          When you hit a <strong>Double Item Box</strong> with two empty slots, your second slot&apos;s probability
          distribution dynamically shifts based on whichever item landed in Slot 1. The calculator in Section 03
          evaluates all 27 possible Slot 1 outcomes and computes the exact conditional probability of pulling at least
          one copy of your target item across both slots.
        </p>
      </>
    ),
  },
];

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FaqModal: React.FC<FaqModalProps> = ({ isOpen, onClose }) => {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'what-is-mkworlditemprob': true,
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    setOpenIds(Object.fromEntries(FAQ_ITEMS.map((it) => [it.id, true])));
  };

  const collapseAll = () => setOpenIds({});

  return (
    <div
      className="faq-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="faq-modal-title"
      onClick={onClose}
    >
      <div className="faq-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="faq-modal-header">
          <div className="faq-modal-title-group">
            <div className="section-eyebrow">REVERSE ENGINEERING &amp; METHODOLOGY FAQ</div>
            <h2 id="faq-modal-title">Frequently Asked Questions</h2>
            <p className="faq-modal-subtitle">
              How <strong>MKWorldItemProb</strong> works and how <em>Mario Kart World</em> (<code>v1.8.0</code>) was
              decompiled by <strong>liskadi</strong>.
            </p>
          </div>

          <div className="faq-modal-actions">
            <button type="button" className="faq-action-btn" onClick={expandAll}>
              Expand All
            </button>
            <button type="button" className="faq-action-btn" onClick={collapseAll}>
              Collapse All
            </button>
            <button
              type="button"
              className="faq-close-btn"
              onClick={onClose}
              aria-label="Close FAQ Modal"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="faq-accordion-list">
          {FAQ_ITEMS.map((item, idx) => {
            const isExpanded = !!openIds[item.id];
            return (
              <div
                key={item.id}
                className={`faq-accordion-item ${isExpanded ? 'is-open' : ''}`}
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  aria-expanded={isExpanded}
                  onClick={() => toggleItem(item.id)}
                >
                  <span className="faq-q-index">Q{idx + 1}</span>
                  <span className="faq-q-text">{item.question}</span>
                  <span className="faq-q-tag">{item.tag}</span>
                  <span className="faq-chevron" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>

                <div className="faq-answer-wrapper" aria-hidden={!isExpanded}>
                  <div className="faq-answer-inner">
                    <div className="faq-answer-content">{item.answer}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="faq-modal-footer">
          <button type="button" className="faq-done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
