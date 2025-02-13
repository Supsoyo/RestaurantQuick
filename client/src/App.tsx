import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Menu from "@/pages/menu";
import Cart from "@/pages/cart";
import OrderStatus from "@/pages/order-status";
import TableOrders from "@/pages/table-orders";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/menu/:tableId" component={Menu} />
      <Route path="/cart/:tableId" component={Cart} />
      <Route path="/order/:orderId" component={OrderStatus} />
      <Route path="/table/:tableId/orders" component={TableOrders} />
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