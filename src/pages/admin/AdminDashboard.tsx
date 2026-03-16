import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Users, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const { config } = useTenant();
  const tenantId = config.id;

  const [totalStudents, setTotalStudents] = useState(0);
  const [feesCollected, setFeesCollected] = useState(0);
  const [pendingFees, setPendingFees] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Total students
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'active');
      setTotalStudents(count || 0);

      // Get all student IDs for this tenant
      const { data: studentData } = await supabase
        .from('students')
        .select('id, monthly_fee')
        .eq('tenant_id', tenantId)
        .eq('status', 'active');

      if (studentData && studentData.length > 0) {
        const ids = studentData.map(s => s.id);

        // Fees collected this month
        const { data: paidFees } = await supabase
          .from('fee_records')
          .select('amount')
          .in('student_id', ids)
          .eq('month', currentMonth)
          .eq('year', currentYear)
          .eq('status', 'paid');

        const collected = paidFees?.reduce((sum, f) => sum + Number(f.amount), 0) || 0;
        setFeesCollected(collected);

        // Pending = total expected - collected
        const totalExpected = studentData.reduce((sum, s) => sum + Number(s.monthly_fee), 0);
        setPendingFees(totalExpected - collected);

        // Total revenue (all time paid)
        const { data: allPaid } = await supabase
          .from('fee_records')
          .select('amount')
          .in('student_id', ids)
          .eq('status', 'paid');
        setTotalRevenue(allPaid?.reduce((sum, f) => sum + Number(f.amount), 0) || 0);
      }

      setLoading(false);
    };

    fetchStats();
  }, [tenantId]);

  const stats = [
    { label: 'Total Students', value: loading ? '...' : String(totalStudents), icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Fees Collected This Month', value: loading ? '...' : `₹${feesCollected.toLocaleString()}`, icon: DollarSign, color: 'bg-secondary/10 text-secondary' },
    { label: 'Pending Fees', value: loading ? '...' : `₹${pendingFees.toLocaleString()}`, icon: AlertCircle, color: 'bg-destructive/10 text-destructive' },
    { label: 'Total Revenue', value: loading ? '...' : `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-accent/10 text-accent-foreground' },
  ];

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
    </div>
  );
};

export default AdminDashboard;
