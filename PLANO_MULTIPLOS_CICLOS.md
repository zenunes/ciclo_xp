# Plano de Implementação: Múltiplos Ciclos de Estudo

## 💡 Visão Geral
A capacidade de gerenciar **Múltiplos Ciclos de Estudo** é o divisor de águas entre um aplicativo básico e uma ferramenta profissional para concurseiros e universitários. 
Na vida real, é muito comum que um estudante tenha objetivos paralelos (ex: "Concurso da Polícia Federal" e "Provas da Faculdade", ou "Ciclo Pré-Edital" e "Ciclo Pós-Edital").

Permitir que o usuário crie, alterne e gerencie ciclos independentes evita que ele precise apagar todas as matérias toda vez que mudar de foco.

---

## 🏗️ Impacto Arquitetural

Atualmente, a tabela `subjects` (disciplinas) está ligada diretamente ao `user_id`. Para suportar múltiplos ciclos, precisaremos criar uma hierarquia:
Um **Usuário** tem vários **Ciclos**. Um **Ciclo** tem várias **Disciplinas**.

### Alterações no Banco de Dados (Supabase)
1. **Nova Tabela `cycles`:**
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key)
   - `name` (text) - Ex: "Concurso PF", "Faculdade"
   - `created_at` (timestamp)
2. **Atualização na Tabela `subjects`:**
   - Adicionar coluna `cycle_id` (uuid, foreign key apontando para `cycles.id`).

---

## ✅ Checklist de Implementação (Roteiro)

- [ ] **Fase 1: Estrutura no Supabase (Backend)**
  - Criar a tabela `cycles` com as políticas de segurança (RLS) adequadas.
  - Adicionar a coluna `cycle_id` na tabela `subjects`.
  - Criar um script/lógica de migração (se o usuário já tem disciplinas, criar um "Ciclo Padrão" automático e vincular essas disciplinas a ele).

- [ ] **Fase 2: Atualização do Estado Global (useStudyStore.ts)**
  - Criar a tipagem `CycleData { id, name, subjects }`.
  - Adicionar `cycles: CycleData[]` e `activeCycleId: string` ao estado.
  - Atualizar as funções `fetchUserData`, `addSubject`, `updateSubject`, `removeSubject` para respeitarem o `activeCycleId`.
  - Criar funções `createCycle`, `switchCycle`, `deleteCycle`, `editCycle`.

- [ ] **Fase 3: Interface de Configuração (CycleConfig.tsx)**
  - Criar um **Seletor (Dropdown/Tabs)** no topo da tela para alternar entre os ciclos criados.
  - Adicionar um botão "+ Novo Ciclo" que abre um pequeno modal pedindo o nome do ciclo.
  - A lista de disciplinas mostrada abaixo deve pertencer apenas ao ciclo selecionado no momento.

- [ ] **Fase 4: Dashboard, Sessão e Estatísticas**
  - **Dashboard:** Mostrar o nome do Ciclo Selecionado no card de Ciclo Ativo.
  - **StudySession:** Garantir que o cronômetro e a fila sejam exclusivos do ciclo que foi "Iniciado".
  - **Analytics:** (Opcional/Avançado) Adicionar um filtro para ver as estatísticas globais ou apenas do ciclo selecionado.

---

## 🚀 Avaliação Crítica e Próximos Passos
Essa mudança é **profunda**, pois altera a raiz de como os dados são salvos e lidos. No entanto, é a evolução natural mais valiosa para o "Ciclos XP". A separação em módulos e o uso do Zustand facilitarão bastante a adaptação no frontend, mas precisaremos ter cuidado com a migração do banco de dados para não quebrar o ciclo atual do usuário.