import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Scissors, Settings, User } from "lucide-react";
import BookingPage from "@/pages/booking";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { useState } from "react";

function Navigation() {
  const [currentView, setCurrentView] = useState<'client' | 'admin'>('client');

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Scissors className="text-primary text-2xl" />
            <h1 className="text-xl font-semibold text-gray-900">Beatriz Sousa</h1>
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
      <Route path="/admin" component={AdminPage} />
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
