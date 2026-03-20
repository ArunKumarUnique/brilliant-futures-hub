import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Users, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AdminDashboard = () => {
  const { config } = useTenant();
  const tenantId = config.id;

  const [totalStudents, setTotalStudents] = useState(0);
  const [feesCollected, setFeesCollected] = useState(0);
  const [pendingFees, setPendingFees] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyData, setMonthlyData] = useState<{ month: string; collected: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'active');
      setTotalStudents(count || 0);

      const { data: studentData } = await supabase
        .from('students')
        .select('id, monthly_fee')
        .eq('tenant_id', tenantId)
        .eq('status', 'active');

      if (studentData && studentData.length > 0) {
        const ids = studentData.map(s => s.id);

        const { data: paidFees } = await supabase
          .from('fee_records')
          .select('amount')
          .in('student_id', ids)
          .eq('month', currentMonth)
          .eq('year', currentYear)
          .eq('status', 'paid');

        const collected = paidFees?.reduce((sum, f) => sum + Number(f.amount), 0) || 0;
        setFeesCollected(collected);

        const totalExpected = studentData.reduce((sum, s) => sum + Number(s.monthly_fee), 0);
        setPendingFees(totalExpected - collected);

        // All paid fees this year for chart
        const { data: yearFees } = await supabase
          .from('fee_records')
          .select('month, amount, status')
          .in('student_id', ids)
          .eq('year', currentYear)
          .eq('status', 'paid');

        const monthMap: Record<number, number> = {};
        yearFees?.forEach(f => { monthMap[f.month] = (monthMap[f.month] || 0) + Number(f.amount); });
        setMonthlyData(MONTHS.map((m, i) => ({ month: m, collected: monthMap[i + 1] || 0 })));

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
    { label: 'Collected This Month', value: loading ? '...' : `₹${feesCollected.toLocaleString()}`, icon: DollarSign, color: 'bg-secondary/10 text-secondary' },
    { label: 'Pending Fees', value: loading ? '...' : `₹${pendingFees.toLocaleString()}`, icon: AlertCircle, color: 'bg-destructive/10 text-destructive' },
    { label: 'Total Revenue', value: loading ? '...' : `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-accent/10 text-accent-foreground' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Monthly Revenue ({new Date().getFullYear()})</h2>
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading chart...</p>
        ) : (
          <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Collected']} />
                <Bar dataKey="collected" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
