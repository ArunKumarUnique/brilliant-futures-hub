import { Users, DollarSign, AlertCircle, UserPlus } from 'lucide-react';

const stats = [
  { label: 'Total Students', value: '0', icon: Users, color: 'bg-primary/10 text-primary' },
  { label: 'Fees Collected This Month', value: '₹0', icon: DollarSign, color: 'bg-secondary/10 text-secondary' },
  { label: 'Pending Fees', value: '₹0', icon: AlertCircle, color: 'bg-destructive/10 text-destructive' },
  { label: 'Recent Students', value: '0', icon: UserPlus, color: 'bg-accent/10 text-accent-foreground' },
];

const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-2">Getting Started</h2>
        <p className="text-muted-foreground text-sm">
          Student management, fee tracking, and bulk notifications will be available once the backend is enabled.
          Navigate to <strong>Students</strong> or <strong>Packages</strong> using the sidebar to explore the admin modules.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
