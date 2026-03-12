import { Routes, Route } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { AdminProvider } from '@/contexts/AdminContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Index from '@/pages/Index';
import Faculty from '@/pages/Faculty';
import Admissions from '@/pages/Admissions';
import Media from '@/pages/Media';
import Contact from '@/pages/Contact';
import BrochureBuilder from '@/pages/BrochureBuilder';
import Packages from '@/pages/Packages';
import NotFound from '@/pages/NotFound';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminStudents from '@/pages/admin/AdminStudents';
import AdminPackages from '@/pages/admin/AdminPackages';
import AdminFees from '@/pages/admin/AdminFees';
import AdminNotifications from '@/pages/admin/AdminNotifications';

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const AppRoutes = () => {
  const { config } = useTenant();
  const adminEmail = config.admin?.email || '';
  const adminPassword = config.admin?.password || '';

  return (
    <AdminProvider adminEmail={adminEmail} adminPassword={adminPassword}>
      <Routes>
        {/* Public site */}
        <Route path="/" element={<PublicLayout><Index /></PublicLayout>} />
        {config.pages.faculty && <Route path="/faculty" element={<PublicLayout><Faculty /></PublicLayout>} />}
        {config.pages.admissions && <Route path="/admissions" element={<PublicLayout><Admissions /></PublicLayout>} />}
        {config.pages.media && <Route path="/media" element={<PublicLayout><Media /></PublicLayout>} />}
        {config.pages.contact && <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />}
        {config.pages.packages && <Route path="/packages" element={<PublicLayout><Packages /></PublicLayout>} />}
        {config.pages.brochureBuilder && <Route path="/brochure-builder" element={<PublicLayout><BrochureBuilder /></PublicLayout>} />}

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="fees" element={<AdminFees />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>

        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
    </AdminProvider>
  );
};

export default AppRoutes;
