import { useStudyStore } from '../store/useStudyStore';
import { Play, Clock, BookOpenCheck, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getCurrentClass, getLevelProgress } from '../lib/rpg';
import { DailyMissions } from '../components/DailyMissions';

export function Dashboard() {
  const { user, cycle, reviews } = useStudyStore();
  const navigate = useNavigate();

  const nextSubjectId = cycle.queue[cycle.currentIndex];
  const nextSubject = cycle.subjects.find(s => s.id === nextSubjectId);
  const pendingReviews = reviews.filter((r) => !r.completed);
  const urgentReviews = pendingReviews.filter((r) => isPast(parseISO(r.dueDate)));

  const currentClass = getCurrentClass(user.level);
  const progress = getLevelProgress(user.xp, user.level);
  const ClassIcon = currentClass.icon;

  const colorStyles = {
    zinc: 'from-zinc-800 to-zinc-900 border-zinc-700',
    blue: 'from-blue-800 to-blue-900 border-blue-700',
    orange: 'from-orange-800 to-orange-900 border-orange-700',
    violet: 'from-violet-800 to-violet-900 border-violet-700',
    amber: 'from-amber-800 to-amber-900 border-amber-700',
    emerald: 'from-emerald-800 to-emerald-900 border-emerald-700',
    red: 'from-red-800 to-red-900 border-red-700',
    cyan: 'from-cyan-800 to-cyan-900 border-cyan-700',
    fuchsia: 'from-fuchsia-800 to-fuchsia-900 border-fuchsia-700',
    rose: 'from-rose-800 to-rose-900 border-rose-700',
  };

  const progressColors = {
    zinc: 'bg-zinc-400',
    blue: 'bg-blue-400',
    orange: 'bg-orange-400',
    violet: 'bg-violet-400',
    amber: 'bg-amber-400',
    emerald: 'bg-emerald-400',
    red: 'bg-red-400',
    cyan: 'bg-cyan-400',
    fuchsia: 'bg-fuchsia-400',
    rose: 'bg-rose-400',
  };

  const glowColors = {
    zinc: 'from-zinc-400/20',
    blue: 'from-blue-400/20',
    orange: 'from-orange-400/20',
    violet: 'from-violet-400/20',
    amber: 'from-amber-400/20',
    emerald: 'from-emerald-400/20',
    red: 'from-red-400/20',
    cyan: 'from-cyan-400/20',
    fuchsia: 'from-fuchsia-400/20',
    rose: 'from-rose-400/20',
  };

  return (
    <div className="space-y-8">
      {/* RPG Character Card */}
      <div className={`tour-rpg-card relative overflow-hidden rounded-3xl p-8 border shadow-lg bg-gradient-to-br ${colorStyles[currentClass.color]}`}>
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${glowColors[currentClass.color]} to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
        
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
            <ClassIcon size={40} className="text-white" />
          </div>
          
          <div className="flex-1 w-full text-center md:text-left">
            <p className="text-white/60 font-medium mb-1">Classe Atual</p>
            <h1 className="text-3xl font-black text-white mb-2">
              {currentClass.name} <span className="text-white/40 text-2xl font-medium">Lv. {user.level}</span>
            </h1>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm font-medium text-white/80 mb-2">
                <span>{user.xp} XP Total</span>
                <span>Faltam {progress.xpRemaining} XP para o Nível {user.level + 1}</span>
              </div>
              <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${progressColors[currentClass.color]}`}
                  style={{ width: `${progress.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="tour-stats grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/15 text-orange-500 dark:text-orange-300 rounded-xl flex items-center justify-center">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Ofensiva</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{user.currentStreak || 0} dias</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 rounded-xl flex items-center justify-center">
            <BookOpenCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Revisões Pendentes</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{pendingReviews.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 rounded-xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total de Disciplinas</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{cycle.subjects.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Next Subject Card */}
          <div className="tour-next-subject bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 relative">Próximo no Ciclo</h2>
            
            {nextSubject ? (
              <div className="relative">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white font-bold text-xl shadow-lg"
                  style={{ backgroundColor: nextSubject.color }}
                >
                  {nextSubject.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2">{nextSubject.name}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-8 flex items-center gap-2">
                  <Clock size={18} />
                  Meta de {nextSubject.durationMinutes} minutos
                  {nextSubject.weight && (
                    <span className="bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-md font-semibold text-xs">
                      Peso {nextSubject.weight}
                    </span>
                  )}
                </p>
                
                <button
                  onClick={() => navigate('/session')}
                  className="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Play fill="currentColor" size={20} />
                  Iniciar Sessão
                </button>
              </div>
            ) : (
              <div className="relative text-center py-8">
                <p className="text-zinc-500 dark:text-zinc-400 mb-6">Nenhum ciclo ativo no momento.</p>
                <button
                  onClick={() => navigate('/config')}
                  className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-all active:scale-95"
                >
                  Configurar Ciclo
                </button>
              </div>
            )}
          </div>

          {/* Urgent Reviews */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Revisões Urgentes</h2>
              <span className="px-3 py-1 bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-300 text-xs font-bold rounded-full">
                {urgentReviews.length} atrasadas
              </span>
            </div>

            <div className="space-y-4">
              {urgentReviews.slice(0, 4).map((review) => {
                const subject = cycle.subjects.find((s) => s.id === review.subjectId);
                return (
                  <div key={review.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: subject?.color || '#94a3b8' }}
                      >
                        {subject?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">{subject?.name || 'Tópico Removido'}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">{review.topic}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-red-500 mb-1">
                        {formatDistanceToNow(parseISO(review.dueDate), { addSuffix: true, locale: ptBR })}
                      </p>
                      <button 
                        onClick={() => navigate('/reviews')}
                        className="text-sm font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                      >
                        Revisar
                      </button>
                    </div>
                  </div>
                );
              })}

              {urgentReviews.length === 0 && (
                <div className="text-center py-12">
                  <BookOpenCheck className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium">Tudo em dia! Você não tem revisões atrasadas.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Daily Missions Sidebar */}
        <div className="lg:col-span-1">
          <DailyMissions />
        </div>
      </div>
    </div>
  );
}
