import { useEffect } from 'react';
import { useStudyStore, type DailyQuest } from '../store/useStudyStore';
import { CheckCircle, Clock, BookOpen, Zap, Target } from 'lucide-react';

export function DailyMissions() {
  const { dailyQuests, checkDailyQuests } = useStudyStore();

  useEffect(() => {
    checkDailyQuests();
  }, [checkDailyQuests]);

  const getIcon = (type: DailyQuest['type']) => {
    switch (type) {
      case 'study_time': return <Clock size={18} className="text-blue-500" />;
      case 'reviews': return <BookOpen size={18} className="text-emerald-500" />;
      case 'sessions': return <Zap size={18} className="text-amber-500" />;
    }
  };

  const getProgressColor = (type: DailyQuest['type']) => {
    switch (type) {
      case 'study_time': return 'bg-blue-500';
      case 'reviews': return 'bg-emerald-500';
      case 'sessions': return 'bg-amber-500';
    }
  };

  const completedCount = dailyQuests.filter(q => q.completed).length;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 rounded-xl flex items-center justify-center">
            <Target size={20} />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Missões Diárias</h2>
        </div>
        <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold rounded-full">
          {completedCount}/3 concluídas
        </span>
      </div>

      <div className="space-y-4">
        {dailyQuests.map((quest) => {
          const progressPercentage = Math.min(100, (quest.progress / quest.target) * 100);
          
          return (
            <div 
              key={quest.id} 
              className={`p-4 rounded-2xl border transition-all ${
                quest.completed 
                  ? 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 opacity-60' 
                  : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    quest.completed ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-400' : 'bg-zinc-50 dark:bg-zinc-800'
                  }`}>
                    {quest.completed ? <CheckCircle size={18} /> : getIcon(quest.type)}
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${quest.completed ? 'text-zinc-500 dark:text-zinc-400 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {quest.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {quest.progress} / {quest.target} {quest.type === 'study_time' ? 'min' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-black px-2 py-1 rounded-md ${
                    quest.completed 
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-300' 
                      : 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300'
                  }`}>
                    +{quest.xpReward} XP
                  </span>
                </div>
              </div>

              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    quest.completed ? 'bg-zinc-400' : getProgressColor(quest.type)
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
