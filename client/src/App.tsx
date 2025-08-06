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
import logoPath from "@assets/logo bs_1754516178309.png";

function AdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { data: authStatus } = useQuery({
    queryKey: ["/api/admin/check"],
    retry: false,
  });

  useEffect(() => {
    if (authStatus !== undefined) {
      setIsAuthenticated(authStatus?.authenticated || false);
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
          <img src={logoPath} alt="Beatriz Sousa" className="h-20 w-auto mx-auto mb-4" />
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
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img src={logoPath} alt="Beatriz Sousa" className="h-10 w-auto" />
            <h1 className="text-xl font-semibold text-foreground">Beatriz Sousa</h1>
          </div>
          <div className="flex space-x-4">
            <Button
              variant={currentView === 'client' ? 'default' : 'outline'}
              onClick={() => {
                setCurrentView('client');
                window.location.href = '/';
              }}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Área do Cliente
            </Button>
            <Button
              variant={currentView === 'admin' ? 'default' : 'outline'}
              onClick={() => {
                setCurrentView('admin');
                window.location.href = '/admin';
              }}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Painel Admin
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
