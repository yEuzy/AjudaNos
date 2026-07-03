import { useState } from 'react';
import BusTracker from './BusTracker';
import EscalaMedica from './EscalaMedica';
import './index.css';

// SVG Icons para a Navbar
const LayoutDashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);

const HeartPulseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 13h2l2 3 3-8 2 3h3"/></svg>
);

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'bus' | 'escala'>('bus');

  return (
    <>
      <nav className="main-navbar">
        <button 
          className={`nav-btn ${activeScreen === 'bus' ? 'active' : ''}`}
          onClick={() => setActiveScreen('bus')}
        >
          <LayoutDashboardIcon />
          Bus Tracker
        </button>
        <button 
          className={`nav-btn ${activeScreen === 'escala' ? 'active' : ''}`}
          onClick={() => setActiveScreen('escala')}
        >
          <HeartPulseIcon />
          Escala Médica
        </button>
      </nav>

      {activeScreen === 'bus' ? <BusTracker /> : <EscalaMedica />}
    </>
  );
}
