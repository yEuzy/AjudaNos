import { useState, useEffect } from 'react';
import './index.css';

const DropletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-droplet"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);

interface WaterTrackerProps {
  currentUser: 'Kallew' | 'Maria';
}

interface WaterData {
  Kallew: number;
  Maria: number;
  lastUpdate: string;
}

const WATER_GOAL = 2500; // 2.5L em ml

export default function WaterTracker({ currentUser }: WaterTrackerProps) {
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [waterData, setWaterData] = useState<WaterData>(() => {
    const saved = localStorage.getItem('ajudanos_water');
    const today = getTodayStr();
    
    if (saved) {
      const parsed: WaterData = JSON.parse(saved);
      // Se virou o dia, reseta para 0
      if (parsed.lastUpdate !== today) {
        return { Kallew: 0, Maria: 0, lastUpdate: today };
      }
      return parsed;
    }
    return { Kallew: 0, Maria: 0, lastUpdate: today };
  });

  // Atualiza LocalStorage sempre que o State mudar
  useEffect(() => {
    localStorage.setItem('ajudanos_water', JSON.stringify(waterData));
  }, [waterData]);

  const addWater = (amount: number) => {
    setWaterData(prev => ({
      ...prev,
      [currentUser]: Math.min(prev[currentUser] + amount, WATER_GOAL),
      lastUpdate: getTodayStr()
    }));
  };

  const partner = currentUser === 'Kallew' ? 'Maria' : 'Kallew';
  
  const myProgress = Math.min((waterData[currentUser] / WATER_GOAL) * 100, 100);
  const partnerProgress = Math.min((waterData[partner] / WATER_GOAL) * 100, 100);

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-top">
          <div>
            <h1>Metas de Água</h1>
            <p>Hidratação Diária (2.5L)</p>
          </div>
          <div className="avatar-placeholder">
            <DropletIcon />
          </div>
        </div>
      </header>

      {/* MEU PROGRESSO (Accent Card) */}
      <div className="accent-card">
        <div className="vertical-widget">
          <div className="widget-avatar active"><UserIcon /></div>
        </div>
        
        <h2>Meu Progresso ({currentUser})</h2>
        <div className="value" style={{ fontSize: "2rem", marginBottom: "8px" }}>
          {waterData[currentUser]}<span style={{ fontSize: "1rem", opacity: 0.8 }}> / {WATER_GOAL}ml</span>
        </div>
        
        <div className="pill-bar-container" style={{ background: "rgba(44, 41, 79, 0.2)", boxShadow: "none", height: "16px", marginBottom: "24px" }}>
          <div className="pill-bar-fill" style={{ width: `${myProgress}%`, background: "var(--bg-dark-element)", height: "8px" }}></div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="dark-btn" 
            onClick={() => addWater(250)}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <PlusIcon /> 250ml
          </button>
          <button 
            className="dark-btn" 
            onClick={() => addWater(500)}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <PlusIcon /> 500ml
          </button>
        </div>
      </div>

      <main className="main-content">
        <div className="section-title">
          <span>PROGRESSO DE {partner.toUpperCase()}</span>
        </div>

        {/* PROGRESSO DO PARCEIRO */}
        <div className="main-card">
          <div className="list-item" style={{ borderBottom: 'none', padding: 0 }}>
            <div className="item-left">
              <div className="item-icon" style={{ color: currentUser === 'Kallew' ? '#ff9a9e' : 'var(--accent)' }}>
                <UserIcon />
              </div>
              <div className="item-info">
                <h3 style={{ fontSize: '1.2rem' }}>{waterData[partner]}ml</h3>
                <p>Meta: {WATER_GOAL}ml</p>
              </div>
            </div>
            <div className="item-right">
              <div className="item-badge">{Math.round(partnerProgress)}%</div>
            </div>
          </div>
          
          <div className="pill-bar-container" style={{ marginTop: '16px' }}>
            <div className="pill-bar-fill" style={{ width: `${partnerProgress}%` }}></div>
          </div>
        </div>
        
        <div className="status-card" style={{ marginTop: '24px', opacity: 0.8 }}>
          <DropletIcon />
          <p>Lembre-se: Como os celulares não estão na nuvem ainda, os dados do parceiro não atualizarão magicamente.</p>
        </div>
      </main>
    </div>
  );
}
