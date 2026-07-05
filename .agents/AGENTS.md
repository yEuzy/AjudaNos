# Regras de UI e Design
- **NÃO UTILIZE EMOJIS** dentro do aplicativo para representar ícones. 
- Sempre utilize **SVG** (inline ou através de bibliotecas como lucide-react) para a iconografia do projeto.
- **PROIBIDO INVENTAR DADOS (NO MOCK DATA):** Nunca crie dados falsos (mocks) no código para preencher a tela quando uma API faltar. Se a API não estiver disponível, exiba uma mensagem de erro ou informe o usuário. Sempre use os dados da API real fornecida.
- **MOBILE-FIRST OBRIGATÓRIO:** O foco absoluto deste app é o uso via Celular. O CSS deve sempre garantir áreas de toque grandes (mínimo 44px), `user-select: none` para botões, evitar overflow horizontal, e usar `env(safe-area-inset-bottom)` para a navbar inferior. Todo o design deve focar em telas pequenas.
