import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ImpersonationBanner } from './ImpersonationBanner';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-surface-950">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen flex flex-col">
        <ImpersonationBanner />
        <div className="p-6 lg:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
