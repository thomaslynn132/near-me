import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import MapPage from '@/features/map/MapPage';
import ChatPage from '@/features/chat/ChatPage';
import MatchesPage from '@/features/matches/MatchesPage';
import FriendsPage from '@/features/friends/FriendsPage';
import ProfilePage from '@/features/profile/ProfilePage';
import FeedPage from '@/features/feed/FeedPage';
import { Map, MessageCircle, Heart, Users, User, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = window.location.pathname;

  const navItems = [
    { href: '/app/feed', icon: Newspaper, label: 'Feed' },
    { href: '/app/map', icon: Map, label: 'Map' },
    { href: '/app/matches', icon: Heart, label: 'Matches' },
    { href: '/app/chat', icon: MessageCircle, label: 'Chat' },
    { href: '/app/friends', icon: Users, label: 'Friends' },
    { href: '/app/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-1 overflow-hidden">{children}</div>
      <nav className="h-16 bg-surface border-t border-border flex items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all',
                isActive ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-slate-300'
              )}
            >
              <item.icon className="w-6 h-6" />
            </a>
          );
        })}
      </nav>
    </div>
  );
}

function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth/login"
          element={isAuthenticated ? <Navigate to="/app/map" /> : <LoginPage />}
        />
        <Route
          path="/auth/register"
          element={isAuthenticated ? <Navigate to="/app/map" /> : <RegisterPage />}
        />
        <Route
          path="/app/*"
          element={isAuthenticated ? <AppLayout><Routes><Route path="/feed" element={<FeedPage />} /><Route path="/map" element={<MapPage />} /><Route path="/chat" element={<ChatPage />} /><Route path="/matches" element={<MatchesPage />} /><Route path="/friends" element={<FriendsPage />} /><Route path="/profile" element={<ProfilePage />} /><Route path="*" element={<Navigate to="/app/feed" />} /></Routes></AppLayout> : <Navigate to="/auth/login" />}
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? '/app/map' : '/auth/login'} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
