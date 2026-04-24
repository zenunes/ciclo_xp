# Plano de Implementação: Decaimento de XP (XP Decay)

## 💡 Visão Geral
Em jogos competitivos (como League of Legends, Valorant, etc.), jogadores de alto nível sofrem com o **"Elo Decay"** (Decaimento de Elo) se ficarem muito tempo sem jogar. 

Trazer essa mecânica para o Ciclos XP é uma ideia fantástica de gamificação avançada. Utiliza o gatilho psicológico da **Aversão à Perda**: quando o usuário atinge o "Endgame" (classes altas), o jogo deixa de ser apenas sobre "ganhar mais", e passa a exigir **consistência para se manter no topo**.

---

## ⚙️ Regras de Negócio Sugeridas

1. **Requisito Mínimo (Endgame):** O decaimento só afeta usuários que atingiram a classe **Mestre (Nível 40)** ou superior. Aprendizes e classes baixas estão imunes (para não frustrar iniciantes).
2. **Tempo de Inatividade:** O jogador começa a perder XP se ficar **mais de 3 dias (72h)** sem concluir nenhuma sessão de estudo ou revisão.
3. **Penalidade (Taxa de Decaimento):** 
   - Exemplo: Perde **100 XP por cada dia** de inatividade além do limite.
   - Se ficou 5 dias sem estudar, são 2 dias de penalidade = -200 XP.
4. **Queda de Nível/Classe:** O jogador **pode** cair de nível e até voltar para uma classe inferior (ex: cair de Mestre para Cavaleiro) se o XP for drenado o suficiente. Isso cria um senso de urgência real.

---

## ✅ Checklist de Implementação

- [ ] **Fase 1: Atualização do Banco de Dados (Supabase)**
  - Opcional/Recomendado: Adicionar uma coluna `last_decay_date` (Data do último decaimento) na tabela `profiles` para não penalizar o usuário duplicadamente no mesmo dia, OU calcular o decaimento apenas com base no `last_study_date` limitando a atualização diária.

- [ ] **Fase 2: Lógica de Decaimento (`useStudyStore.ts`)**
  - Criar uma função `checkXpDecay()` que roda sempre que o usuário abre o aplicativo (dentro de `fetchUserData`).
  - Calcular a diferença de dias entre `Hoje` e a `last_study_date`.
  - Se a diferença for > 3 dias e o nível for >= 40:
    - Calcular a quantidade de XP a ser subtraída.
    - Recalcular o novo nível com base no XP reduzido.
    - Salvar o novo XP e Nível no Supabase.

- [ ] **Fase 3: Alerta Visual (UI/UX)**
  - Criar um componente/modal de aviso: `DecayAlertModal.tsx`.
  - Se o usuário sofreu decaimento ao abrir o app, mostrar uma tela vermelha/dramática: 
    *Ex: "Os deuses do conhecimento estão decepcionados. Você ficou 5 dias inativo e perdeu 200 XP. Sua chama está enfraquecendo!"*

- [ ] **Fase 4: Atualização no Guia do Usuário (`Guide.tsx`)**
  - Adicionar uma seção explicando a "Maldição da Inatividade" para jogadores de Nível 40+.

---

## 🚀 Próximos Passos
Para implementar, precisaremos mexer levemente na inicialização do app para checar a data da última sessão e fazer a matemática de subtração. Se aprovado, começamos pelo Banco de Dados e a Lógica de Estado!