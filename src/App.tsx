import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { TenantProvider, isTenantValid } from "@/contexts/TenantContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import TenantError from "@/pages/TenantError";
import AppRoutes from "@/components/AppRoutes";

const queryClient = new QueryClient();

const App = () => {
  if (!isTenantValid()) {
    return <TenantError />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </TenantProvider>
    </QueryClientProvider>
  );
};

export default App;
