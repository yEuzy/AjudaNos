import { useState, useEffect } from 'react';

export const ScanLineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
    <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
    <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <line x1="7" x2="17" y1="12" y2="12"/>
  </svg>
);

export default function NfcTracker() {
  const [status, setStatus] = useState<string>('Aguardando aproximação...');
  const [tagData, setTagData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('NDEFReader' in window)) {
      setSupported(false);
      setStatus('NFC não suportado neste dispositivo ou navegador (recomendado: Chrome no Android).');
    }
  }, []);

  const handleScan = async () => {
    if (!('NDEFReader' in window)) return;
    try {
      setStatus('Iniciando leitura...');
      // @ts-ignore
      const ndef = new window.NDEFReader();
      await ndef.scan();
      setIsScanning(true);
      setStatus('Aproxime uma tag NFC (Cartão, Bilhete, etc.) na parte de trás do celular.');
      
      ndef.onreading = (event: any) => {
        const { message, serialNumber } = event;
        setStatus('Tag lida com sucesso!');
        
        let content = '';
        for (const record of message.records) {
           if (record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding);
              content += textDecoder.decode(record.data) + ' ';
           } else if (record.recordType === 'url') {
              const textDecoder = new TextDecoder();
              content += textDecoder.decode(record.data) + ' ';
           }
        }
        
        setTagData({
          serialNumber,
          records: message.records.length,
          content: content || 'Nenhum dado legível em texto/url'
        });
      };

      ndef.onreadingerror = () => {
        setStatus('Erro ao ler a tag. Tente novamente.');
      };

    } catch (error: any) {
      setIsScanning(false);
      setStatus(`Erro: ${error.message}`);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-top">
          <div>
            <h1>NFC Tracker</h1>
            <p>Experimento de leitura de tags NFC</p>
          </div>
        </div>
      </div>

      <div className="accent-card">
        <h2>Status</h2>
        <div className="value" style={{ fontSize: '1.2rem', minHeight: '40px' }}>{status}</div>
        
        {supported && !isScanning && (
          <button className="dark-btn" onClick={handleScan} style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
            <ScanLineIcon />
            Iniciar Leitura NFC
          </button>
        )}
        {supported && isScanning && (
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', color: 'var(--text-dark)' }}>
             <div className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: 'var(--text-dark)' }}></div>
             Buscando tag...
           </div>
        )}
      </div>

      {tagData && (
        <div className="main-card">
          <div className="section-title" style={{ padding: '0', marginBottom: '16px' }}>
            Dados da Tag
          </div>
          
          <div className="list-item">
            <div className="item-left">
              <div className="item-info">
                <h3>Serial Number</h3>
                <p>{tagData.serialNumber}</p>
              </div>
            </div>
          </div>
          
          <div className="list-item">
            <div className="item-left">
              <div className="item-info">
                <h3>Conteúdo</h3>
                <p>{tagData.content}</p>
              </div>
            </div>
          </div>

          <div className="list-item" style={{ border: 'none', paddingBottom: '0' }}>
            <div className="item-left" style={{ width: '100%' }}>
              <div className="item-info" style={{ width: '100%', background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ color: 'var(--accent)' }}>Interação</h3>
                {tagData.serialNumber === '04:88:51:ea:94:56:80' ? (
                    <p style={{ marginTop: '8px' }}>🎉 Olá! Este é o cartão especial reconhecido!</p>
                ) : (
                    <p style={{ marginTop: '8px' }}>Cartão genérico lido. Cadastre este serial ({tagData.serialNumber}) para novas interações.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
