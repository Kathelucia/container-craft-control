
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Factory,
  BarChart3,
  Package,
  Settings,
  Users,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  LogOut,
  ChevronDown,
  Gauge,
  ShoppingCart,
  FileText
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navigationItems = {
  production_manager: [
    { title: 'Dashboard', url: '/dashboard', icon: Gauge },
    { title: 'Production Workflow', url: '/production', icon: Factory },
    { title: 'Machine Status', url: '/machines', icon: Settings },
    { title: 'Analytics', url: '/analytics', icon: TrendingUp },
    { title: 'Reports', url: '/reports', icon: FileText },
  ],
  machine_operator: [
    { title: 'Dashboard', url: '/dashboard', icon: Gauge },
    { title: 'My Batches', url: '/batches', icon: ClipboardList },
    { title: 'Machine Status', url: '/machines', icon: Settings },
    { title: 'Quality Control', url: '/quality', icon: AlertTriangle },
  ],
  operations_admin: [
    { title: 'Dashboard', url: '/dashboard', icon: Gauge },
    { title: 'Sales & Orders', url: '/orders', icon: ShoppingCart },
    { title: 'Inventory', url: '/inventory', icon: Package },
    { title: 'Employees', url: '/employees', icon: Users },
    { title: 'Reports', url: '/reports', icon: BarChart3 },
  ],
};

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const currentPath = location.pathname;

  if (!profile) return null;

  const items = navigationItems[profile.role] || [];
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400' : 'hover:bg-gray-800/50 text-gray-300 hover:text-white';

  const isCollapsed = state === 'collapsed';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Sidebar className={isCollapsed ? 'w-16' : 'w-64'} collapsible="icon">
      <SidebarContent className="bg-gray-900 border-r border-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <Factory className="h-8 w-8 text-blue-400" />
            {!isCollapsed && (
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  BetaFlow
                </h2>
                <p className="text-xs text-gray-400">Manufacturing System</p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-800">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                  <Avatar className="h-10 w-10 bg-blue-600">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">{profile.full_name}</p>
                    <p className="text-xs text-gray-400">
                      {formatRole(profile.role)}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-gray-800 border-gray-700">
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem onClick={signOut} className="text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 uppercase tracking-wider text-xs">
            {!isCollapsed && 'Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
