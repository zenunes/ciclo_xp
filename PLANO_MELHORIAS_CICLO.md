# Plano de Melhorias do Ciclo de Estudos (Ciclos XP)

Este documento detalha as melhorias arquiteturais no sistema de Ciclos de Estudos, visando torná-lo mais robusto, inteligente e persistente, espelhando métodos reais de estudo para alta performance.

## 🎯 Objetivos (Checklist)

- [ ] **Fase 1: Persistência do Progresso do Ciclo**
  - Salvar o estado do ciclo (`isActive`, `currentIndex`, `queue`) no `localStorage`.
  - Garantir que, ao recarregar a página ou fechar o navegador, o usuário retorne exatamente para a matéria em que parou.

- [ ] **Fase 2: Timer Persistente na Sessão**
  - Salvar o tempo restante da sessão atual no `localStorage` a cada segundo.
  - Evitar que atualizações acidentais da página resetem o cronômetro para o tempo total da matéria.
  - Limpar o timer salvo ao concluir a sessão ou parar o ciclo.

- [ ] **Fase 3: Fila do Ciclo Baseada em Pesos (Distribuição Inteligente)**
  - Substituir a iteração simples (`index + 1`) por uma **Fila de Execução (Queue)** gerada dinamicamente.
  - O algoritmo distribuirá as matérias com base no peso. Ex: Matéria com Peso 3 aparecerá 3 vezes na mesma "rodada" do ciclo, enquanto a de Peso 1 aparecerá apenas 1 vez.

- [ ] **Fase 4: Adiar Matéria (Postpone) vs. Pular**
  - Substituir a função de "Pular" por "Adiar".
  - Quando adiada, a matéria não é ignorada; ela é enviada para o final da fila da rodada atual, garantindo que o usuário ainda a estude antes de girar o ciclo completamente.

---

## 🛠️ Detalhes Técnicos

### Estrutura de Dados (`useStudyStore.ts`)
O estado `cycle` ganhará uma propriedade `queue: string[]` que armazenará os IDs das matérias na ordem em que devem ser estudadas.

**Algoritmo de Distribuição (Round-Robin):**
```typescript
const generateQueue = (subjects: Subject[]): string[] => {
  if (subjects.length === 0) return [];
  const maxWeight = Math.max(...subjects.map(s => s.weight || 1));
  const queue: string[] = [];
  
  for (let i = 1; i <= maxWeight; i++) {
    subjects.forEach(s => {
      if ((s.weight || 1) >= i) {
        queue.push(s.id);
      }
    });
  }
  return queue;
};
```
*Exemplo: A (Peso 2), B (Peso 1) -> Fila gerada: `[A, B, A]`.*

### Fluxo do Timer (`StudySession.tsx`)
```javascript
const storageKey = 'ciclos_xp_current_timer';
const [timeLeft, setTimeLeft] = useState(() => {
  const saved = localStorage.getItem(storageKey);
  return saved ? parseInt(saved, 10) : currentSubject.durationMinutes * 60;
});
// Salva a cada segundo
useEffect(() => {
  localStorage.setItem(storageKey, timeLeft.toString());
}, [timeLeft]);
```