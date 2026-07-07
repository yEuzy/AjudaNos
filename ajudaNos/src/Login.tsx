import './index.css';

// SVGs
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const UserFemaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2c0 2.2 1.8 4 4 4s4-1.8 4-4V6a4 4 0 0 0-4-4Z"/><path d="M22 22v-2a4 4 0 0 0-4-4h-2a2 2 0 0 1-2-2 3 3 0 0 0-6 0 2 2 0 0 1-2 2H4a4 4 0 0 0-4 4v2"/></svg>
);

interface LoginProps {
  onLogin: (user: 'Kallew' | 'Maria') => void;
}

export default function Login({ onLogin }: LoginProps) {
  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', padding: '0 24px', paddingBottom: '0' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Bem-vindo</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Selecione o seu perfil para continuar</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <button 
          className="main-card" 
          onClick={() => onLogin('Kallew')}
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
          <div className="item-icon" style={{ width: '64px', height: '64px', color: 'var(--accent)' }}>
            <UserIcon />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Kallew</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Perfil Principal</p>
          </div>
        </button>

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
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Perfil Secundário</p>
          </div>
        </button>
      </div>

    </div>
  );
}
