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
import TablePayment from "@/pages/table-payment";
import PaymentSuccess from "@/pages/payment-success";
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
      <Route path="/table-payment/:tableId" component={TablePayment} />
      <Route path="/payment-success/:tableId" component={PaymentSuccess} />
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