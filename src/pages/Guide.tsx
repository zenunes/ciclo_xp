import { Book, Shield, Sword, Crown, Sparkles, RefreshCw, Brain, Flame, Target } from 'lucide-react';
import { CHARACTER_CLASSES } from '../lib/rpg';

export function Guide() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Como funciona o Ciclos XP?</h1>
        <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
          Um guia rápido para você entender a metodologia de ciclos de estudo e o nosso sistema de gamificação RPG.
        </p>
      </div>

      {/* Section 1: Método de Ciclos */}
      <section className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
        
        <div className="flex items-center gap-4 mb-6 relative">
          <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center">
            <RefreshCw size={24} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">1. O Método de Ciclos</h2>
        </div>
        
        <div className="space-y-4 text-zinc-600 leading-relaxed relative">
          <p>
            Esqueça o cronograma tradicional de "Segunda é dia de Matemática, Terça é História". O método de ciclos funciona como uma <strong>roda contínua de disciplinas</strong>.
          </p>
          <ul className="space-y-3 mt-4">
            <li className="flex items-start gap-3">
              <Target className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
              <span>Você define a ordem das matérias e o tempo (ou peso) de cada uma.</span>
            </li>
            <li className="flex items-start gap-3">
              <Target className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
              <span>Você estuda a disciplina da vez. Terminou? Passa para a próxima da fila.</span>
            </li>
            <li className="flex items-start gap-3">
              <Target className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
              <span><strong>A maior vantagem:</strong> Se imprevistos acontecerem e você não puder estudar na terça-feira, na quarta você simplesmente continua de onde parou. Sem culpa, sem matérias atrasadas!</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Section 2: RPG e Classes */}
      <section className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 opacity-50" />
        
        <div className="flex items-center gap-4 mb-6 relative">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
            <Sword size={24} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">2. Classes de RPG e Evolução</h2>
        </div>
        
        <div className="space-y-6 text-zinc-600 leading-relaxed relative">
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
                zinc: 'bg-zinc-100 text-zinc-700 border-zinc-200',
                blue: 'bg-blue-100 text-blue-700 border-blue-200',
                orange: 'bg-orange-100 text-orange-700 border-orange-200',
                violet: 'bg-violet-100 text-violet-700 border-violet-200',
                amber: 'bg-amber-100 text-amber-700 border-amber-200',
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
        {/* Section 3: Revisões */}
        <section className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Brain size={24} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Revisões Inteligentes</h2>
          </div>
          
          <div className="space-y-4 text-zinc-600 text-sm">
            <p>
              Ao terminar uma sessão, o sistema agenda automaticamente uma revisão para as próximas 24h.
            </p>
            <p>
              Quando você faz a revisão, você avalia o quão difícil foi lembrar o conteúdo:
            </p>
            <ul className="space-y-2 mt-2 font-medium">
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Fácil: Volta daqui a 7 dias (XP menor)</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Médio: Volta daqui a 3 dias (XP normal)</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Difícil: Volta amanhã (XP bônus)</li>
            </ul>
          </div>
        </section>

        {/* Section 4: Ofensiva */}
        <section className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center">
              <Flame size={24} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Ofensiva (Streaks)</h2>
          </div>
          
          <div className="space-y-4 text-zinc-600 text-sm">
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
      </div>
    </div>
  );
}
