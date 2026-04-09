import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudyStore } from '../store/useStudyStore';
import { Plus, Trash2, Clock, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const COLORS = [
  '#8b5cf6', // violet
  '#ec4899', // fuchsia
  '#f43f5e', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#10b981', // emerald
  '#0ea5e9', // teal
  '#06b6d4', // sky
  '#3b82f6', // blue
];

export function CycleConfig() {
  const { cycle, addSubject, removeSubject, startCycle, stopCycle } = useStudyStore();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    color: COLORS[0],
    durationMinutes: 60,
    weight: 1,
  });

  const handleStartCycle = () => {
    startCycle();
    navigate('/session');
  };

  const handleStopCycle = () => {
    stopCycle();
    navigate('/');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name.trim()) return;

    addSubject(newSubject);
    setNewSubject({ name: '', color: COLORS[Math.floor(Math.random() * COLORS.length)], durationMinutes: 60, weight: 1 });
    setIsAdding(false);
  };

  const totalTime = cycle.subjects.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-zinc-900">Configurar Ciclo</h1>
        <p className="text-zinc-500 mt-2">Defina as disciplinas e o tempo de cada bloco do seu ciclo.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-100 text-zinc-600 rounded-xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Tempo Total do Ciclo</p>
            <p className="text-2xl font-bold text-zinc-900">
              {Math.floor(totalTime / 60)}h {totalTime % 60}m
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="w-full md:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus size={20} />
          Adicionar Disciplina
        </button>
      </div>

      {cycle.subjects.length > 0 && (
        <div className="flex justify-end">
          {cycle.isActive ? (
            <button
              onClick={handleStopCycle}
              className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-bold transition-all active:scale-95"
            >
              Parar Ciclo Atual
            </button>
          ) : (
            <button
              onClick={handleStartCycle}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all active:scale-95"
            >
              Iniciar Ciclo
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="bg-white p-6 rounded-3xl border border-violet-200 shadow-lg relative overflow-hidden"
            onSubmit={handleAdd}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-900">Nova Disciplina</h3>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-zinc-700 mb-2">Nome da Disciplina</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Matemática"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Duração (minutos)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newSubject.durationMinutes}
                  onChange={(e) => setNewSubject({ ...newSubject, durationMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Peso (1 a 10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  required
                  value={newSubject.weight}
                  onChange={(e) => setNewSubject({ ...newSubject, weight: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-zinc-700 mb-2">Cor</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSubject({ ...newSubject, color: c })}
                      className={cn(
                        "w-10 h-10 rounded-full transition-transform active:scale-90 flex items-center justify-center text-white",
                        newSubject.color === c ? "scale-110 ring-4 ring-offset-2 ring-violet-200" : "hover:scale-110"
                      )}
                      style={{ backgroundColor: c }}
                    >
                      {newSubject.color === c && <Check size={20} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold transition-all active:scale-95"
              >
                Salvar
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {cycle.subjects.length === 0 && !isAdding && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-white rounded-3xl border border-zinc-200 border-dashed"
            >
              <p className="text-zinc-500 font-medium">Nenhuma disciplina adicionada ainda.</p>
              <p className="text-zinc-400 text-sm mt-1">Comece adicionando os blocos do seu ciclo.</p>
            </motion.div>
          )}
          
          {cycle.subjects.map((subject, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={subject.id}
              className="bg-white p-4 md:p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4 md:gap-6 group"
            >
              <div className="text-2xl font-black text-zinc-300 w-8 text-center hidden md:block">
                {index + 1}
              </div>
              <div 
                className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-sm"
                style={{ backgroundColor: subject.color }}
              >
                {subject.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-bold text-zinc-900 truncate">{subject.name}</h3>
                <div className="text-zinc-500 text-sm md:text-base flex flex-wrap items-center gap-4 mt-1">
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} />
                    {subject.durationMinutes} minutos
                  </span>
                  {subject.weight && (
                    <span className="flex items-center gap-1.5 bg-violet-100 text-violet-700 px-2 py-0.5 rounded-md font-semibold text-xs md:text-sm">
                      Peso {subject.weight}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeSubject(subject.id)}
                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
              >
                <Trash2 size={20} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
