import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@synergia/types';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Building2,
  Settings,
  X,
  Zap
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clients', icon: Building2 },
  { name: 'Projetos', href: '/projects', icon: FolderOpen },
];

const adminNavigation = [
  { name: 'Usuários', href: '/users', icon: Users, adminOnly: true },
];

export function Sidebar({ open, setOpen }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  
  const showAdminNav = user?.role === UserRole.ADMIN;

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Synergia</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6">
          <div className="px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 transition-colors",
                  location.pathname === item.href
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
                onClick={() => setOpen(false)}
              >
                <item.icon className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  location.pathname === item.href
                    ? "text-blue-700"
                    : "text-gray-400 group-hover:text-gray-500"
                )} />
                {item.name}
              </Link>
            ))}
          </div>

          {showAdminNav && (
            <div className="mt-8">
              <div className="px-6 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Administração
                </h3>
              </div>
              <div className="px-3">
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 transition-colors",
                      location.pathname === item.href
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <item.icon className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      location.pathname === item.href
                        ? "text-blue-700"
                        : "text-gray-400 group-hover:text-gray-500"
                    )} />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}