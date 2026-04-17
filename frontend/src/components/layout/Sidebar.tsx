import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { Role } from '../../types';
import {
  FiHome, FiUsers, FiMapPin, FiUserCheck, FiClipboard, FiFileText,
  FiDollarSign, FiFile, FiLayout, FiActivity, FiLogOut, FiMenu, FiX, FiShield, FiClock,
} from 'react-icons/fi';
import { useState } from 'react';

const menuItems: Record<string, { label: string; icon: any; path: string }[]> = {
  [Role.SUPER_ADMIN]: [
    { label: 'Dashboard', icon: FiHome, path: '/superadmin/dashboard' },
    { label: 'Users', icon: FiUsers, path: '/superadmin/users' },
    { label: 'Branches', icon: FiMapPin, path: '/superadmin/branches' },
    { label: 'Lab Requests', icon: FiClock, path: '/superadmin/branch-requests' },
    { label: 'Clients', icon: FiUserCheck, path: '/superadmin/clients' },
    { label: 'Test Catalog', icon: FiClipboard, path: '/superadmin/tests' },
    { label: 'Test Orders', icon: FiFileText, path: '/superadmin/orders' },
    { label: 'Lab Reports', icon: FiActivity, path: '/superadmin/reports' },
    { label: 'Invoices', icon: FiDollarSign, path: '/superadmin/invoices' },
    { label: 'Quotations', icon: FiFile, path: '/superadmin/quotations' },
    { label: 'Templates', icon: FiLayout, path: '/superadmin/templates' },
    { label: 'Audit Logs', icon: FiShield, path: '/superadmin/audit-logs' },
  ],
  [Role.ADMIN]: [
    { label: 'Dashboard', icon: FiHome, path: '/admin/dashboard' },
    { label: 'Users', icon: FiUsers, path: '/admin/users' },
    { label: 'Branches', icon: FiMapPin, path: '/admin/branches' },
    { label: 'Clients', icon: FiUserCheck, path: '/admin/clients' },
    { label: 'Test Catalog', icon: FiClipboard, path: '/admin/tests' },
    { label: 'Test Orders', icon: FiFileText, path: '/admin/orders' },
    { label: 'Lab Reports', icon: FiActivity, path: '/admin/reports' },
    { label: 'Invoices', icon: FiDollarSign, path: '/admin/invoices' },
    { label: 'Quotations', icon: FiFile, path: '/admin/quotations' },
    { label: 'Audit Logs', icon: FiShield, path: '/admin/audit-logs' },
  ],
  [Role.EMPLOYEE]: [
    { label: 'Dashboard', icon: FiHome, path: '/employee/dashboard' },
    { label: 'Clients', icon: FiUserCheck, path: '/employee/clients' },
    { label: 'Test Orders', icon: FiFileText, path: '/employee/orders' },
    { label: 'Invoices', icon: FiDollarSign, path: '/employee/invoices' },
    { label: 'Quotations', icon: FiFile, path: '/employee/quotations' },
  ],
  [Role.LAB]: [
    { label: 'Dashboard', icon: FiHome, path: '/lab/dashboard' },
    { label: 'Lab Employees', icon: FiUsers, path: '/lab/users' },
    { label: 'Branch Request', icon: FiMapPin, path: '/lab/branches' },
    { label: 'Patients', icon: FiUserCheck, path: '/lab/clients' },
    { label: 'Test Orders', icon: FiFileText, path: '/lab/orders' },
    { label: 'Lab Reports', icon: FiActivity, path: '/lab/reports' },
    { label: 'Test Catalog', icon: FiClipboard, path: '/lab/tests' },
    { label: 'Templates', icon: FiLayout, path: '/lab/templates' },
  ],
  [Role.LAB_EMP]: [
    { label: 'Dashboard', icon: FiHome, path: '/labemp/dashboard' },
    { label: 'Patients', icon: FiUserCheck, path: '/labemp/clients' },
    { label: 'Test Orders', icon: FiFileText, path: '/labemp/orders' },
    { label: 'Lab Reports', icon: FiActivity, path: '/labemp/reports' },
  ],
  [Role.CLIENT]: [
    { label: 'Dashboard', icon: FiHome, path: '/client/dashboard' },
    { label: 'My Reports', icon: FiActivity, path: '/client/reports' },
    { label: 'My Invoices', icon: FiDollarSign, path: '/client/invoices' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const items = menuItems[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass-card"
        id="sidebar-toggle"
      >
        {collapsed ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-full bg-surface-950/95 backdrop-blur-xl border-r border-surface-800/50
                     flex flex-col z-40 transition-all duration-300
                     ${collapsed ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-64'}`}
        id="sidebar"
      >
        {/* Logo */}
        <div className="p-6 border-b border-surface-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <FiActivity className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">HealthCare</h1>
              <p className="text-xs text-surface-300">Lab Management</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-surface-800/50">
          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
          <p className="text-xs text-primary-400 mt-0.5">{user.role.replace('_', ' ')}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setCollapsed(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                    : 'text-surface-300 hover:text-white hover:bg-surface-800/50'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-surface-800/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium
                       text-red-400 hover:bg-red-500/10 transition-all duration-200"
            id="logout-button"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
