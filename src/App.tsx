import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TenantProvider, isTenantValid } from "@/contexts/TenantContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PlatformAdminProvider } from "@/contexts/PlatformAdminContext";
import TenantError from "@/pages/TenantError";
import AppRoutes from "@/components/AppRoutes";
import PlatformLogin from "@/pages/platform/PlatformLogin";
import PlatformLayout from "@/pages/platform/PlatformLayout";
import PlatformDashboard from "@/pages/platform/PlatformDashboard";
import PlatformTenantNew from "@/pages/platform/PlatformTenantNew";
import PlatformTenantView from "@/pages/platform/PlatformTenantView";
import PlatformTenantEdit from "@/pages/platform/PlatformTenantEdit";

const queryClient = new QueryClient();

const PlatformRoutes = () => (
  <PlatformAdminProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/platform-admin" element={<PlatformLogin />} />
        <Route path="/platform-admin" element={<PlatformLayout />}>
          <Route path="dashboard" element={<PlatformDashboard />} />
          <Route path="tenants/new" element={<PlatformTenantNew />} />
          <Route path="tenants/:id" element={<PlatformTenantView />} />
          <Route path="tenants/:id/edit" element={<PlatformTenantEdit />} />
        </Route>
      </Routes>
    </TooltipProvider>
  </PlatformAdminProvider>
);

const TenantApp = () => {
  if (!isTenantValid()) {
    return <TenantError />;
  }
  return (
    <TenantProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </LanguageProvider>
    </TenantProvider>
  );
};

const App = () => {
  const isPlatformRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/platform-admin');

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {isPlatformRoute ? <PlatformRoutes /> : <TenantApp />}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
