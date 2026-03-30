import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { Navigation } from "@/components/navigation";
import { Terminal } from "@/components/terminal";
import Home from "@/pages/home";
import About from "@/pages/about";
import Experience from "@/pages/experience";
import Journal from "@/pages/journal";
import Contact from "@/pages/contact";
import Universe from "@/pages/universe";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  const isUniverse = location === "/universe";

  return (
    <>
      {!isUniverse && <Navigation />}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/experience" component={Experience} />
        <Route path="/journal" component={Journal} />
        <Route path="/contact" component={Contact} />
        <Route path="/universe" component={Universe} />
        <Route component={NotFound} />
      </Switch>
      <Terminal />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
