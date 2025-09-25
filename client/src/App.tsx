import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ThemeProvider } from "@/components/ThemeProvider"
import { ThemeToggle } from "@/components/ThemeToggle"
import Dashboard from "@/pages/Dashboard";
import ChatInterface from "@/pages/ChatInterface";
import KnowledgeBase from "@/pages/KnowledgeBase";
import ServiceNow from "@/pages/ServiceNow";
import Learning from "@/pages/Learning";
import Teams from "@/pages/Teams";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/chat" component={ChatInterface} />
      <Route path="/dashboard" component={Dashboard} />
      
      {/* Dedicated feature pages */}
      <Route path="/incidents" component={ServiceNow} />
      <Route path="/knowledge" component={KnowledgeBase} />
      <Route path="/search" component={KnowledgeBase} />
      <Route path="/reports" component={Dashboard} />
      <Route path="/learning" component={Learning} />
      <Route path="/team" component={Teams} />
      <Route path="/settings" component={Settings} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  // Custom sidebar width for IT support application
  const style = {
    "--sidebar-width": "18rem",       // 288px for better navigation
    "--sidebar-width-icon": "3rem",   // default icon width
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                  </div>
                </header>
                <main className="flex-1 overflow-hidden">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}