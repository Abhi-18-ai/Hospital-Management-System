import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User as UserIcon, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../utils/roles';
import toast from 'react-hot-toast';

export default function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink-200 bg-white px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-ink-500 hover:bg-ink-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-ink-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/notifications')}
          className="rounded-md p-2 text-ink-500 hover:bg-ink-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div
          onClick={() => navigate('/settings')}
          className="hidden cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-ink-100 sm:flex"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-ink-800">{user?.name}</p>
            <p className="text-xs text-ink-400">{ROLE_LABELS[user?.role] || user?.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}
