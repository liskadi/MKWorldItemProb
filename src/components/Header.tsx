import React, { useState } from 'react';
import { MKW_DATA } from '../data/mkwData';

const NAV_ITEMS = [
  { id: 'section-matrix', num: '01', label: 'Probability Matrix' },
  { id: 'section-availability', num: '02', label: 'Item Availability' },
  { id: 'section-calculator', num: '03', label: 'Probability Calculator' },
];

export const Header: React.FC = () => {
  const [activeNav, setActiveNav] = useState('section-matrix');

  return (
    <header className="top-header">
      <div className="container header-inner">
        <div className="brand">
          <div className="brand-icon-wrap" aria-hidden="true">
            <img
              src="./assets/Star.png"
              alt="Super Star"
              className="brand-icon"
              draggable={false}
            />
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <h1>
                MKWorld<span className="accent-gradient">ItemProb</span>
              </h1>
              <span className="brand-author">
                by{' '}
                <a
                  href="https://mkcentral.com/en-us/registry/players/profile?id=44345"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brand-author-name"
                  title="liskadi's MKCentral Profile"
                >
                  liskadi
                </a>
              </span>
              <span className="version-pill">{MKW_DATA.gameVersion}</span>
            </div>
            <p className="brand-subtitle">
              Mario Kart World Decompiled Item Probability Matrix, Availability Caps &amp; Calculator
            </p>
          </div>
        </div>

        <nav className="section-nav" aria-label="Section Navigation">
          {NAV_ITEMS.map((nav) => (
            <a
              key={nav.id}
              href={`#${nav.id}`}
              className={`nav-pill ${activeNav === nav.id ? 'active' : ''}`}
              onClick={() => setActiveNav(nav.id)}
            >
              <span className="nav-num">{nav.num}</span> {nav.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};
