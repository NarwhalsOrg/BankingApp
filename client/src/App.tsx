import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";

// Import pages
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Transfer from "@/pages/transfer";
import Settings from "@/pages/settings";
import Help from "@/pages/help";
import NotFound from "@/pages/not-found";

// Import components
import Sidebar from "@/components/sidebar";
import MobileSidebar from "@/components/mobile-sidebar";

function App() {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [location] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
          setIsAuth(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Close mobile sidebar when location changes
    setIsMobileSidebarOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setIsAuth(false);
      setCurrentUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setIsAuth(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {isAuth ? (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden">
          {/* Sidebar for desktop */}
          <Sidebar 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            currentPath={location}
          />
          
          {/* Mobile sidebar */}
          <MobileSidebar 
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
            currentUser={currentUser}
            onLogout={handleLogout}
            currentPath={location}
          />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Bar */}
            <header className="bg-white shadow-sm z-10">
              <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <button 
                    onClick={() => setIsMobileSidebarOpen(true)} 
                    className="text-neutral-500 md:hidden mr-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h1 className="text-lg sm:text-xl font-semibold text-neutral-800">
                    {getPageTitle(location)}
                  </h1>
                </div>
                <div className="flex items-center">
                  <button 
                    className="ml-4 text-neutral-500 hover:text-neutral-700"
                    title="Notifications"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                </div>
              </div>
            </header>
            
            {/* Page Content */}
            <main className="flex-1 overflow-auto bg-neutral-100 p-4 sm:p-6">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/transactions" component={Transactions} />
                <Route path="/transfer/:type?" component={Transfer} />
                <Route path="/settings" component={Settings} />
                <Route path="/help" component={Help} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
          <Toaster />
        </div>
      ) : (
        <Switch>
          <Route path="/register">
            <Register onRegister={handleLogin} />
          </Route>
          <Route path="/">
            <Login onLogin={handleLogin} />
          </Route>
        </Switch>
      )}
      <Toaster />
    </QueryClientProvider>
  );
}

function getPageTitle(path: string): string {
  switch (path) {
    case "/":
      return "Dashboard";
    case "/transactions":
      return "Transaction History";
    case "/transfer":
      return "Transfer Money";
    case "/transfer/deposit":
      return "Make a Deposit";
    case "/transfer/withdrawal":
      return "Make a Withdrawal";
    case "/settings":
      return "Account Settings";
    case "/help":
      return "Help & Support";
    default:
      if (path.startsWith("/transfer")) return "Transfer Money";
      return "SecureBank";
  }
}

export default App;
