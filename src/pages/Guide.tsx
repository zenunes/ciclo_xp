import { RefreshCw, Brain, Flame, Target, Play, Sword, LayoutList, CheckSquare, Activity, Moon, Skull } from 'lucide-react';
import { CHARACTER_CLASSES } from '../lib/rpg';
import { useStudyStore } from '../store/useStudyStore';

export function Guide() {
  const { setForceTour } = useStudyStore();

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Como funciona o Ciclos XP?</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
          Um guia rápido para você entender a metodologia de ciclos de estudo e o nosso sistema de gamificação RPG.
        </p>
        
        <button
          onClick={() => setForceTour(true)}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-violet-100 hover:bg-violet-200 dark:bg-violet-500/15 dark:hover:bg-violet-500/25 text-violet-700 dark:text-violet-300 rounded-xl font-bold transition-all active:scale-95"
        >
          <Play size={20} fill="currentColor" />
          Fazer o Tour Interativo Novamente
        </button>
      </div>

      {/* Section 1: Método de Ciclos */}
      <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-100 dark:bg-violet-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 dark:opacity-30" />
        
        <div className="flex items-center gap-4 mb-6 relative">
          <div className="w-12 h-12 bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-300 rounded-xl flex items-center justify-center">
            <RefreshCw size={24} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">1. O Método de Ciclos Inteligente</h2>
        </div>
        
        <div className="space-y-4 text-zinc-600 dark:text-zinc-300 leading-relaxed relative">
          <p>
            Esqueça o cronograma tradicional de "Segunda é dia de Matemática, Terça é História". O método de ciclos funciona como uma <strong>roda contínua de disciplinas</strong> adaptável a imprevistos.
          </p>
          <ul className="space-y-3 mt-4">
            <li className="flex items-start gap-3">
              <Target className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
              <span><strong>Múltiplos Ciclos:</strong> Você pode criar um ciclo para "Concurso" e outro para "Faculdade" e alternar entre eles sem perder o progresso.</span>
            </li>
            <li className="flex items-start gap-3">
              <Target className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
              <span><strong>Pesos e Fila (Round-Robin):</strong> Se você configurar "Português" com peso 2 e "Inglês" com peso 1, Português aparecerá duas vezes na rodada antes do ciclo reiniciar!</span>
            </li>
            <li className="flex items-start gap-3">
              <Target className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
              <span><strong>Cronômetro Persistente e Adiar:</strong> Fechou a aba no meio dos estudos? O cronômetro continua de onde parou matematicamente! Precisou pular a matéria? Clique em "Adiar" e ela vai para o final da fila sem prejudicar a rodada.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Section 2: RPG e Classes */}
      <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-100 dark:bg-amber-500/15 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 opacity-50 dark:opacity-30" />
        
        <div className="flex items-center gap-4 mb-6 relative">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300 rounded-xl flex items-center justify-center">
            <Sword size={24} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">2. Classes de RPG e Evolução</h2>
        </div>
        
        <div className="space-y-6 text-zinc-600 dark:text-zinc-300 leading-relaxed relative">
          <p>
            Transformamos seu estudo em um jogo. Cada minuto de estudo focado e cada revisão concluída rendem <strong>XP (Pontos de Experiência)</strong>. Acumulando XP, você sobe de Nível.
          </p>
          
          <p>
            A cada 10 níveis, você evolui de <strong>Classe</strong>, mudando seu visual e status no sistema. Confira as classes disponíveis:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {CHARACTER_CLASSES.map((cls, idx) => {
              const Icon = cls.icon;
              const colorClasses = {
                zinc: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700',
                blue: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20',
                orange: 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/20',
                violet: 'bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/20',
                amber: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20',
                emerald: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20',
                red: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/20',
                cyan: 'bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/20',
                fuchsia: 'bg-fuchsia-100 dark:bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-500/20',
                rose: 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/20',
              }[cls.color];

              return (
                <div key={idx} className={`p-4 rounded-2xl border ${colorClasses} flex flex-col items-center text-center gap-2 transition-transform hover:scale-105`}>
                  <Icon size={32} />
                  <h3 className="font-bold text-lg">{cls.name}</h3>
                  <span className="text-sm opacity-80 font-medium">Nível {cls.minLevel} ao {cls.maxLevel === Infinity ? 'Máximo' : cls.maxLevel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 3: Missões Diárias */}
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 rounded-xl flex items-center justify-center">
              <CheckSquare size={24} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">3. Missões Diárias</h2>
          </div>
          
          <div className="space-y-4 text-zinc-600 dark:text-zinc-300 text-sm">
            <p>
              Todos os dias à meia-noite, o sistema gera <strong>3 novas Missões Diárias (Daily Quests)</strong> aleatórias para você cumprir.
            </p>
            <p>
              Essas missões variam entre bater metas de tempo de estudo (ex: 60 minutos), completar X blocos de sessões, ou concluir X revisões. 
            </p>
            <p className="font-bold text-blue-600 dark:text-blue-400 mt-4">
              Cumprir missões é a forma mais rápida de ganhar XP extra e acelerar o nível da sua Classe RPG!
            </p>
          </div>
        </section>

        {/* Section 4: Revisões */}
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 rounded-xl flex items-center justify-center">
              <Brain size={24} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">4. Revisões (Repetição Espaçada)</h2>
          </div>
          
          <div className="space-y-4 text-zinc-600 dark:text-zinc-300 text-sm">
            <p>
              Ao terminar uma sessão, o sistema agenda automaticamente uma revisão para as próximas 24h.
            </p>
            <p>
              Quando a revisão aparece, você avalia o quão difícil foi lembrar o conteúdo. O botão atualiza o card na hora:
            </p>
            <ul className="space-y-2 mt-2 font-medium">
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Fácil: Volta daqui a 7 dias (XP menor)</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Médio: Volta daqui a 3 dias (XP normal)</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Difícil: Volta amanhã (XP bônus de incentivo)</li>
            </ul>
          </div>
        </section>

        {/* Section 5: Ofensiva */}
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/15 text-orange-500 dark:text-orange-300 rounded-xl flex items-center justify-center">
              <Flame size={24} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">5. Ofensiva (Streaks)</h2>
          </div>
          
          <div className="space-y-4 text-zinc-600 dark:text-zinc-300 text-sm">
            <p>
              O número de dias consecutivos que você estuda é a sua <strong>Ofensiva</strong>. 
            </p>
            <p>
              Estudar todos os dias mantém a chama acesa. Se você pular um dia inteiro sem fazer nenhuma sessão de estudo ou revisão, sua ofensiva zera e volta para o 0.
            </p>
            <p className="font-bold text-orange-600 mt-4">
              Mantenha o ritmo para criar o hábito!
            </p>
          </div>
        </section>

        {/* Section 6: A Maldição da Inatividade */}
        <section className="bg-red-50 dark:bg-red-950/20 p-8 rounded-3xl border border-red-200 dark:border-red-900/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-200 dark:bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 dark:opacity-30" />
          
          <div className="flex items-center gap-4 mb-6 relative">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center shadow-inner">
              <Skull size={24} />
            </div>
            <h2 className="text-xl font-bold text-red-900 dark:text-red-200">6. Maldição da Inatividade</h2>
          </div>
          
          <div className="space-y-4 text-red-800/80 dark:text-red-200/70 text-sm relative">
            <p>
              Os deuses do conhecimento recompensam o esforço, mas punem a preguiça. Quando você atinge a elite (<strong>Classe Mestre ou Nível 40+</strong>), o sistema de estudos exige consistência para manter seu posto.
            </p>
            <ul className="space-y-2 mt-2 font-medium bg-red-100/50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200/50 dark:border-red-800/30">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span> <strong>A Tolerância:</strong> Você pode ficar até 3 dias seguidos sem estudar ou revisar nada.</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span> <strong>A Punição:</strong> A partir do 4º dia, você perde <strong>100 XP</strong> por cada dia de inatividade.</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span> <strong>Queda de Classe:</strong> Se você perder muito XP, pode acabar voltando de nível e caindo de Classe!</li>
            </ul>
            <p className="pt-2 font-bold text-red-700 dark:text-red-400">
              Não abandone sua jornada. O topo é apenas para os consistentes!
            </p>
          </div>
        </section>

        {/* Section 7: Estatísticas Avançadas */}
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-fuchsia-100 dark:bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 rounded-xl flex items-center justify-center">
              <Activity size={24} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">7. Estatísticas & Modo Escuro</h2>
          </div>
          
          <div className="space-y-4 text-zinc-600 dark:text-zinc-300 text-sm">
            <p>
              Acompanhe seu desempenho detalhado na aba <strong>Estatísticas</strong>.
            </p>
            <ul className="space-y-2 mt-2 font-medium">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 mt-1.5 shrink-0"></span> <strong>Gráficos:</strong> Veja barras de tempo (7 dias) e pizza de distribuição.</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 mt-1.5 shrink-0"></span> <strong>Radar de Força:</strong> Gráfico de "Teia" que mede a proficiência das suas matérias baseado em horas e revisões.</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 mt-1.5 shrink-0"></span> <strong>Mapa de Calor:</strong> Grid verde ao estilo GitHub para acompanhar sua consistência nos últimos 6 meses.</li>
            </ul>
            <p className="pt-2 flex items-center gap-2">
              <Moon size={16} className="text-fuchsia-500" />
              Toda a interface suporta <strong>Modo Escuro profundo</strong> (Dark Mode) para proteger seus olhos à noite.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
