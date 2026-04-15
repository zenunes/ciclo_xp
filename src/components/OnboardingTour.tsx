import { useEffect, useState } from 'react';
import { Joyride, type Step, type EventData, STATUS } from 'react-joyride';
import { useStudyStore } from '../store/useStudyStore';
import { useLocation, useNavigate } from 'react-router-dom';

export function OnboardingTour() {
  const { user, setHasSeenTutorial, forceTour, setForceTour } = useStudyStore();
  const [run, setRun] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const steps: Step[] = ([
    {
      target: 'body',
      content: (
        <div className="text-left">
          <h2 className="text-xl font-bold text-violet-600 mb-2">Bem-vindo ao Ciclos XP! 🎉</h2>
          <p className="text-zinc-600">
            Preparamos um tour rápido para você entender como transformar seus estudos em uma jornada épica.
          </p>
        </div>
      ),
      placement: 'center',
      skipBeacon: true,
    },
    {
      target: '.tour-rpg-card',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-zinc-900 mb-1">Seu Personagem</h3>
          <p className="text-sm text-zinc-600">
            Aqui você acompanha o seu progresso. Estude e revise para ganhar XP, subir de nível e evoluir de Classe!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-stats',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-zinc-900 mb-1">Suas Estatísticas</h3>
          <p className="text-sm text-zinc-600">
            Mantenha sua <strong>Ofensiva</strong> estudando todos os dias e não deixe as <strong>Revisões</strong> acumularem!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-next-subject',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-zinc-900 mb-1">O Ciclo de Estudos</h3>
          <p className="text-sm text-zinc-600">
            Esta é a matéria da vez. Terminou de estudar? O sistema automaticamente puxará a próxima da fila. Sem estresse e sem atrasos!
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '.tour-navigation',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-zinc-900 mb-1">Configure seu Ciclo</h3>
          <p className="text-sm text-zinc-600">
            É aqui em cima que você configura suas matérias e acompanha suas métricas. Que tal começar indo em <strong>Configurar</strong>?
          </p>
        </div>
      ),
      placement: 'bottom',
    }
  ] as Step[]).map(step => ({ ...step, showProgress: true, showSkipButton: true }));

  useEffect(() => {
    // Iniciar se forceTour estiver ativado
    if (forceTour) {
      if (location.pathname !== '/') {
        navigate('/'); // Redireciona pra dashboard se tentar forçar o tour fora dela
        const timer = setTimeout(() => setRun(true), 500); // Dá um tempo pra tela carregar
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setRun(true), 100);
        return () => clearTimeout(timer);
      }
    } else if (location.pathname === '/' && user.hasSeenTutorial === false) {
      const timer = setTimeout(() => setRun(true), 100);
      return () => clearTimeout(timer);
    }
  }, [user.hasSeenTutorial, forceTour, location.pathname, navigate]);

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      setForceTour(false); // Reseta o estado forçado
      if (!user.hasSeenTutorial) {
        setHasSeenTutorial(true);
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={handleJoyrideCallback}
      options={{
        primaryColor: '#7c3aed', // violet-600
        textColor: '#27272a', // zinc-800
        backgroundColor: '#ffffff',
        overlayColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1000,
      }}
      styles={{
        tooltip: {
          borderRadius: '16px',
          padding: '20px',
        },
        buttonPrimary: {
          borderRadius: '8px',
          fontWeight: 'bold',
          padding: '8px 16px',
        },
        buttonBack: {
          marginRight: '8px',
          color: '#71717a',
        },
        buttonSkip: {
          color: '#71717a',
          fontWeight: 'medium',
        }
      }}
      locale={{
        back: 'Anterior',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular Tour',
      }}
    />
  );
}
