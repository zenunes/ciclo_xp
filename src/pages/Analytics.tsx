import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useStudyStore } from '../store/useStudyStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subDays, startOfDay, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { Heatmap } from '../components/Heatmap';

export function Analytics() {
  const { cycle } = useStudyStore();
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar o histórico dos últimos 180 dias
      const pastDays = startOfDay(subDays(new Date(), 180));
      
      const { data } = await supabase
        .from('study_history')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', format(pastDays, "yyyy-MM-dd'T'HH:mm:ssXXX"));

      if (data) {
        setHistoryData(data);
      }
      setLoading(false);
    }

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filtrar apenas os últimos 7 dias para os gráficos de barra e pizza
  const sevenDaysAgo = startOfDay(subDays(new Date(), 6));
  const last7DaysData = historyData.filter(entry => parseISO(entry.created_at) >= sevenDaysAgo);

  // 1. Processar dados para o Gráfico de Barras (Tempo estudado por dia - Últimos 7 dias)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      date: d,
      name: format(d, 'EEE', { locale: ptBR }), // ex: 'seg', 'ter'
      minutos: 0,
      fullDate: format(d, 'yyyy-MM-dd')
    };
  });

  last7DaysData.forEach((entry) => {
    const entryDate = format(parseISO(entry.created_at), 'yyyy-MM-dd');
    const dayObj = last7Days.find(d => d.fullDate === entryDate);
    if (dayObj) {
      dayObj.minutos += entry.duration_minutes;
    }
  });

  // 2. Processar dados para o Gráfico de Pizza (Distribuição do tempo por matéria)
  const subjectDistribution: Record<string, { name: string, value: number, color: string }> = {};

  last7DaysData.forEach((entry) => {
    const subject = cycle.subjects.find(s => s.id === entry.subject_id);
    if (subject) {
      if (!subjectDistribution[subject.id]) {
        subjectDistribution[subject.id] = {
          name: subject.name,
          value: 0,
          color: subject.color
        };
      }
      subjectDistribution[subject.id].value += entry.duration_minutes;
    }
  });

  const pieData = Object.values(subjectDistribution).sort((a, b) => b.value - a.value);

  // 3. Processar dados para o Mapa de Calor (Heatmap) - Últimos 180 dias
  const heatmapData = historyData.map(entry => ({
    date: parseISO(entry.created_at),
    minutos: entry.duration_minutes,
  })).reduce((acc, curr) => {
    const existing = acc.find(item => isSameDay(item.date, curr.date));
    if (existing) {
      existing.minutos += curr.minutos;
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, [] as { date: Date; minutos: number }[]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100">Estatísticas</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Analise seu desempenho e distribuição de tempo de estudo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Gráfico de Barras - Últimos 7 Dias */}
        <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-300 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Tempo de Estudo (Últimos 7 dias)</h2>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                />
                <Tooltip 
                    cursor={{ fill: '#f4f4f5' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value} minutos`, 'Tempo']}
                    labelFormatter={(label) => `Dia: ${label}`}
                  />
                <Bar 
                  dataKey="minutos" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={40}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza - Distribuição por Matéria */}
        <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <PieChartIcon size={20} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Distribuição (Últimos 7 dias)</h2>
          </div>

          <div className="h-72 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`${value} minutos`, 'Tempo']}
                    />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-zinc-600 dark:text-zinc-300 font-medium ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                <PieChartIcon size={48} className="mb-4 opacity-20" />
                <p className="font-medium text-center px-8">Complete algumas sessões de estudo para ver sua distribuição de tempo aqui.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mapa de Calor (Heatmap) */}
      <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 flex items-center justify-center">
            <Activity size={20} />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Frequência de Estudos (Últimos 6 meses)</h2>
        </div>
        
        <Heatmap data={heatmapData} />
      </div>
    </div>
  );
}
