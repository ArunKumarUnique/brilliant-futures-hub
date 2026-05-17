import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Users, DollarSign, AlertCircle, TrendingUp, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AdminDashboard = () => {
  const { config } = useTenant();
  const { tenantId } = useAdmin();

  const [regularCount, setRegularCount] = useState(0);
  const [summerCount, setSummerCount] = useState(0);
  const [feesCollected, setFeesCollected] = useState(0);
  const [pendingFees, setPendingFees] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [summerCollected, setSummerCollected] = useState(0);
  const [summerPending, setSummerPending] = useState(0);
  const [monthlyData, setMonthlyData] = useState<{ month: string; collected: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!tenantId) {
        setRegularCount(0); setSummerCount(0); setFeesCollected(0); setPendingFees(0); setTotalRevenue(0); setSummerCollected(0); setSummerPending(0);
        setMonthlyData(MONTHS.map(m => ({ month: m, collected: 0 })));
        setLoading(false);
        return;
      }
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const { data: studentData } = await supabase
        .from('students')
        .select('id, monthly_fee, student_type')
        .eq('tenant_id', tenantId)
        .eq('status', 'active');

      const all = (studentData || []) as Array<{ id: string; monthly_fee: number; student_type: string | null }>;
      const regular = all.filter(s => (s.student_type || 'regular') === 'regular');
      const summer = all.filter(s => s.student_type === 'summer_camp');
      setRegularCount(regular.length);
      setSummerCount(summer.length);

      if (regular.length > 0) {
        const ids = regular.map(s => s.id);

        const { data: paidFees } = await supabase
          .from('fee_records')
          .select('amount')
          .eq('tenant_id', tenantId)
          .in('student_id', ids)
          .eq('month', currentMonth)
          .eq('year', currentYear)
          .eq('status', 'paid');

        const collected = paidFees?.reduce((sum, f) => sum + Number(f.amount), 0) || 0;
        setFeesCollected(collected);

        const totalExpected = regular.reduce((sum, s) => sum + Number(s.monthly_fee), 0);
        setPendingFees(Math.max(0, totalExpected - collected));

        const { data: yearFees } = await supabase
          .from('fee_records')
          .select('month, amount')
          .eq('tenant_id', tenantId)
          .in('student_id', ids)
          .eq('year', currentYear)
          .eq('status', 'paid');

        const monthMap: Record<number, number> = {};
        yearFees?.forEach(f => { monthMap[f.month] = (monthMap[f.month] || 0) + Number(f.amount); });
        setMonthlyData(MONTHS.map((m, i) => ({ month: m, collected: monthMap[i + 1] || 0 })));

        const { data: allPaid } = await supabase
          .from('fee_records')
          .select('amount')
          .eq('tenant_id', tenantId)
          .in('student_id', ids)
          .eq('status', 'paid');
        setTotalRevenue(allPaid?.reduce((sum, f) => sum + Number(f.amount), 0) || 0);
      } else {
        setFeesCollected(0); setPendingFees(0); setTotalRevenue(0);
        setMonthlyData(MONTHS.map(m => ({ month: m, collected: 0 })));
      }

      // Summer camp fees
      if (summer.length > 0) {
        const { data: scPayments } = await supabase
          .from('summer_camp_payments')
          .select('amount, status, student_id')
          .eq('tenant_id', tenantId)
          .in('student_id', summer.map(s => s.id));
        const paid = (scPayments || []).filter(p => p.status === 'paid');
        const collected = paid.reduce((s, p) => s + Number(p.amount), 0);
        setSummerCollected(collected);
        setSummerPending(summer.length - paid.length);
      } else {
        setSummerCollected(0);
        setSummerPending(0);
      }

      setLoading(false);
    };

    fetchStats();
  }, [tenantId]);

  const regularStats = [
    { label: 'Regular Students', value: loading ? '...' : String(regularCount), icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Collected This Month', value: loading ? '...' : `₹${feesCollected.toLocaleString()}`, icon: DollarSign, color: 'bg-secondary/10 text-secondary' },
    { label: 'Pending Fees', value: loading ? '...' : `₹${pendingFees.toLocaleString()}`, icon: AlertCircle, color: 'bg-destructive/10 text-destructive' },
    { label: 'Total Revenue', value: loading ? '...' : `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-accent/10 text-accent-foreground' },
  ];

  const summerStats = [
    { label: 'Summer Camp Students', value: loading ? '...' : String(summerCount), icon: Sparkles, color: 'bg-amber-500/10 text-amber-600' },
    { label: 'Summer Fees Collected', value: loading ? '...' : `₹${summerCollected.toLocaleString()}`, icon: DollarSign, color: 'bg-secondary/10 text-secondary' },
    { label: 'Summer Fees Pending', value: loading ? '...' : String(summerPending), icon: AlertCircle, color: 'bg-destructive/10 text-destructive' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Regular Programme</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {regularStats.map((stat) => (
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

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Summer Camp</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {summerStats.map((stat) => (
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
        <h2 className="text-lg font-semibold text-foreground mb-4">Monthly Revenue – Regular ({new Date().getFullYear()})</h2>
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
