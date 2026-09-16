import { NavLink } from 'react-router-dom';
import { Cross } from 'lucide-react';
import clsx from '../../utils/clsx';
import { useAuth } from '../../context/AuthContext';
import { hasRole } from '../../utils/roles';
import { NAV_ITEMS } from '../../utils/navigation';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const visibleItems = NAV_ITEMS.filter((item) => hasRole(user?.role, item.roles));

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-ink-900/40 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-950 text-brand-50 transition-transform lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500">
            <Cross className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none tracking-tight">MediCore</p>
            <p className="text-[11px] leading-none text-brand-300 mt-1">Hospital Management</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-brand-500 text-white' : 'text-brand-100 hover:bg-brand-900'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-brand-900 px-5 py-4 text-xs text-brand-300">
          Signed in as <span className="font-medium text-brand-100">{user?.role?.replace('_', ' ')}</span>
        </div>
      </aside>
    </>
  );
}
