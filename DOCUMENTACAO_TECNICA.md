# 📚 Documentação Técnica - Sistema de Gamificação (RPG) e Onboarding Tour

Este documento detalha toda a arquitetura, lógica e decisões técnicas envolvidas na criação do sistema de RPG (níveis e classes) e do Tour Interativo com `react-joyride` no projeto Ciclos XP. 

Serve como material de estudo e referência futura para entender como as bibliotecas se conectam com o estado global (`zustand`) e com o banco de dados (`supabase`).

---

## 1. ⚔️ Sistema de Progressão RPG

### 1.1. Arquitetura Lógica (`src/lib/rpg.ts`)
O núcleo do RPG foi extraído para um módulo puro (`rpg.ts`). Essa separação permite que a lógica de negócio (cálculo de níveis e XP) seja testada isoladamente sem depender do React.

- **`calculateLevel(xp: number)`**:
  - Fórmula: `Math.floor(Math.sqrt(xp / 100)) + 1`.
  - Essa curva quadrática (raiz quadrada) garante que os primeiros níveis sejam fáceis de passar (ex: 100 XP para Nível 2, 400 XP para Nível 3, 900 XP para Nível 4), criando um forte engajamento inicial, mas tornando os níveis mais altos progressivamente mais difíceis de alcançar.

- **`CHARACTER_CLASSES`**:
  - Um array de objetos que define os "Tiers" do usuário com base no nível (Aprendiz, Escudeiro, Guerreiro, Cavaleiro e Mestre).
  - Integrado diretamente aos ícones do `lucide-react` e a um sistema de tokens de cores (`'zinc'`, `'blue'`, etc.) que depois são mapeados para classes reais do TailwindCSS no frontend.

- **`getLevelProgress(xp, level)`**:
  - Função matemática que calcula a diferença entre o XP atual e a meta do próximo nível, retornando a porcentagem exata (`0` a `100`) para preencher a barra de progresso visual na Dashboard.

### 1.2. Integração com a UI (`src/pages/Dashboard.tsx`)
Na Dashboard, as funções do RPG são importadas e alimentadas com os dados do estado global (`user.xp` e `user.level`).

- **Color Styles Dinâmicos**: Foram criados dicionários (objetos) no React que mapeiam as strings de cores da classe (`'violet'`, `'amber'`) para as classes utilitárias do Tailwind (`'bg-violet-400'`, `'from-amber-400/20'`). Isso permite que todo o card do personagem (fundo, borda e barra de progresso) mude radicalmente de aparência quando o usuário sobe de classe.

---

## 2. 🗺️ Tour Interativo (Onboarding)

O Tour foi implementado utilizando a biblioteca `react-joyride` para apresentar o aplicativo a novos usuários.

### 2.1. Configuração do Estado Global (`src/store/useStudyStore.ts`)
Duas novas propriedades foram adicionadas ao `zustand` para controlar o tour de forma reativa:
- `hasSeenTutorial: boolean`: Reflete o banco de dados. Diz se o usuário já completou ou pulou o tour.
- `forceTour: boolean`: Um estado puramente local em memória. Quando o usuário clica no botão dentro do Guia, isso se torna `true` e força o tour a reiniciar.

**Atualização no Banco de Dados**:
Foi criada a função `setHasSeenTutorial(value: boolean)`. Ela atualiza a tabela `profiles` no Supabase (coluna `has_seen_tutorial`). Caso a coluna não exista no banco ainda, há um fallback que captura o erro silenciosamente e atualiza apenas o estado local, evitando que a aplicação quebre.

### 2.2. Componente de Tour (`src/components/OnboardingTour.tsx`)
Este componente atua como um wrapper invisível, instanciado globalmente em `App.tsx`.

- **Mapeamento (Steps)**: O Joyride precisa saber para onde apontar. Nós passamos seletores CSS (`target: '.tour-rpg-card'`, etc.).
- **Ciclo de Vida (useEffect)**: 
  - Se o usuário estiver na rota `/` (Dashboard) e `hasSeenTutorial` for `false`, o estado interno `run` vira `true` e o tour começa sozinho.
  - Se `forceTour` for `true`, nós garantimos que ele navegue para `/` (usando `useNavigate`) e usamos um `setTimeout(500ms)` para dar tempo ao DOM de renderizar os cards antes de procurar os seletores CSS.
- **Joyride Callback**: O evento principal (`handleJoyrideCallback`) monitora a ação do usuário. Se o status for `FINISHED` ou `SKIPPED`, ele chama o Zustand para alterar `hasSeenTutorial` para `true` no banco, garantindo que o tour não apareça sozinho no próximo login.

### 2.3. Marcação do HTML (`Dashboard.tsx` e `App.tsx`)
Para o Joyride conseguir "iluminar" as áreas corretas, adicionamos classes de âncora nos elementos React:
- `.tour-rpg-card`: No Card do Personagem.
- `.tour-stats`: Na grade de estatísticas numéricas.
- `.tour-next-subject`: No card que mostra qual matéria estudar agora.
- `.tour-navigation`: No header superior do App.tsx.

---

## 3. 📖 O Guia In-App (`src/pages/Guide.tsx`)

Ao invés de apenas um arquivo `.md` no repositório, foi construída uma página nativa e responsiva em React.
Ela consome a constante `CHARACTER_CLASSES` importada de `rpg.ts`. Isso é uma **excelente prática de Arquitetura**: se no futuro você alterar o nível de corte do Escudeiro de 10 para 15 no arquivo de lógica, a página de Guia vai se atualizar sozinha renderizando o novo texto, sem precisarmos alterar dois lugares diferentes.

A página possui o botão **"Fazer o Tour Interativo Novamente"** que invoca a action `setForceTour(true)` do Zustand, provando como o estado global pode controlar componentes que estão em outra rota da aplicação.

---
**Fim da Documentação**
*(Criado via AI Agent em Pair Programming)*
