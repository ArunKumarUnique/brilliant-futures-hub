import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { useTenant } from '@/contexts/TenantContext';
import { LayoutDashboard, Users, Package, Receipt, Bell, LogOut, PanelLeftClose, PanelLeft, FileImage, ClipboardCheck, BookOpen, Calendar, Lightbulb, MessageSquareText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Students', icon: Users, path: '/admin/students' },
  { label: 'Attendance', icon: ClipboardCheck, path: '/admin/attendance' },
  { label: 'Homework', icon: BookOpen, path: '/admin/homework' },
  { label: 'Daily Learnings', icon: Lightbulb, path: '/admin/daily-learnings' },
  { label: 'Message Generator', icon: MessageSquareText, path: '/admin/messages' },
  { label: 'Timetable', icon: Calendar, path: '/admin/timetable' },
  { label: 'Packages', icon: Package, path: '/admin/packages' },
  { label: 'Fee Tracking', icon: Receipt, path: '/admin/fees' },
  { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
  { label: 'Brochure Builder', icon: FileImage, path: '/admin/brochure-builder' },
];

const SidebarNav = ({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) => {
  const { logout } = useAdmin();
  const { config } = useTenant();
  const location = useLocation();

  return (
    <>
      <div className={`p-4 border-b border-border ${collapsed ? 'text-center' : ''}`}>
        {collapsed ? (
          <span className="font-bold text-foreground text-lg">{config.instituteName.charAt(0)}</span>
        ) : (
          <>
            <h2 className="font-bold text-foreground text-lg truncate">{config.instituteName}</h2>
            <p className="text-xs text-muted-foreground">Admin Console</p>
          </>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={() => logout()}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );
};

const AdminLayout = () => {
  const { isAuthenticated } = useAdmin();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('admin-sidebar-collapsed') === 'true'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('admin-sidebar-collapsed', String(collapsed)); } catch {}
  }, [collapsed]);

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="sticky top-0 z-40 bg-card border-b border-border flex items-center h-14 px-4 gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="p-1.5"><PanelLeft className="w-5 h-5" /></button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col">
              <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="font-semibold text-foreground text-sm">Admin</span>
        </header>
        <main className="p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-card border-r border-border flex flex-col shrink-0 transition-[width] duration-200`}>
        <SidebarNav collapsed={collapsed} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border flex items-center h-12 px-4">
          <button onClick={() => setCollapsed(c => !c)} className="p-1.5 rounded-md hover:bg-muted transition">
            {collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
