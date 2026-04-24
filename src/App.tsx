import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Moon, Sun } from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { CycleConfig } from './pages/CycleConfig';
import { StudySession } from './pages/StudySession';
import { Reviews } from './pages/Reviews';
import { Analytics } from './pages/Analytics';
import { Auth } from './pages/Auth';
import { Guide } from './pages/Guide';
import { ProtectedRoute } from './components/ProtectedRoute';
import { supabase } from './lib/supabase';
import { cn } from './lib/utils';
import { OnboardingTour } from './components/OnboardingTour';
import { LevelUpModal } from './components/LevelUpModal';
import { DecayAlertModal } from './components/DecayAlertModal';
import { applyTheme, getPreferredTheme, setStoredTheme, type Theme } from './lib/theme';

function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState<Theme>('light');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navLinkClass = (path: string) => 
    cn(
      "font-medium transition-colors",
      location.pathname === path 
        ? "text-violet-600 border-b-2 border-violet-600 pb-1 dark:text-violet-400 dark:border-violet-400" 
        : "text-zinc-600 hover:text-violet-600 dark:text-zinc-300 dark:hover:text-violet-400"
    );

  useEffect(() => {
    const initial = getPreferredTheme();
    setTheme(initial);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    setStoredTheme(next);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col transition-colors">
      <OnboardingTour />
      <LevelUpModal />
      <DecayAlertModal />
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-violet-600">Ciclos XP</h1>
          <nav className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
            <div className="tour-navigation flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              <Link to="/" className={navLinkClass('/')}>Início</Link>
              <Link to="/config" className={navLinkClass('/config')}>Configurar</Link>
              <Link to="/reviews" className={navLinkClass('/reviews')}>Revisões</Link>
              <Link to="/analytics" className={navLinkClass('/analytics')}>Estatísticas</Link>
              <Link to="/guide" className={navLinkClass('/guide')}>Guia</Link>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={toggleTheme}
                className="p-2 text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Auth />} />
        
        {/* Rotas Protegidas */}
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/config" element={<ProtectedRoute><Layout><CycleConfig /></Layout></ProtectedRoute>} />
        <Route path="/session" element={<ProtectedRoute><Layout><StudySession /></Layout></ProtectedRoute>} />
        <Route path="/reviews" element={<ProtectedRoute><Layout><Reviews /></Layout></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
        <Route path="/guide" element={<ProtectedRoute><Layout><Guide /></Layout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
