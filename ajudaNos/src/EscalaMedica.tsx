import { useState, useMemo } from 'react';
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

// =========================
// MOCK DATA
// =========================
const getTodayString = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}/${d.getFullYear()}`;
};
const getTomorrowString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}/${d.getFullYear()}`;
};

const mockData: TurnoEscala[] = [
  {
    dtEscalaMedica: getTodayString(),
    nmTurno: "MATUTINO",
    horario: "07:00 às 13:00",
    medicos: [{ nome: "SAMIR UZIEL", especialidade: "CLÍNICA MÉDICA" }]
  },
  {
    dtEscalaMedica: getTodayString(),
    nmTurno: "NOTURNO",
    horario: "19:00 às 07:00",
    medicos: [{ nome: "SAMIRA UZIEL", especialidade: "PEDIATRIA" }]
  },
  {
    dtEscalaMedica: getTomorrowString(),
    nmTurno: "VESPERTINO",
    horario: "13:00 às 19:00",
    medicos: [{ nome: "SAMIR UZIEL", especialidade: "CLÍNICA MÉDICA" }, { nome: "OUTRO MEDICO", especialidade: "CIRURGIA" }]
  }
];

export default function EscalaMedica() {
  const [dataAtual, setDataAtual] = useState(new Date().toISOString().split('T')[0]);
  const allowedMedicos = ["SAMIR UZIEL", "SAMIRA UZIEL"];

  const { today, future } = useMemo(() => {
    return processarEscalas(mockData, dataAtual, allowedMedicos);
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
            <h1>Escala Médica (Mock)</h1>
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
          <span>Filtro Ativo: Exibindo apenas turnos de {allowedMedicos.join(" e ")}. (Dados Simulados)</span>
        </div>

        <h2 style={{marginTop: "2rem", marginBottom: "1rem"}}>Plantões de Hoje</h2>
        {today.length > 0 ? (
          <div className="directions-container">
            {today.map(renderTurno)}
          </div>
        ) : (
          <p className="empty-state">Nenhum plantão localizado para hoje.</p>
        )}

        <h2 style={{marginTop: "3rem", marginBottom: "1rem"}}>Próximos Plantões</h2>
        {future.length > 0 ? (
          <div className="directions-container">
            {future.map(renderTurno)}
          </div>
        ) : (
          <p className="empty-state">Nenhum plantão futuro localizado.</p>
        )}
      </main>
    </div>
  );
}
