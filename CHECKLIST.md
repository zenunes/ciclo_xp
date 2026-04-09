# 📋 Checklist de Melhorias - Ciclos XP

Este documento rastreia o progresso das novas funcionalidades de Gamificação, Dark Mode e Estatísticas Avançadas.

## Fase 1: O Coração do RPG (Missões e Celebrações)
- [ ] **Animação de Level Up**
  - [ ] Instalar biblioteca `canvas-confetti`.
  - [ ] Criar componente global `LevelUpModal.tsx` para celebrar passagem de nível e mudança de classe.
  - [ ] Atualizar `useStudyStore.ts` para detectar quando o usuário sobe de nível e acionar o modal.
- [ ] **Missões Diárias (Daily Quests)**
  - [ ] Criar lógica no Zustand para gerar/armazenar 3 missões diárias baseadas na data atual.
  - [ ] Criar componente `DailyMissions.tsx` para a Dashboard.
  - [ ] Implementar a entrega de XP bônus ao completar uma missão.

## Fase 2: A Imersão (Dark Mode)
- [ ] **Motor de Temas**
  - [ ] Configurar o Tailwind para suportar modo escuro (`darkMode: 'class'`).
  - [ ] Criar botão de Toggle (Sol/Lua) no cabeçalho do `App.tsx`.
  - [ ] Salvar a preferência de tema do usuário no `localStorage`.
- [ ] **Refatoração Visual (Telas)**
  - [ ] Atualizar classes na `Dashboard.tsx` (`dark:bg-zinc-900`, `dark:text-white`, etc.).
  - [ ] Atualizar classes no `CycleConfig.tsx`.
  - [ ] Atualizar classes no `StudySession.tsx`.
  - [ ] Atualizar classes no `Analytics.tsx` e `Guide.tsx`.

## Fase 3: O Legado (Estatísticas Avançadas)
- [ ] **Mapa de Calor (Heatmap)**
  - [ ] Criar lógica para agrupar dados do `study_history` do Supabase por dia do ano (365 dias).
  - [ ] Construir o componente `Heatmap.tsx` com renderização em grade (estilo GitHub).
  - [ ] Inserir o Heatmap na tela de Estatísticas com tooltips mostrando o tempo estudado em cada dia.
