import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HeatmapProps {
  data: { date: Date; minutos: number }[];
}

export function Heatmap({ data }: HeatmapProps) {
  const endDate = new Date();
  const startDate = subDays(endDate, 180); // Últimos 6 meses
  
  const gridStart = startOfWeek(startDate);
  const gridEnd = endOfWeek(endDate);
  const gridDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const getColor = (minutes: number) => {
    if (minutes === 0) return 'bg-zinc-100 dark:bg-zinc-800/50';
    if (minutes < 30) return 'bg-violet-200 dark:bg-violet-900/40';
    if (minutes < 60) return 'bg-violet-300 dark:bg-violet-800/60';
    if (minutes < 120) return 'bg-violet-400 dark:bg-violet-700/80';
    return 'bg-violet-500 dark:bg-violet-500';
  };

  const dayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
      <div className="min-w-[700px] flex gap-2">
        {/* Labels dos dias da semana */}
        <div className="grid grid-rows-7 gap-1 text-xs text-zinc-400 dark:text-zinc-500 font-medium py-1">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-3 flex items-center justify-center">{i % 2 === 0 ? label : ''}</div>
          ))}
        </div>

        {/* Grid de Contribuições */}
        <div className="grid grid-rows-7 grid-flow-col gap-1 flex-1">
          {gridDays.map((day, i) => {
            const record = data.find(d => isSameDay(d.date, day));
            const minutes = record ? record.minutos : 0;
            const isFuture = day > endDate;

            if (isFuture) {
              return <div key={i} className="w-3 h-3 rounded-sm opacity-0" />;
            }

            return (
              <div
                key={i}
                className={`w-3 h-3 rounded-sm transition-colors ${getColor(minutes)} group relative`}
              >
                {/* Tooltip nativo via Tailwind (aparece no hover) */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {minutes === 0 ? 'Nenhum estudo' : `${minutes} min`} em {format(day, "dd 'de' MMM", { locale: ptBR })}
                  {/* Setinha do tooltip */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-100"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
        <span>Menos</span>
        <div className="flex gap-1">
          {[0, 15, 45, 90, 150].map((val, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${getColor(val)}`} />
          ))}
        </div>
        <span>Mais</span>
      </div>
    </div>
  );
}
