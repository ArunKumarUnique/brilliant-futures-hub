import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { useTenant } from '@/contexts/TenantContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LayoutDashboard, Users, Package, Receipt, Bell, LogOut, PanelLeftClose, PanelLeft, FileImage, ClipboardCheck, BookOpen, Calendar, Lightbulb, MessageSquareText, GraduationCap, UserCog, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import AcademicYearSwitcher from '@/components/admin/AcademicYearSwitcher';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Students', icon: Users, path: '/admin/students' },
  { label: 'Attendance', icon: ClipboardCheck, path: '/admin/attendance' },
  { label: 'Homework', icon: BookOpen, path: '/admin/homework' },
  { label: 'Daily Learnings', icon: Lightbulb, path: '/admin/daily-learnings' },
  { label: 'Daily Notifications', icon: Send, path: '/admin/daily-notifications' },
  { label: 'Fee Tracking', icon: Receipt, path: '/admin/fees' },
  { label: 'Message Generator', icon: MessageSquareText, path: '/admin/messages' },
  { label: 'Timetable', icon: Calendar, path: '/admin/timetable' },
  { label: 'Packages', icon: Package, path: '/admin/packages' },
  { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
  { label: 'Brochure Builder', icon: FileImage, path: '/admin/brochure-builder' },
  { label: 'Profile', icon: UserCog, path: '/admin/profile' },
];


const TenantBadge = ({ logo, name, size = 'sm' }: { logo: string | null; name: string; size?: 'sm' | 'md' }) => {
  const dim = size === 'md' ? 'w-8 h-8 text-sm' : 'w-7 h-7 text-xs';
  const initial = (name || 'T').trim().charAt(0).toUpperCase();
  return (
    <div className={`${dim} rounded-md border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0`}>
      {logo ? (
        <img src={logo} alt={`${name} logo`} loading="lazy" className="w-full h-full object-contain" />
      ) : (
        <span className="font-semibold text-foreground">{initial}</span>
      )}
    </div>
  );
};

const SidebarNav = ({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) => {
  const { logout, tenantName, tenantLogo } = useAdmin();
  const { config } = useTenant();
  const location = useLocation();
  const displayName = tenantName || config.instituteName;

  return (
    <>
      <Link
        to="/admin/dashboard"
        onClick={onNavigate}
        className={`p-4 border-b border-border flex items-center gap-2.5 hover:bg-muted/60 transition ${collapsed ? 'justify-center' : ''}`}
      >
        <TenantBadge logo={tenantLogo} name={displayName} size="md" />
        {!collapsed && (
          <div className="min-w-0">
            <h2 className="font-bold text-foreground text-sm truncate leading-tight">{displayName}</h2>
            <p className="text-[11px] text-muted-foreground leading-tight">Admin Console</p>
          </div>
        )}
      </Link>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
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

const HeaderBrand = ({ tenantName, tenantLogo }: { tenantName: string; tenantLogo: string | null }) => (
  <Link to="/admin/dashboard" className="flex items-center gap-2.5 min-w-0 hover:opacity-90 transition">
    <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0" aria-label="Platform logo">
      <GraduationCap className="w-4 h-4" />
    </span>
    <span className="text-muted-foreground/60 hidden sm:inline">/</span>
    <TenantBadge logo={tenantLogo} name={tenantName} />
    <span className="font-semibold text-foreground text-sm truncate">{tenantName}</span>
  </Link>
);

const AdminLayout = () => {
  const { isAuthenticated, tenantName, tenantLogo } = useAdmin();
  const { config } = useTenant();
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

  const displayName = tenantName || config.instituteName;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="sticky top-0 z-40 bg-card border-b border-border flex items-center h-14 px-3 gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-muted" aria-label="Open menu">
                <PanelLeft className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col">
              <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex-1 min-w-0">
            <HeaderBrand tenantName={displayName} tenantLogo={tenantLogo} />
          </div>
          <AcademicYearSwitcher compact />
        </header>

        <main className="p-4 overflow-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-card border-r border-border flex flex-col shrink-0 transition-[width] duration-200 sticky top-0 h-screen self-start`}>
        <SidebarNav collapsed={collapsed} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border flex items-center h-12 px-4 gap-3">
          <button onClick={() => setCollapsed(c => !c)} className="p-1.5 rounded-md hover:bg-muted transition" aria-label="Toggle sidebar">
            {collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
          <HeaderBrand tenantName={displayName} tenantLogo={tenantLogo} />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
