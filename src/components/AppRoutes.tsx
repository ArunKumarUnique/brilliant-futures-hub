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

const AppRoutes = () => {
  const { config } = useTenant();
  const adminEmail = config.admin?.email || '';
  const adminPassword = config.admin?.password || '';

  return (
    <AdminProvider adminEmail={adminEmail} adminPassword={adminPassword}>
      <Routes>
        {/* Public site */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  {config.pages.faculty && <Route path="/faculty" element={<Faculty />} />}
                  {config.pages.admissions && <Route path="/admissions" element={<Admissions />} />}
                  {config.pages.media && <Route path="/media" element={<Media />} />}
                  {config.pages.contact && <Route path="/contact" element={<Contact />} />}
                  {config.pages.packages && <Route path="/packages" element={<Packages />} />}
                  {config.pages.brochureBuilder && <Route path="/brochure-builder" element={<BrochureBuilder />} />}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="fees" element={<AdminFees />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>
      </Routes>
    </AdminProvider>
  );
};

export default AppRoutes;
