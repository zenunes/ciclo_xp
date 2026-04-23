import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudyStore } from '../store/useStudyStore';
import { Plus, Trash2, Clock, Check, X, Edit2, LayoutList, CheckCircle2 } from 'lucide-react';
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
  const { cycle, cycles, selectedCycleId, createCycle, updateCycle, deleteCycle, selectCycle, addSubject, removeSubject, updateSubject, startCycle, stopCycle } = useStudyStore();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingCycle, setIsAddingCycle] = useState(false);
  const [newCycleName, setNewCycleName] = useState('');
  const [editingCycleId, setEditingCycleId] = useState<string | null>(null);
  const [editingCycleName, setEditingCycleName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState<{
    name: string;
    color: string;
    durationMinutes: number | string;
    weight: number | string;
  }>({
    name: '',
    color: COLORS[0],
    durationMinutes: 60,
    weight: 1,
  });

  const handleStartCycle = () => {
    startCycle();
    localStorage.removeItem('ciclos_xp_current_timer'); // Clear timer when starting new cycle
    navigate('/session');
  };

  const handleStopCycle = () => {
    stopCycle();
    localStorage.removeItem('ciclos_xp_current_timer'); // Clear timer when stopping
    navigate('/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name.trim()) return;

    const duration = typeof newSubject.durationMinutes === 'number' ? newSubject.durationMinutes : parseInt(newSubject.durationMinutes as string) || 60;
    const weight = typeof newSubject.weight === 'number' ? newSubject.weight : parseInt(newSubject.weight as string) || 1;

    if (editId) {
      updateSubject(editId, {
        name: newSubject.name,
        color: newSubject.color,
        durationMinutes: duration,
        weight: weight
      });
      setEditId(null);
    } else {
      addSubject({
        name: newSubject.name,
        color: newSubject.color,
        durationMinutes: duration,
        weight: weight
      });
    }
    
    setNewSubject({ name: '', color: COLORS[Math.floor(Math.random() * COLORS.length)], durationMinutes: 60, weight: 1 });
    setIsAdding(false);
  };

  const handleEdit = (subject: any) => {
    setNewSubject({
      name: subject.name,
      color: subject.color,
      durationMinutes: subject.durationMinutes,
      weight: subject.weight || 1,
    });
    setEditId(subject.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditId(null);
    setNewSubject({ name: '', color: COLORS[Math.floor(Math.random() * COLORS.length)], durationMinutes: 60, weight: 1 });
  };

  const handleAddClick = () => {
    setEditId(null);
    setNewSubject({ name: '', color: COLORS[Math.floor(Math.random() * COLORS.length)], durationMinutes: 60, weight: 1 });
    setIsAdding(true);
  };

  const handleAddCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCycleName.trim()) return;
    await createCycle(newCycleName.trim());
    setNewCycleName('');
    setIsAddingCycle(false);
  };

  const handleUpdateCycle = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editingCycleName.trim()) return;
    await updateCycle(id, editingCycleName.trim());
    setEditingCycleId(null);
  };

  const activeCycleConfig = cycles.find(c => c.id === selectedCycleId);
  const subjectsToDisplay = activeCycleConfig?.subjects || [];
  const totalTime = subjectsToDisplay.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100">Configurar Ciclo</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Gerencie seus ciclos de estudo e disciplinas.</p>
      </div>

      {/* Ciclos Selector */}
      <div className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <LayoutList size={20} />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Seus Ciclos</h2>
          </div>
          <button
            onClick={() => setIsAddingCycle(true)}
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <Plus size={16} />
            Novo Ciclo
          </button>
        </div>

        {/* List of Cycles */}
        <div className="flex flex-wrap gap-2">
          {cycles.map(c => (
            <div key={c.id} className="relative group">
              {editingCycleId === c.id ? (
                <form onSubmit={(e) => handleUpdateCycle(e, c.id)} className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <input
                    type="text"
                    value={editingCycleName}
                    onChange={e => setEditingCycleName(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-sm font-medium text-zinc-900 dark:text-zinc-100 w-32"
                    autoFocus
                    onBlur={() => setEditingCycleId(null)}
                  />
                </form>
              ) : (
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all cursor-pointer",
                  selectedCycleId === c.id 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                )}
                onClick={() => selectCycle(c.id)}
                >
                  {cycle.activeCycleId === c.id && <CheckCircle2 size={16} className="text-emerald-400" title="Ciclo em andamento" />}
                  {c.name}
                  
                  {selectedCycleId === c.id && (
                    <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCycleName(c.name);
                          setEditingCycleId(c.id);
                        }}
                        className="p-1 hover:bg-white/20 rounded-md transition-colors"
                        title="Renomear Ciclo"
                      >
                        <Edit2 size={14} />
                      </button>
                      {cycles.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Tem certeza que deseja excluir este ciclo e todas as suas matérias?')) {
                              deleteCycle(c.id);
                            }
                          }}
                          className="p-1 hover:bg-red-500/80 rounded-md transition-colors"
                          title="Excluir Ciclo"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {isAddingCycle && (
            <motion.form
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              onSubmit={handleAddCycle}
              className="mt-4 flex items-center gap-2 overflow-hidden"
            >
              <input
                type="text"
                placeholder="Nome do novo ciclo..."
                value={newCycleName}
                onChange={e => setNewCycleName(e.target.value)}
                className="flex-1 px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                autoFocus
              />
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-colors">
                Salvar
              </button>
              <button type="button" onClick={() => setIsAddingCycle(false)} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                <X size={20} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tempo Total do Ciclo</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {Math.floor(totalTime / 60)}h {totalTime % 60}m
            </p>
          </div>
        </div>
        <button
          onClick={handleAddClick}
          className="w-full md:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus size={20} />
          Adicionar Disciplina
        </button>
      </div>

      {subjectsToDisplay.length > 0 && (
        <div className="flex justify-end">
          {cycle.isActive && cycle.activeCycleId === selectedCycleId ? (
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
              Iniciar Ciclo "{activeCycleConfig?.name}"
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
            className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-violet-200 dark:border-zinc-800 shadow-lg relative overflow-hidden"
            onSubmit={handleSubmit}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{editId ? 'Editar Disciplina' : 'Nova Disciplina'}</h3>
              <button 
                type="button" 
                onClick={handleCancel}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Nome da Disciplina</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Matemática"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Duração (minutos)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newSubject.durationMinutes}
                  onChange={(e) => setNewSubject({ ...newSubject, durationMinutes: e.target.value === '' ? '' : Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Peso (1 a 10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  required
                  value={newSubject.weight}
                  onChange={(e) => setNewSubject({ ...newSubject, weight: e.target.value === '' ? '' : Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Cor</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSubject({ ...newSubject, color: c })}
                      className={cn(
                        "w-10 h-10 rounded-full transition-transform active:scale-90 flex items-center justify-center text-white",
                        newSubject.color === c ? "scale-110 ring-4 ring-offset-2 ring-violet-200 dark:ring-zinc-700 dark:ring-offset-zinc-900" : "hover:scale-110"
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
                className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold transition-all active:scale-95 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900"
              >
                {editId ? 'Salvar Alterações' : 'Salvar'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {subjectsToDisplay.length === 0 && !isAdding && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 border-dashed"
            >
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">Nenhuma disciplina neste ciclo ainda.</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">Comece adicionando os blocos do seu ciclo.</p>
            </motion.div>
          )}
          
          {subjectsToDisplay.map((subject, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={subject.id}
              className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 md:gap-6 group"
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
                <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 truncate">{subject.name}</h3>
                <div className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base flex flex-wrap items-center gap-4 mt-1">
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} />
                    {subject.durationMinutes} minutos
                  </span>
                  {subject.weight && (
                    <span className="flex items-center gap-1.5 bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-md font-semibold text-xs md:text-sm">
                      Peso {subject.weight}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleEdit(subject)}
                  className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/15 text-violet-500 dark:text-violet-300 flex items-center justify-center hover:bg-violet-100 dark:hover:bg-violet-500/25 hover:text-violet-600 dark:hover:text-violet-200 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Editar Disciplina"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => removeSubject(subject.id)}
                  className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/15 text-red-500 dark:text-red-300 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/25 hover:text-red-600 dark:hover:text-red-200 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Excluir Disciplina"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
