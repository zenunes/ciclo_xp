import { useStudyStore } from '../store/useStudyStore';
import { BookOpenCheck, BrainCircuit, BatteryCharging, Zap } from 'lucide-react';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Reviews() {
  const { cycle, reviews, completeReview } = useStudyStore();

  const pendingReviews = reviews.filter((r) => !r.completed);
  const urgentReviews = pendingReviews.filter((r) => isPast(parseISO(r.dueDate)));
  const upcomingReviews = pendingReviews.filter((r) => !isPast(parseISO(r.dueDate)));

  const renderReviewItem = (review: any) => {
    const subject = cycle.subjects.find((s) => s.id === review.subjectId);
    const isUrgent = isPast(parseISO(review.dueDate));

    return (
      <div key={review.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-white border ${isUrgent ? 'border-red-200 shadow-sm' : 'border-zinc-200'} transition-all hover:shadow-md gap-4 sm:gap-0`}>
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: subject?.color || '#94a3b8' }}
          >
            {subject?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-bold text-zinc-900">{subject?.name || 'Tópico Removido'}</p>
            <p className="text-sm text-zinc-500 max-w-[200px] sm:max-w-md truncate">{review.topic}</p>
            <p className={`text-xs font-medium mt-1 ${isUrgent ? 'text-red-500' : 'text-zinc-400'}`}>
              {isUrgent ? 'Atrasada ' : 'Vence '} 
              {formatDistanceToNow(parseISO(review.dueDate), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button 
            onClick={() => completeReview(review.id, 'hard')}
            className="px-3 py-2 flex items-center gap-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all text-xs font-bold"
            title="Difícil (Revisar em 1 dia)"
          >
            <BatteryCharging size={14} /> Difícil
          </button>
          <button 
            onClick={() => completeReview(review.id, 'medium')}
            className="px-3 py-2 flex items-center gap-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all text-xs font-bold"
            title="Médio (Revisar em 3 dias)"
          >
            <BrainCircuit size={14} /> Médio
          </button>
          <button 
            onClick={() => completeReview(review.id, 'easy')}
            className="px-3 py-2 flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold"
            title="Fácil (Revisar em 7 dias)"
          >
            <Zap size={14} /> Fácil
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-zinc-900">Revisões</h1>
        <p className="text-zinc-500 mt-2">Acompanhe seus estudos passados e fixe o conhecimento.</p>
      </div>

      {pendingReviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200 border-dashed">
          <BookOpenCheck className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Tudo em dia!</h2>
          <p className="text-zinc-500 font-medium">Você não tem nenhuma revisão pendente no momento.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Urgent Reviews Section */}
          {urgentReviews.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-zinc-900">Atrasadas</h2>
                <span className="px-2.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                  {urgentReviews.length}
                </span>
              </div>
              <div className="grid gap-4">
                {urgentReviews.map(renderReviewItem)}
              </div>
            </div>
          )}

          {/* Upcoming Reviews Section */}
          {upcomingReviews.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">Próximas</h2>
              <div className="grid gap-4 opacity-80 hover:opacity-100 transition-opacity">
                {upcomingReviews.map(renderReviewItem)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
