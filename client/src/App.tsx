import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { Navigation } from "@/components/navigation";
import { WaterBackground } from "@/components/water-background";
import { Terminal } from "@/components/terminal";
import { KeyboardPiano } from "@/components/keyboard-piano";
import Home from "@/pages/home";
import About from "@/pages/about";
import Experience from "@/pages/experience";
import Journal from "@/pages/journal";
import Memos from "@/pages/memos";
import Contact from "@/pages/contact";
import Now from "@/pages/now";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  const onHome = location === "/";

  return (
    <>
      <WaterBackground />
      <Navigation />
      <div
        className="md:pl-48 transition-colors duration-700"
        style={{
          // Home floats directly on the water; interior pages get a soft
          // scrim so long-form text stays comfortable to read.
          background: onHome ? "transparent" : "hsl(var(--background) / 0.88)",
        }}
      >
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/experience" component={Experience} />
          <Route path="/journal" component={Journal} />
          <Route path="/memos" component={Memos} />
          <Route path="/contact" component={Contact} />
          <Route path="/now" component={Now} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Terminal />
      <KeyboardPiano />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <div className="min-h-screen text-foreground">
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
