import { Routes, Route } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
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

const AppRoutes = () => {
  const { config } = useTenant();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          {config.pages.faculty && <Route path="/faculty" element={<Faculty />} />}
          {config.pages.admissions && <Route path="/admissions" element={<Admissions />} />}
          {config.pages.media && <Route path="/media" element={<Media />} />}
          {config.pages.contact && <Route path="/contact" element={<Contact />} />}
          {config.pages.brochureBuilder && <Route path="/brochure-builder" element={<BrochureBuilder />} />}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default AppRoutes;
