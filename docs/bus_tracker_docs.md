# 🚌 Bus Tracker I266 - Documentação do Protótipo Atual

Este documento detalha o funcionamento exato da tela de testes do rastreador de ônibus da linha I266 (Uberlândia), implementada com Vite + React.

O objetivo é registrar a arquitetura atual antes da implementação do mapa em tempo real com rastreamento GPS.

---

# 1. Arquitetura e Contorno do CORS (Proxy Vite)

A API oficial da Mobilibus (`/timetable`) não permite chamadas diretas do navegador devido ao bloqueio de CORS (Cross-Origin Resource Sharing).

## 🧩 Solução atual

Configuramos um **Proxy Reverso no Vite**:

- Frontend React chama `/api/mobilibus/...`
- Vite intercepta e redireciona para Mobilibus
- Como é server-to-server, não há bloqueio CORS
- Resposta retorna normal para o frontend

---

# 2. Tratamento e Normalização de Dados (Timetable)

A API de horários possui estrutura profunda:

`data.timetable.directions[].services[].departures[]`

## 🧠 Normalização feita no fetchData()

Transformamos a estrutura complexa em algo simples:

```js
{
  name: "Ida (T. Umuarama ➔ T. Novo Mundo)",
  trips: [
    { departure: "05:00", arrival: "05:30" }
  ]
}
```
O que o normalizador faz:
- Junta dias úteis + finais de semana
- Extrai departures e arrivals
- Ordena horários
- Remove duplicados

# 3. Lógica de "Próximos Ônibus" e "Em Rota"

⏰ **Conversão de tempo**
Transformamos horários em minutos:
15:30 → 930 minutos

🚌 **Próximos ônibus**
Filtramos:
- departure >= agora
- limitamos .slice(0, 5)

🚍 **Em rota**
Um ônibus está "em rota" quando:
departure <= agora <= arrival

# 4. Fallback Offline (Cache Local)

Se a API falhar:
💾 **localStorage**
- Chave: `i266_cache`
- Armazena último JSON válido
- Expira em 5 minutos

🔁 **comportamento**
- Se online → atualiza cache
- Se offline → usa cache
- Se sem cache → erro na UI

---

# 5. NOVA CAMADA: GPS EM TEMPO REAL (VEHICLES API)

Agora o sistema também integra a API de rastreamento real:
`https://mobilibus.com/api/vehicles?origin=web&trip_id=7548523&route_id=1010841`

🛰️ **O que essa API retorna**
```json
[
  {
    "vehicleId": "2058",
    "positionTime": "15:39:28",
    "lat": -18.92231523,
    "lng": -48.20429185,
    "percTravelled": 2,
    "heading": 147,
    "startTime": "15:35",
    "delay": 250,
    "seq": 2
  }
]
```

🧠 **Significado dos campos**
- `vehicleId` → ID do ônibus
- `positionTime` → última atualização GPS
- `lat/lng` → posição real no mapa
- `heading` → direção do veículo (graus)
- `startTime` → início da viagem
- `delay` → atraso em segundos/ms
- `percTravelled` → progresso da rota (%)
- `seq` → sequência na viagem

# 6. Diferença entre TIMETABLE e VEHICLES

🟡 **TIMETABLE (previsão)**
- Horários programados
- Baseado em tabela fixa
- Não reflete trânsito real

🟢 **VEHICLES (tempo real)**
- GPS real do ônibus
- Atualiza posição constantemente
- Mostra atrasos reais

# 7. Lógica híbrida (SISTEMA FINAL)

O sistema ideal combina os dois:
TIMETABLE (previsão) + VEHICLES (GPS real) = 🚌 SISTEMA DE TRANSPORTE COMPLETO

# 8. Polling em tempo real (GPS)

Para atualizar posição:
```javascript
setInterval(async () => {
  const res = await fetch(VEHICLES_URL);
  const data = await res.json();
  console.log("🚌 GPS ATUALIZADO:", data);
}, 5000);
```

# 9. Uso futuro no mapa

Essa API permite:
📍 marker do ônibus no mapa
🧭 direção do veículo
⏱️ animação em tempo real
📊 progresso da viagem
⚡ previsão ajustada por atraso real

# 10. Design e Regras de Interface
- Zero emojis na UI final (somente logs e debug)
- Dark mode padrão
- Interface minimalista tipo dashboard
- Atualização contínua sem reload
- Botões flutuantes apenas para debug

# 11. Evolução planejada
🟢 **Fase 1:** Timetable funcionando (já concluído)
🟡 **Fase 2:** GPS overlay no mapa
🔴 **Fase 3:** Sistema híbrido inteligente: previsão + GPS + atraso (tipo Moovit / Uber Transit)

🚀 **Status atual:**
✔ Timetable integrado
✔ Cache local funcionando
✔ Normalização pronta
✔ GPS endpoint descoberto
⏳ **Próximo passo: MAPA EM TEMPO REAL**
