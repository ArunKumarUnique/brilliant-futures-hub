import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';
import { Button } from '@/components/ui/button';
import { Shield, LogOut } from 'lucide-react';
import { Sidebar, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { LayoutDashboard, Users } from 'lucide-react';

const PlatformLayout = () => {
  const { isAuthenticated, admin, logout } = usePlatformAdmin();
  const navigate = useNavigate();

  if (!isAuthenticated) return <Navigate to="/platform-admin" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden" />
              <Link to="/platform-admin/dashboard" className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm sm:text-base">Platform Admin</span>
              </Link>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <span className="text-xs text-muted-foreground">{admin?.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  navigate('/platform-admin');
                }}
              >
                <LogOut className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="flex">
          <Sidebar className="border-r border-border bg-background p-4" collapsible="offcanvas">
            <div className="space-y-4">
              <div className="px-2 py-3 rounded-2xl bg-muted">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Menu</p>
              </div>
              <Link
                to="/platform-admin/dashboard"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/platform-admin/tenants"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                <Users className="h-4 w-4" />
                Tenants
              </Link>
            </div>
          </Sidebar>
          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PlatformLayout;
