import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { useTenant } from '@/contexts/TenantContext';
import { LayoutDashboard, Users, Package, Receipt, Bell, LogOut } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Students', icon: Users, path: '/admin/students' },
  { label: 'Packages', icon: Package, path: '/admin/packages' },
  { label: 'Fee Tracking', icon: Receipt, path: '/admin/fees' },
  { label: 'Bulk Notifications', icon: Bell, path: '/admin/notifications' },
];

const AdminLayout = () => {
  const { isAuthenticated, logout } = useAdmin();
  const { config } = useTenant();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0">
        <div className="p-5 border-b border-border">
          <h2 className="font-bold text-foreground text-lg">{config.instituteName}</h2>
          <p className="text-xs text-muted-foreground">Admin Console</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
