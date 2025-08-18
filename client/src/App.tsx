import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Scissors, Settings, User } from "lucide-react";
import BookingPage from "@/pages/booking";
import AdminPage from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
// Logo SVG inline para evitar problemas de build
const LogoSVG = () => (
  <div className="flex items-center space-x-2">
    <div className="w-8 h-8 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full flex items-center justify-center">
      <Scissors className="w-4 h-4 text-white" />
    </div>
    <span className="font-bold text-xl text-amber-700">Beatriz Sousa</span>
  </div>
);

function AdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { data: authStatus } = useQuery({
    queryKey: ["/api/admin/check"],
    retry: false,
  });

  useEffect(() => {
    if (authStatus !== undefined) {
      setIsAuthenticated((authStatus as any)?.authenticated || false);
      setIsLoading(false);
    }
  }, [authStatus]);

  const handleLoginSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/check"] });
    setIsAuthenticated(true);
    // Force a refetch to ensure we have the latest auth state
    setTimeout(() => {
      queryClient.refetchQueries({ queryKey: ["/api/admin/check"] });
    }, 100);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    queryClient.invalidateQueries({ queryKey: ["/api/admin/check"] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <LogoSVG />
          </div>
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

function Navigation() {
  const [currentView, setCurrentView] = useState<'client' | 'admin'>('client');

  return (
    <nav className="bg-card shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 py-4 sm:py-0">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <LogoSVG />
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Button
              variant={currentView === 'client' ? 'default' : 'outline'}
              onClick={() => {
                setCurrentView('client');
                window.location.href = '/';
              }}
              className="flex items-center gap-2 w-full sm:w-auto justify-center"
              size="sm"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">Área do Cliente</span>
            </Button>
            <Button
              variant={currentView === 'admin' ? 'default' : 'outline'}
              onClick={() => {
                setCurrentView('admin');
                window.location.href = '/admin';
              }}
              className="flex items-center gap-2 w-full sm:w-auto justify-center"
              size="sm"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Painel Admin</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={BookingPage} />
      <Route path="/admin" component={() => (
        <QueryClientProvider client={queryClient}>
          <AdminAuth />
        </QueryClientProvider>
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
