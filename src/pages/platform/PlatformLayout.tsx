import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';
import { Button } from '@/components/ui/button';
import { Shield, LogOut } from 'lucide-react';

const PlatformLayout = () => {
  const { isAuthenticated, admin, logout } = usePlatformAdmin();
  const navigate = useNavigate();

  if (!isAuthenticated) return <Navigate to="/platform-admin" replace />;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/platform-admin/dashboard" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm sm:text-base">Platform Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground">{admin?.email}</span>
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
      <main className="container mx-auto px-4 py-4 sm:py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default PlatformLayout;
