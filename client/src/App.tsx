import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Fichas from "./pages/Fichas";
import NovaFicha from "./pages/NovaFicha";
import FichaDetalhes from "./pages/FichaDetalhes";
import Usuarios from "./pages/Usuarios";
import ImportExport from "./pages/ImportExport";
import Itens from "./pages/Itens";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/fichas"} component={Fichas} />
      <Route path={"/fichas/nova"} component={NovaFicha} />
      <Route path={"/fichas/:id"} component={FichaDetalhes} />
      <Route path={"/usuarios"} component={Usuarios} />
      <Route path={"/importexport"} component={ImportExport} />
      <Route path={"/itens"} component={Itens} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
