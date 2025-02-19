import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Menu from "@/pages/menu";
import Cart from "@/pages/cart";
import Orders from "@/pages/orders";
import OrderStatus from "@/pages/order-status";
import personal from "@/pages/personal";
import table from "@/pages/table";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/menu/:tableId" component={Menu} />
      <Route path="/cart/:tableId" component={Cart} />
      <Route path="/orders/:tableId" component={Orders} />
      <Route path="/order/:orderId" component={OrderStatus} />
      <Route path="/personal/:orderId" component={personal} />
      <Route path="/tableorder/:orderId" component={table} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;