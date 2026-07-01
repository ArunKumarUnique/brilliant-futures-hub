import { useTenant } from '@/contexts/TenantContext';
import { useAdmin } from '@/contexts/AdminContext';
import DailyNotifications from '@/components/admin/DailyNotifications';

const AdminDailyNotifications = () => {
  const { config } = useTenant();
  const { tenantId, tenantName } = useAdmin();

  if (!tenantId) {
    return <div className="text-sm text-destructive">Tenant missing. Please log in again.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Daily Notifications</h1>
      <DailyNotifications instituteName={tenantName || config.instituteName} tenantId={tenantId} />
    </div>
  );
};

export default AdminDailyNotifications;
