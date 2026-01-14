import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Plus, 
  Users, 
  ChevronLeft,
  ChevronRight,
  Building2,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, current: true },
    { name: 'My Tasks', href: '/my-tasks', icon: CheckSquare, current: false },
    { name: 'Created Tasks', href: '/created-tasks', icon: Plus, current: false },
    { name: 'Team View', href: '/team', icon: Users, current: false },
    ...(user?.role === 'admin' ? [
      { name: 'Teams', href: '/teams', icon: Building2, current: false },
      { name: 'Users', href: '/users', icon: UserCheck, current: false }
    ] : []),
    ...(user?.role === 'manager' || user?.role === 'employee' ? [
      { name: 'Users', href: '/users', icon: UserCheck, current: false }
    ] : []),
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tarefa</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      <nav className="mt-6 px-3">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0 mr-3" />
                {!collapsed && item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}