import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Home, CheckSquare, LogOut } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const signOut = useAuthStore((state) => state.signOut);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                to="/"
                className="flex items-center px-4 text-gray-700 hover:text-blue-600"
              >
                <Home className="h-5 w-5" />
                <span className="ml-2">Dashboard</span>
              </Link>
              <Link
                to="/tasks"
                className="flex items-center px-4 text-gray-700 hover:text-blue-600"
              >
                <CheckSquare className="h-5 w-5" />
                <span className="ml-2">Tasks</span>
              </Link>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 text-gray-700 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-2">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}