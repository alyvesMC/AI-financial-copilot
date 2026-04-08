import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Home, List, Sparkles, Target, Settings, LogOut } from 'lucide-react';
import { useContext } from 'react';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Insights from './pages/Insights';
import Goals from './pages/Goals';
import SettingsPage from './pages/Settings';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import axios from 'axios';

// Cross-Platform Deployment Target
const isLocal = import.meta.env.MODE === 'development';
axios.defaults.baseURL = isLocal ? '' : (import.meta.env.VITE_API_URL || 'https://ai-financial-copilot-ckt8.onrender.com');

function ProtectedRoute({ children }) {
  const { token, loading } = useContext(AuthContext);
  if (loading) return null;
  return token ? children : <Navigate to="/login" />;
}

function MainLayout() {
  const { logout } = useContext(AuthContext);
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="mb-8 flex-between">
          <h2 className="gradient-text">Nova</h2>
          <Sparkles className="nav-icon" color="var(--text-main)" />
        </div>
        
        <nav>
          <NavLink to="/dashboard" end className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Home className="nav-icon" /> Dashboard
          </NavLink>
          <NavLink to="/dashboard/transactions" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <List className="nav-icon" /> Transactions
          </NavLink>
          <NavLink to="/dashboard/insights" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Sparkles className="nav-icon" /> AI Insights
          </NavLink>
          <NavLink to="/dashboard/goals" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Target className="nav-icon" /> Goals
          </NavLink>
          <NavLink to="/dashboard/settings" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Settings className="nav-icon" /> Settings
          </NavLink>
        </nav>

        <div className="mt-auto">
          <button onClick={logout} className="nav-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--danger)' }}>
            <LogOut className="nav-icon" /> Logout
          </button>
          <div className="glass-card mt-4" style={{ padding: '16px', background: '#111111', border: 'none' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '4px' }}>Nova Intelligence</h4>
            <p className="text-muted text-small" style={{ lineHeight: '1.4' }}>AI optimizations active.</p>
          </div>
        </div>
      </aside>

      <nav className="mobile-bottom-nav">
        <NavLink to="/dashboard" end className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Home className="nav-icon" />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Home</span>
        </NavLink>
        <NavLink to="/dashboard/transactions" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <List className="nav-icon" />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Ledger</span>
        </NavLink>
        <NavLink to="/dashboard/insights" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Sparkles className="nav-icon" />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>AI</span>
        </NavLink>
        <NavLink to="/dashboard/goals" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Target className="nav-icon" />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Goals</span>
        </NavLink>
        <NavLink to="/dashboard/settings" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings className="nav-icon" />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Profile</span>
        </NavLink>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
