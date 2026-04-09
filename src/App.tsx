import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
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

function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navLinkClass = (path: string) => 
    cn(
      "font-medium transition-colors",
      location.pathname === path 
        ? "text-violet-600 border-b-2 border-violet-600 pb-1" 
        : "text-zinc-600 hover:text-violet-600"
    );

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <OnboardingTour />
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
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
            <button
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-red-500 transition-colors flex-shrink-0"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
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
