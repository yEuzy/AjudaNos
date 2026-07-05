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
  dtEscalaMedicaFormatada?: string;
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

  // Manipulação de Datas
  const getNextDateString = (baseDateStr: string, addDays: number) => {
    const [y, m, d] = baseDateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + addDays);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const converterDataParaAPI = (dataStr: string) => {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  useEffect(() => {
    const fetchEscala = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Dispara 3 consultas (Hoje, Amanhã, Depois)
        const datasParaBuscar = [0, 1, 2].map(days => getNextDateString(dataAtual, days));
        
        const promessas = datasParaBuscar.map(dataStr => {
          const dataFormatada = converterDataParaAPI(dataStr);
          const url = `/proxy/escalamedica/escalamedica/consulta-escalas-medicas/buscar-escalas-medicas-consulta?dtEscalaMedica=${dataFormatada}&cdUnidSaude=20`;
          return fetch(url).then(r => {
             if (!r.ok) throw new Error("Erro na API");
             return r.json();
          });
        });

        const resultadosArray = await Promise.all(promessas);
        const escalasBrutasAgrupadas = resultadosArray.flat() as TurnoEscala[];
        
        const { today, future } = processarEscalas(escalasBrutasAgrupadas, dataAtual, allowedMedicos);
        
        setTodayData(today);
        setFutureData(future);
      } catch (err: any) {
        console.error("Erro ao buscar Escala (3 Dias):", err);
        setError("Não foi possível conectar à fonte de dados.");
        setTodayData([]);
        setFutureData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEscala();
  }, [dataAtual]);

  const renderTurno = (t: TurnoEscala, idx: number) => (
    <div key={idx} className="list-item">
      <div className="item-left">
        <div className="item-icon">
          <ClockIcon />
        </div>
        <div className="item-info">
          <h3>{t.dtEscalaMedica}</h3>
          <p>{t.horario} - {t.nmTurno}</p>
        </div>
      </div>
      <div className="item-right">
        {t.medicos.map((m, i) => (
           <div key={i} className="item-badge" style={{marginBottom: "4px"}}>{m.nome}</div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-top">
          <div>
            <h1>Prefeitura</h1>
            <p>Escala Médica Oficial</p>
          </div>
          <div className="avatar-placeholder">
            <UserIcon />
          </div>
        </div>
      </header>

      <div className="accent-card">
        <div className="vertical-widget">
          <div className="widget-avatar active"><UserIcon /></div>
          <div className="widget-avatar"><UserIcon /></div>
        </div>
        
        <h2>Buscando por</h2>
        <div className="value">Uziel</div>
        
        <label className="dark-btn" style={{marginTop: "8px", width: "100%", justifyContent: "center"}}>
          <CalendarIcon />
          <input 
            type="date" 
            value={dataAtual} 
            onChange={e => setDataAtual(e.target.value)}
            style={{ background: "transparent", color: "var(--text-main)", border: "none", outline: "none", fontFamily: "inherit" }}
          />
        </label>
      </div>

      <main className="main-content">
        {error && (
          <div className="status-card error">
            <AlertIcon />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="status-card">
            <div className="spinner"></div>
            <p>Buscando próximos 3 dias...</p>
          </div>
        ) : (
          !error && (
            <>
              <div className="section-title">
                <span>PLANTÃO DE HOJE</span>
              </div>
              <div className="main-card">
                {todayData.length > 0 ? (
                  todayData.map(renderTurno)
                ) : (
                  <p style={{color: "var(--text-secondary)", fontSize: "0.9rem", textAlign: "center"}}>Nenhum plantão hoje.</p>
                )}
              </div>

              <div className="section-title">
                <span>PRÓXIMOS PLANTÕES (+2 DIAS)</span>
              </div>
              <div className="main-card">
                {futureData.length > 0 ? (
                  futureData.map(renderTurno)
                ) : (
                  <p style={{color: "var(--text-secondary)", fontSize: "0.9rem", textAlign: "center"}}>Nenhum plantão futuro.</p>
                )}
              </div>
            </>
          )
        )}
      </main>
    </div>
  );
}
