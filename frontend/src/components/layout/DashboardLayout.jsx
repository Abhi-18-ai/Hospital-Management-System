import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { NAV_ITEMS } from '../../utils/navigation';

function pageTitleForPath(pathname) {
  const match = NAV_ITEMS.filter((item) => pathname.startsWith(item.to) && item.to !== '/').sort(
    (a, b) => b.to.length - a.to.length
  )[0];
  if (match) return match.label;
  return pathname === '/' ? 'Dashboard' : 'MediCore';
}

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} title={pageTitleForPath(location.pathname)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
