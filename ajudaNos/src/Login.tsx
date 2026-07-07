import { useState, useEffect, useCallback } from 'react';
import './index.css';

const ScanNfcIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  const [status, setStatus] = useState<string>('Iniciando sistema NFC...');
  const [isScanning, setIsScanning] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [supported, setSupported] = useState(true);

  const startNfcScan = useCallback(async () => {
    if (!('NDEFReader' in window)) {
      setSupported(false);
      setStatus('NFC não suportado neste dispositivo (recomendado: Chrome no Android).');
      return;
    }
    
    try {
      // @ts-ignore
      const ndef = new window.NDEFReader();
      await ndef.scan();
      setIsScanning(true);
      setNeedsGesture(false);
      setStatus('Aproxime seu cartão ou tag na traseira do aparelho.');
      
      ndef.onreading = (event: any) => {
        const { serialNumber } = event;
        // Dependendo da NFC faz login em contas diferentes
        if (serialNumber === '92:22:9e:dd') {
          setStatus('Autenticado com sucesso! Bem-vindo(a), Kallew.');
          setTimeout(() => onLogin('Kallew'), 1000);
        } else if (serialNumber === 'd2:5f:04:ed') {
          // Id para Maria
          setStatus('Autenticado com sucesso! Bem-vindo(a), Maria.');
          setTimeout(() => onLogin('Maria'), 1000);
        } else {
          setStatus(`Acesso Negado (Tag ID: ${serialNumber})`);
        }
      };

      ndef.onreadingerror = () => {
        setStatus('Erro na leitura do cartão. Tente novamente.');
      };

    } catch (error: any) {
      setIsScanning(false);
      // O navegador bloqueia o auto-start de funções que precisam de hardware/permissão se o usuário não interagiu com a tela primeiro.
      if (error.name === 'NotAllowedError') {
        setNeedsGesture(true);
        setStatus('Toque em qualquer lugar da tela para ativar o leitor NFC.');
      } else {
        setStatus(`Erro: ${error.message}`);
      }
    }
  }, [onLogin]);

  useEffect(() => {
    startNfcScan();
  }, [startNfcScan]);

  return (
    <div 
      className="app-container" 
      onClick={needsGesture ? startNfcScan : undefined}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh', 
        padding: '0 24px', 
        paddingBottom: '0',
        cursor: needsGesture ? 'pointer' : 'default',
        userSelect: 'none'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '8px', letterSpacing: '1px' }}>AjudaNós</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Login Automático via NFC</p>
      </div>

      <div className="main-card" style={{ width: '100%', textAlign: 'center', padding: '48px 24px', margin: '0' }}>
        <div style={{ color: 'var(--accent)', marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          {isScanning ? (
              <div style={{ position: 'relative' }}>
                <ScanNfcIcon />
                <div className="spinner" style={{ position: 'absolute', top: '-10px', right: '-10px', width: '20px', height: '20px', borderColor: 'rgba(0,0,0,0.1)', borderTopColor: 'var(--accent)' }}></div>
              </div>
          ) : (
              <div style={{ opacity: supported ? 1 : 0.3 }}>
                <ScanNfcIcon />
              </div>
          )}
        </div>
        
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>
          {needsGesture ? 'Ação Necessária' : (isScanning ? 'Aguardando Tag...' : 'Status')}
        </h2>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
          {status}
        </p>
      </div>

    </div>
  );
}
