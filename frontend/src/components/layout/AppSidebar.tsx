import { NavLink } from 'react-router-dom';
import { BookOpen, Search, LayoutDashboard, PlusCircle, Users, GraduationCap } from 'lucide-react';
import { useAuth } from '../../providers/auth-provider';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const studentNav: NavItem[] = [
  { to: '/dashboard', label: 'Mis cursos', icon: BookOpen },
  { to: '/courses', label: 'Catálogo', icon: Search },
];

const instructorNav: NavItem[] = [
  { to: '/instructor', label: 'Mi Panel', icon: LayoutDashboard },
  { to: '/instructor/courses', label: 'Mis Cursos', icon: BookOpen },
  { to: '/instructor/courses/new', label: 'Crear Curso', icon: PlusCircle },
];

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Mi Panel', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Usuarios', icon: Users },
  { to: '/admin/courses', label: 'Cursos', icon: GraduationCap },
];

export function AppSidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const navItems = user.role === 'admin' ? adminNav : user.role === 'instructor' ? instructorNav : studentNav;

  return (
    <aside className="hidden lg:flex lg:w-56 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-gray-50 dark:lg:border-gray-700 dark:lg:bg-gray-900">
      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to !== '/dashboard' && item.to !== '/instructor' && item.to !== '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
