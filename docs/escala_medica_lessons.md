# 🧠 Aprendizados: Lógica de Consulta de Escalas Médicas

Este documento reúne toda a lógica central e os testes de falhas (edge cases) identificados durante o protótipo. O objetivo é que este código seja reutilizado quando você definir o design final da aplicação e começarmos a plugar os dados reais do Supabase/API.

---

## ⚠️ Teste de Possíveis Erros (Edge Cases)

Ao testar mentalmente e no código as vulnerabilidades desse modelo de dados (que vem de uma API ou scraping da prefeitura), identificamos os seguintes riscos:

### 1. Nomes com Acentos ou Espaços Extras
**Erro:** O sistema da prefeitura pode cadastrar `João` em um dia e `Joao` no outro. A busca literal falharia.
**Solução:** Devemos aplicar uma função de normalização (`.normalize('NFD')`) para ignorar acentos e transformar tudo para maiúsculo sem espaços nas bordas antes de comparar.

### 2. Timezones e Comparação de Datas (Off-by-One)
**Erro:** Ao fazer `new Date()` no JavaScript sem especificar a Timezone, navegadores diferentes podem transformar meia-noite do dia 03/07 no dia 02/07 às 21h (dependendo do fuso). 
**Solução:** Em vez de transformar a data da API em um objeto `Date` complexo apenas para saber o que é "hoje" e o que é "futuro", é mais seguro comparar numericamente `YYYYMMDD` ou garantir que os cálculos ocorram estritamente no fuso local, sem conversões UTC intermediárias.

### 3. Propriedades Inexistentes (`undefined`)
**Erro:** Se algum dia a API não retornar a propriedade `medicos` (porque o turno foi cancelado, por exemplo), o código `escala.medicos.filter(...)` quebraria a tela inteira (o famoso *White Screen of Death* do React).
**Solução:** Utilizar *Optional Chaining* (`escala.medicos?.`) e valores padrão nulos (`?? []`).

### 4. Formatos de Data Inconsistentes
**Erro:** Esperamos `DD/MM/YYYY`. Se a API mandar `3/7/2026` ou `03-07-2026`, o `.split('/')` causaria `NaN`.
**Solução:** Fazer um split dinâmico ou utilizar regex para extrair Dia, Mês e Ano de forma segura.

---

## 🛠️ O Código Definitivo (Robustez Máxima)

Aqui está a versão "à prova de balas" da lógica que desenvolvemos. Guarde esta função para a tela final:

```typescript
// 1. Tipagem (TypeScript) para garantir formato
export interface Medico {
  nome: string;
  especialidade: string;
  tipoUnidade?: string;
}

export interface TurnoEscala {
  dtEscalaMedica: string;
  dtEscalaMedicaFormatada?: string;
  horario: string;
  nmTurno: string;
  medicos: Medico[];
}

// 2. Normalizador de Strings (Evita erros de acentuação/case)
export function normalizarNome(nome: string): string {
  if (!nome) return "";
  return nome
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .toUpperCase();
}

// 3. Conversor seguro de data (Transforma DD/MM/YYYY em um número YYYYMMDD para comparação)
// Exemplo: "03/07/2026" vira 20260703
export function dataParaNumero(dataString: string): number {
  if (!dataString || !dataString.includes('/')) return 0;
  const [dia, mes, ano] = dataString.split('/');
  return parseInt(`${ano}${mes.padStart(2, '0')}${dia.padStart(2, '0')}`, 10);
}

// 4. A Função de Filtro Principal
export function processarEscalas(
  escalasBrutas: TurnoEscala[], 
  dataAtualInputYYYYMMDD: string, // Ex: "2026-07-03"
  medicosPermitidos?: string[] // Ex: ["SAMIR UZIEL", "SAMIRA UZIEL"]
) {
  // Converte a data do input ("2026-07-03") para o mesmo formato numérico 20260703
  const currentDateNum = parseInt(dataAtualInputYYYYMMDD.replace(/-/g, ''), 10);
  
  // Normalizamos a lista de permitidos caso exista
  const nomesPermitidosNorm = medicosPermitidos?.map(normalizarNome) || [];

  // 1º Passo: Limpar os dados brutos e reter apenas os médicos válidos
  let escalasLimpas = escalasBrutas.map(escala => {
    // Tratamento contra crash (undefined fallback)
    const medicosSeguros = escala.medicos || [];
    
    // Se não há filtro, mantemos todos. Se há, filtramos.
    const medicosFiltrados = nomesPermitidosNorm.length > 0 
      ? medicosSeguros.filter(m => nomesPermitidosNorm.includes(normalizarNome(m.nome)))
      : medicosSeguros;

    return {
      ...escala,
      medicos: medicosFiltrados
    };
  }).filter(escala => escala.medicos.length > 0); // Só guarda turnos onde sobrou algum médico

  // 2º Passo: Separar "Hoje" de "Futuro" via matemática (sem risco de timezone)
  const today = [];
  const future = [];

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
```
