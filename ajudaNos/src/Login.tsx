import { useState, useEffect } from 'react';
import './index.css';

// SVGs
const UserFemaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2c0 2.2 1.8 4 4 4s4-1.8 4-4V6a4 4 0 0 0-4-4Z"/><path d="M22 22v-2a4 4 0 0 0-4-4h-2a2 2 0 0 1-2-2 3 3 0 0 0-6 0 2 2 0 0 1-2 2H4a4 4 0 0 0-4 4v2"/></svg>
);

const ScanNfcIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
    <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
    <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <line x1="7" x2="17" y1="12" y2="12"/>
  </svg>
);

interface LoginProps {
  onLogin: (user: 'Kallew' | 'Maria') => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [nfcStatus, setNfcStatus] = useState<string>('Tocar para escanear tag NFC');
  const [isScanning, setIsScanning] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('NDEFReader' in window)) {
      setSupported(false);
      setNfcStatus('NFC não suportado');
    }
  }, []);

  const handleNfcLogin = async () => {
    if (!('NDEFReader' in window)) return;
    try {
      setNfcStatus('Iniciando...');
      // @ts-ignore
      const ndef = new window.NDEFReader();
      await ndef.scan();
      setIsScanning(true);
      setNfcStatus('Aproxime sua Tag...');
      
      ndef.onreading = (event: any) => {
        const { serialNumber } = event;
        if (serialNumber === '92:22:9e:dd') {
          setNfcStatus('Sucesso!');
          onLogin('Kallew');
        } else {
          setNfcStatus(`Tag inválida: ${serialNumber}`);
          setIsScanning(false);
        }
      };

      ndef.onreadingerror = () => {
        setNfcStatus('Erro de leitura.');
        setIsScanning(false);
      };

    } catch (error: any) {
      setIsScanning(false);
      setNfcStatus(`Erro: ${error.message}`);
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', padding: '0 24px', paddingBottom: '0' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Bem-vindo</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Faça o login para continuar</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Login Kallew via NFC */}
        <button 
          className="main-card" 
          onClick={handleNfcLogin}
          disabled={!supported || isScanning}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '24px', 
            margin: '0', 
            border: 'none', 
            color: 'var(--text-main)', 
            cursor: supported && !isScanning ? 'pointer' : 'default',
            textAlign: 'left',
            userSelect: 'none',
            transition: 'transform 0.2s',
            opacity: supported ? 1 : 0.6
          }}
          onPointerDown={(e) => { if(supported && !isScanning) e.currentTarget.style.transform = 'scale(0.95)' }}
          onPointerUp={(e) => { if(supported && !isScanning) e.currentTarget.style.transform = 'scale(1)' }}
          onPointerLeave={(e) => { if(supported && !isScanning) e.currentTarget.style.transform = 'scale(1)' }}
        >
          <div className="item-icon" style={{ width: '64px', height: '64px', color: 'var(--accent)' }}>
            {isScanning ? (
                <div className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: 'var(--accent)', width: '24px', height: '24px' }}></div>
            ) : (
                <ScanNfcIcon />
            )}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Kallew</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{nfcStatus}</p>
          </div>
        </button>

        {/* Login Maria */}
        <button 
          className="main-card" 
          onClick={() => onLogin('Maria')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '24px', 
            margin: '0', 
            border: 'none', 
            color: 'var(--text-main)', 
            cursor: 'pointer',
            textAlign: 'left',
            userSelect: 'none',
            transition: 'transform 0.2s',
          }}
          onPointerDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onPointerUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onPointerLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div className="item-icon" style={{ width: '64px', height: '64px', color: '#ff9a9e' }}>
            <UserFemaleIcon />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Maria</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Acesso Manual</p>
          </div>
        </button>
      </div>

    </div>
  );
}
