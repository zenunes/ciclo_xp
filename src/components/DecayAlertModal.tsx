import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Flame, ShieldAlert } from 'lucide-react';
import { useStudyStore } from '../store/useStudyStore';

export function DecayAlertModal() {
  const { decayAlertData, closeDecayAlert } = useStudyStore();

  if (!decayAlertData?.show) return null;

  const droppedLevel = decayAlertData.newLevel < decayAlertData.oldLevel;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-red-950/80 backdrop-blur-sm"
          onClick={closeDecayAlert}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-zinc-950 border border-red-900/50 shadow-2xl rounded-3xl p-8 max-w-md w-full text-center overflow-hidden"
        >
          {/* Fundo avermelhado brilhante */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/20 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-red-950 border border-red-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-pulse">
              <Skull size={40} className="text-red-500 drop-shadow-md" />
            </div>

            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">A Maldição da Inatividade</h2>
            
            <p className="text-red-200/80 mb-6 text-lg leading-relaxed">
              Os deuses do conhecimento estão decepcionados. Você ficou <strong className="text-white">{decayAlertData.daysInactive} dias</strong> inativo.
            </p>

            <div className="bg-red-950/50 border border-red-900/50 rounded-2xl p-4 w-full mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-300/70 font-medium">XP Perdido</span>
                <span className="text-xl font-bold text-red-500 flex items-center gap-1">
                  -<Flame size={16} /> {decayAlertData.lostXp} XP
                </span>
              </div>
              
              {droppedLevel && (
                <div className="flex items-center justify-between pt-2 border-t border-red-900/30 mt-2">
                  <span className="text-red-300/70 font-medium">Queda de Nível</span>
                  <span className="text-lg font-bold text-red-400 flex items-center gap-1">
                    Lv. {decayAlertData.oldLevel} ➔ Lv. {decayAlertData.newLevel}
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-red-400/60 mb-8 italic">
              "Apenas os consistentes permanecem no topo. Volte aos estudos para reacender sua chama."
            </p>

            <button
              onClick={closeDecayAlert}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] flex items-center justify-center gap-2"
            >
              <ShieldAlert size={20} />
              Aceitar Punição e Retomar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}