import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css';

const API_TIMETABLE = "/proxy/mobilibus/api/timetable?origin=web&v=2&project_id=166&route_id=1010841";
const API_VEHICLES = "/proxy/mobilibus/api/vehicles?origin=web&trip_id=7548523&route_id=1010841";

// =========================
// TIME HELPERS
// =========================
function toMinutes(t: string) {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

// =========================
// ICONS (SVGs)
// =========================
const BusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bus"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);



// Leaflet custom marker (SVG based to respect rules)
const createBusMarker = (heading: number) => {
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `<div style="transform: rotate(${heading}deg); width: 32px; height: 32px; background: #EFC890; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); border: 2px solid #2C294F;">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2C294F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};


export default function BusTracker() {
  const [data, setData] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingCache, setIsUsingCache] = useState(false);

  const [myStop, setMyStop] = useState<any>(null);

  // Fetch Meu Ponto (stop_id 32705124)
  const fetchStopDepartures = async () => {
    try {
      const res = await fetch("/proxy/mobilibus/api/departures?origin=web&stop_id=32705124");
      if (!res.ok) return;
      const data = await res.json();
      
      const upcoming = data.trips.flatMap((t: any) => 
        t.departures.map((d: any) => ({
          time: d.time,
          linha: t.shortName,
          direction: t.headsign,
          directionId: t.directionId,
          delay: d.delay || 0
        }))
      ).sort((a: any, b: any) => toMinutes(a.time) - toMinutes(b.time));

      const atual = nowMinutes();
      const proximos = upcoming.filter((u: any) => toMinutes(u.time) >= atual).slice(0, 8);

      setMyStop({
        stopName: data.stopName,
        departures: proximos
      });
    } catch (err) {
      console.warn("Falha ao buscar Meu Ponto.", err);
    }
  };

  // Fetch inicial (Timetable)
  const fetchTimetable = async () => {
    setLoading(true);
    setError(null);
    setIsUsingCache(false);

    const lerCache = () => {
      const cache = localStorage.getItem("i266_cache");
      if (!cache) return null;
      const parsed = JSON.parse(cache);
      if (Date.now() - parsed.timestamp < 5 * 60 * 1000) return parsed.data;
      return null;
    };

    const salvarCache = (fetchedData: any) => {
      localStorage.setItem("i266_cache", JSON.stringify({ data: fetchedData, timestamp: Date.now() }));
    };

    const cache = lerCache();

    try {
      const res = await fetch(API_TIMETABLE);
      if (!res.ok) throw new Error("Erro na API");
      const rawData = await res.json();
      
      const normalizedData = {
        directions: rawData.timetable.directions.map((dir: any) => {
          const allTrips = dir.services
            .flatMap((s: any) => s.departures)
            .map((d: any) => ({ departure: d.dep, arrival: d.arr }))
            .sort((a: any, b: any) => toMinutes(a.departure) - toMinutes(b.departure));

          const uniqueTrips = allTrips.filter((v: any, i: number, a: any[]) => a.findIndex(t => t.departure === v.departure) === i);

          return {
            name: `${dir.desc} (${dir.directionId === 0 ? 'T. Umuarama ➔ T. Novo Mundo' : 'T. Novo Mundo ➔ T. Umuarama'})`,
            trips: uniqueTrips
          };
        })
      };

      salvarCache(normalizedData);
      setData(normalizedData);
    } catch (err) {
      if (cache) {
        setData(cache);
        setIsUsingCache(true);
      } else {
        setError("Falha ao carregar API (CORS) e sem cache offline disponível.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch real-time (Vehicles) via Polling
  const fetchVehicles = async () => {
    try {
      const res = await fetch(API_VEHICLES);
      if (!res.ok) return;
      const vData = await res.json();
      setVehicles(vData);
    } catch (err) {
      console.warn("Falha no polling de veículos.", err);
    }
  };

  useEffect(() => {
    fetchTimetable();
    fetchVehicles();
    fetchStopDepartures();
    
    // Polling de 5s para o mapa e para o Meu Ponto
    const interval = setInterval(() => {
      fetchVehicles();
      fetchStopDepartures();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="status-card">
          <div className="spinner"></div>
          <p>Buscando horários da linha I266...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="status-card error">
          <AlertIcon />
          <p>{error}</p>
          <button className="accent-btn" onClick={fetchTimetable} style={{marginLeft: "auto"}}>Tentar Novamente</button>
        </div>
      );
    }

    if (!data || !data.directions) {
      return <div className="status-card"><p>Nenhum dado disponível.</p></div>;
    }

    const atual = nowMinutes();

    return (
      <>
        {data.directions.map((dir: any, idx: number) => {
          const trips = dir.trips || [];
          const proximos = trips.filter((t: any) => toMinutes(t.departure) >= atual).slice(0, 3);
          const emRota = trips.some((t: any) => atual >= toMinutes(t.departure) && atual <= toMinutes(t.arrival));

          return (
            <div key={idx} style={{marginBottom: "24px"}}>
              <div className="section-title">
                <span>{dir.name.split('(')[0].trim()}</span>
                <span style={{color: emRota ? 'var(--accent)' : 'var(--text-secondary)'}}>
                   {emRota ? 'Ônibus em Rota' : 'Aguardando'}
                </span>
              </div>

              <div className="main-card">
                {proximos.length > 0 ? (
                  proximos.map((t: any, i: number) => (
                    <div key={i} className="list-item">
                       <div className="item-left">
                         <div className="item-icon">
                           <BusIcon />
                         </div>
                         <div className="item-info">
                           <h3>{t.departure}</h3>
                           <p>Saída Terminal</p>
                         </div>
                       </div>
                       <div className="item-right">
                         <div className="item-badge">{t.arrival} (Previsão)</div>
                       </div>
                    </div>
                  ))
                ) : (
                  <p style={{color: "var(--text-secondary)", fontSize: "0.9rem", textAlign: "center"}}>Nenhum ônibus previsto.</p>
                )}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-top">
          <div>
            <h1>Mobilidade</h1>
            <p>I266 - Ao Vivo</p>
          </div>
          <div className="avatar-placeholder">
            <ClockIcon />
          </div>
        </div>
      </header>

      {/* ACCENT CARD (O meu ponto principal) */}
      <div className="accent-card">
        <div className="vertical-widget">
          <div className="widget-avatar active"><MapPinIcon /></div>
        </div>
        
        <h2>Meu Ponto</h2>
        <div className="value" style={{fontSize: "1.2rem", marginBottom: "8px"}}>{myStop ? myStop.stopName : 'Buscando...'}</div>
        
        {myStop && myStop.departures.length > 0 && (
           <div style={{marginTop: "16px"}}>
             <div style={{fontSize: "0.9rem", opacity: 0.8, marginBottom: "4px"}}>Próximo Ônibus</div>
             <div style={{fontSize: "1.8rem", fontWeight: "bold"}}>
               {myStop.departures[0].time}
               <span style={{fontSize: "0.9rem", marginLeft: "8px", opacity: 0.8}}>linha {myStop.departures[0].linha}</span>
             </div>
             {myStop.departures[0].delay > 0 && (
               <div style={{color: "#ef4444", fontWeight: "bold", fontSize: "0.8rem"}}>+{myStop.departures[0].delay}s atraso</div>
             )}
             
             <div className="pill-bar-container" style={{background: "rgba(44, 41, 79, 0.2)", boxShadow: "none"}}>
                <div className="pill-bar-fill" style={{width: "70%", background: "var(--bg-dark-element)"}}></div>
             </div>
           </div>
        )}
      </div>

      <main className="main-content">
        {isUsingCache && (
          <div className="status-card">
            <AlertIcon />
            <p>Usando tabela offline (Cache).</p>
          </div>
        )}

        <div className="section-title">
          <span>GPS TEMPO REAL</span>
        </div>
        <div className="main-card" style={{padding: "8px"}}>
          <div style={{ height: "200px", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <MapContainer center={[-18.9170, -48.1964]} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {vehicles.map((veh, i) => (
                <Marker key={i} position={[veh.lat, veh.lng]} icon={createBusMarker(veh.heading)}>
                  <Popup>
                    <strong>Viatura: {veh.vehicleId}</strong><br/>
                    Horário Partida: {veh.startTime}<br/>
                    Atraso: {veh.delay}s<br/>
                    Última Atualização: {veh.positionTime}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {renderContent()}

      </main>
    </div>
  );
}
