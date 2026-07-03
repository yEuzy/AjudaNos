import { useState, useEffect } from 'react';
import './index.css';

// =========================
// SVGs
// =========================
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);

// =========================
// TYPES & LOGIC
// =========================
export interface Medico {
  nome: string;
  especialidade: string;
}

export interface TurnoEscala {
  dtEscalaMedica: string;
  horario: string;
  nmTurno: string;
  medicos: Medico[];
}

export function normalizarNome(nome: string): string {
  if (!nome) return "";
  return nome
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

export function dataParaNumero(dataString: string): number {
  if (!dataString || !dataString.includes('/')) return 0;
  const [dia, mes, ano] = dataString.split('/');
  return parseInt(`${ano}${mes.padStart(2, '0')}${dia.padStart(2, '0')}`, 10);
}

export function processarEscalas(
  escalasBrutas: TurnoEscala[], 
  dataAtualInputYYYYMMDD: string,
  medicosPermitidos?: string[]
) {
  const currentDateNum = parseInt(dataAtualInputYYYYMMDD.replace(/-/g, ''), 10);
  const nomesPermitidosNorm = medicosPermitidos?.map(normalizarNome) || [];

  let escalasLimpas = escalasBrutas.map(escala => {
    const medicosSeguros = escala.medicos || [];
    
    // Filtra para manter APENAS os médicos desejados no turno
    const medicosFiltrados = nomesPermitidosNorm.length > 0 
      ? medicosSeguros.filter(m => nomesPermitidosNorm.includes(normalizarNome(m.nome)))
      : medicosSeguros;

    return {
      ...escala,
      medicos: medicosFiltrados
    };
  }).filter(escala => escala.medicos.length > 0);

  const today: TurnoEscala[] = [];
  const future: TurnoEscala[] = [];

  escalasLimpas.forEach(escala => {
    const dataEscalaNum = dataParaNumero(escala.dtEscalaMedica);
    if (dataEscalaNum === currentDateNum) {
      today.push(escala);
    } else if (dataEscalaNum > currentDateNum) {
      future.push(escala);
    }
  });

  return { today, future };
}

export default function EscalaMedica() {
  const dLocal = new Date();
  const localYYYYMMDD = `${dLocal.getFullYear()}-${String(dLocal.getMonth()+1).padStart(2, '0')}-${String(dLocal.getDate()).padStart(2, '0')}`;
  
  const [dataAtual, setDataAtual] = useState(localYYYYMMDD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [todayData, setTodayData] = useState<TurnoEscala[]>([]);
  const [futureData, setFutureData] = useState<TurnoEscala[]>([]);
  
  const allowedMedicos = ["SAMIR UZIEL", "SAMIRA UZIEL"];

  // Função para converter YYYY-MM-DD para DD/MM/YYYY para a API
  const converterDataParaAPI = (dataStr: string) => {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  useEffect(() => {
    const fetchEscala = async () => {
      setLoading(true);
      setError(null);
      
      const dataFormatada = converterDataParaAPI(dataAtual);
      // Rota com Proxy configurada no vite.config.ts e vercel.json
      const url = `/proxy/escalamedica/escalamedica/consulta-escalas-medicas/buscar-escalas-medicas-consulta?dtEscalaMedica=${dataFormatada}&cdUnidSaude=20`;
      
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Erro na API (${res.status})`);
        }
        
        const json: TurnoEscala[] = await res.json();
        
        // Processa os dados reais da API usando nossa função robusta
        const { today, future } = processarEscalas(json, dataAtual, allowedMedicos);
        
        setTodayData(today);
        setFutureData(future);
      } catch (err: any) {
        console.error("Erro ao buscar Escala:", err);
        setError("Não foi possível conectar à fonte de dados da Prefeitura.");
        setTodayData([]);
        setFutureData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEscala();
  }, [dataAtual]);

  const renderTurno = (t: TurnoEscala, idx: number) => (
    <div key={idx} className="card direction-card">
      <div className="card-header">
        <span className="icon"><CalendarIcon /></span>
        <h2>{t.dtEscalaMedica} - {t.nmTurno}</h2>
      </div>
      <div className="status-badge active">
        <ClockIcon /> {t.horario}
      </div>
      <div className="trips-section">
        <h3>Médicos Confirmados</h3>
        <div className="shift-list">
          {t.medicos.map((m, i) => (
            <div key={i} className="shift-item trip-item">
              <div className="trip-time">
                <UserIcon />
                <span><strong>{m.nome}</strong></span>
              </div>
              <div className="trip-time" style={{color: "var(--text-secondary)"}}>
                <CheckIcon />
                <span>{m.especialidade}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content flex-between">
          <div className="logo-container">
            <span className="icon"><SearchIcon /></span>
            <h1>Escala Médica (Oficial)</h1>
          </div>
          <div className="time-display" style={{ padding: "0" }}>
            <input 
              type="date" 
              value={dataAtual} 
              onChange={e => setDataAtual(e.target.value)}
              style={{ background: "transparent", color: "white", border: "none", outline: "none", fontFamily: "inherit" }}
            />
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="cache-warning">
          <SearchIcon />
          <span>Filtro Ativo: Exibindo apenas turnos de {allowedMedicos.join(" e ")}. (API Em Tempo Real - UAI Novo Mundo)</span>
        </div>

        {error && (
          <div className="status-container error-card" style={{ marginTop: '2rem' }}>
            <AlertIcon />
            <h2>Falha na Conexão</h2>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="status-container">
            <div className="spinner"></div>
            <p>Buscando escalas da prefeitura...</p>
          </div>
        ) : (
          !error && (
            <>
              <h2 style={{marginTop: "2rem", marginBottom: "1rem"}}>Plantões de Hoje</h2>
              {todayData.length > 0 ? (
                <div className="directions-container">
                  {todayData.map(renderTurno)}
                </div>
              ) : (
                <p className="empty-state">Nenhum plantão localizado para hoje.</p>
              )}

              <h2 style={{marginTop: "3rem", marginBottom: "1rem"}}>Próximos Plantões</h2>
              {futureData.length > 0 ? (
                <div className="directions-container">
                  {futureData.map(renderTurno)}
                </div>
              ) : (
                <p className="empty-state">Nenhum plantão futuro localizado.</p>
              )}
            </>
          )
        )}
      </main>
    </div>
  );
}
