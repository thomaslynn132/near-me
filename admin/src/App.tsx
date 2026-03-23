import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import DashboardPage from '@/features/dashboard/DashboardPage';
import UsersPage from '@/features/users/UsersPage';
import MatchesPage from '@/features/matches/MatchesPage';
import ReportsPage from '@/features/reports/ReportsPage';
import AdminLoginPage from '@/features/auth/AdminLoginPage';
import { Users, Heart, AlertTriangle, LogOut, User } from 'lucide-react';

function AdminLayout({ children, onLogout }: { children: React.ReactNode; onLogout: () => void }) {
  const location = window.location.pathname;
  
  const navItems = [
    { href: '/admin', icon: Users, label: 'Dashboard' },
    { href: '/admin/users', icon: User, label: 'Users' },
    { href: '/admin/matches', icon: Heart, label: 'Matches' },
    { href: '/admin/reports', icon: AlertTriangle, label: 'Reports' },
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <nav className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-slate-800">NearMe Admin</h1>
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  location === item.href
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-red-600 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </nav>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('adminToken');
  });

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/login"
          element={
            isAuthenticated ? <Navigate to="/admin" replace /> : <AdminLoginPage onLogin={() => setIsAuthenticated(true)} />
          }
        />
        <Route
          path="/admin/*"
          element={
            isAuthenticated ? (
              <AdminLayout onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/matches" element={<MatchesPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                </Routes>
              </AdminLayout>
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
