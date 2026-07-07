import { useState } from 'react';
import BusTracker from './BusTracker';
import EscalaMedica from './EscalaMedica';
import WaterTracker from './WaterTracker';
import NfcTracker from './NfcTracker';
import Login from './Login';
import './index.css';

// SVG Icons para a Navbar
const LayoutDashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);

const HeartPulseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 13h2l2 3 3-8 2 3h3"/></svg>
);

const DropletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
);

const NfcIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H6z"/><path d="M12 18h.01"/><path d="M8 12a4 4 0 0 1 8 0"/><path d="M10 10.5a2.5 2.5 0 0 1 4 0"/></svg>
);

type UserType = 'Kallew' | 'Maria' | null;

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserType>(() => {
    return localStorage.getItem('ajudanos_user') as UserType;
  });
  
  const [activeScreen, setActiveScreen] = useState<'bus' | 'escala' | 'water' | 'nfc'>('water');

  const handleLogin = (user: 'Kallew' | 'Maria') => {
    localStorage.setItem('ajudanos_user', user);
    setCurrentUser(user);
    setActiveScreen('water');
  };

  // Se não tem usuário logado, mostra o Login (que ocupa a tela toda sem Navbar)
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <nav className="main-navbar">
        <button 
          className={`nav-btn ${activeScreen === 'bus' ? 'active' : ''}`}
          onClick={() => setActiveScreen('bus')}
        >
          <LayoutDashboardIcon />
          Ônibus
        </button>
        
        <button 
          className={`nav-btn ${activeScreen === 'water' ? 'active' : ''}`}
          onClick={() => setActiveScreen('water')}
        >
          <DropletIcon />
          Água
        </button>

        <button 
          className={`nav-btn ${activeScreen === 'escala' ? 'active' : ''}`}
          onClick={() => setActiveScreen('escala')}
        >
          <HeartPulseIcon />
          Escala
        </button>

        <button 
          className={`nav-btn ${activeScreen === 'nfc' ? 'active' : ''}`}
          onClick={() => setActiveScreen('nfc')}
        >
          <NfcIcon />
          NFC
        </button>
      </nav>

      {activeScreen === 'bus' && <BusTracker />}
      {activeScreen === 'water' && <WaterTracker currentUser={currentUser} />}
      {activeScreen === 'escala' && <EscalaMedica />}
      {activeScreen === 'nfc' && <NfcTracker />}
    </>
  );
}
