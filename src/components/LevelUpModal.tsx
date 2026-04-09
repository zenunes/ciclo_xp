import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useStudyStore } from '../store/useStudyStore';
import { getCurrentClass } from '../lib/rpg';
import { Trophy, X } from 'lucide-react';

export function LevelUpModal() {
  const { levelUpData, closeLevelUpModal } = useStudyStore();

  useEffect(() => {
    if (levelUpData?.show) {
      // Disparar confetes ao exibir o modal
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [levelUpData?.show]);

  if (!levelUpData?.show) return null;

  const newClass = getCurrentClass(levelUpData.newLevel);
  const oldClass = getCurrentClass(levelUpData.oldLevel);
  const isClassUp = newClass.name !== oldClass.name;
  
  const ClassIcon = newClass.icon;

  const colorStyles = {
    zinc: 'from-zinc-500 to-zinc-700',
    blue: 'from-blue-500 to-blue-700',
    orange: 'from-orange-500 to-orange-700',
    violet: 'from-violet-500 to-violet-700',
    amber: 'from-amber-500 to-amber-700',
    emerald: 'from-emerald-500 to-emerald-700',
    red: 'from-red-500 to-red-700',
    cyan: 'from-cyan-500 to-cyan-700',
    fuchsia: 'from-fuchsia-500 to-fuchsia-700',
    rose: 'from-rose-500 to-rose-700',
  };

  const textColor = {
    zinc: 'text-zinc-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    violet: 'text-violet-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
    red: 'text-red-600',
    cyan: 'text-cyan-600',
    fuchsia: 'text-fuchsia-600',
    rose: 'text-rose-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-sm relative overflow-hidden transform animate-in zoom-in-95 duration-500">
        
        {/* Header Decorativo */}
        <div className={`h-32 bg-gradient-to-br ${colorStyles[newClass.color]} relative flex items-center justify-center`}>
          <div className="absolute inset-0 bg-white/20 pattern-grid opacity-50"></div>
          <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-xl translate-y-12 border-4 border-white dark:border-zinc-900 z-10 relative">
            <ClassIcon size={40} className={`${textColor[newClass.color]} drop-shadow-md`} />
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 w-8 h-8 rounded-full flex items-center justify-center font-black border-2 border-white shadow-sm">
              {levelUpData.newLevel}
            </div>
          </div>
        </div>

        {/* Botão Fechar */}
        <button 
          onClick={closeLevelUpModal}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full p-1"
        >
          <X size={20} />
        </button>

        {/* Corpo do Modal */}
        <div className="pt-16 pb-8 px-6 text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2 text-amber-500 font-bold tracking-wider uppercase text-sm">
            <Trophy size={16} />
            <span>Level Up!</span>
          </div>
          
          <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-2">
            Nível {levelUpData.newLevel}
          </h2>
          
          {isClassUp ? (
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
              Incrível! Você evoluiu para a classe <br/>
              <strong className={`${textColor[newClass.color]} text-xl`}>{newClass.name}</strong>
            </p>
          ) : (
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
              Você está ficando mais forte. Continue evoluindo na jornada de <strong className="text-zinc-800 dark:text-zinc-200">{newClass.name}</strong>.
            </p>
          )}

          <button 
            onClick={closeLevelUpModal}
            className={`mt-8 w-full py-4 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-95 bg-gradient-to-r ${colorStyles[newClass.color]}`}
          >
            Continuar Jornada
          </button>
        </div>
      </div>
    </div>
  );
}
