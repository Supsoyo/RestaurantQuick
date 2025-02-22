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
import Login from "@/pages/login";
import Personal from "@/pages/personal";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { useEffect } from "react";

// ProtectedRoute component to handle authentication
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any> }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <Component {...rest} /> : null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Home} />
      <Route path="/menu/:tableId">
        {(params) => <ProtectedRoute component={Menu} {...params} />}
      </Route>
      <Route path="/cart/:tableId">
        {(params) => <ProtectedRoute component={Cart} {...params} />}
      </Route>
      <Route path="/personal/:tableId">
        {(params) => <ProtectedRoute component={Personal} {...params} />}
      </Route>
      <Route path="/orders/:tableId">
        {(params) => <ProtectedRoute component={Orders} {...params} />}
      </Route>
      <Route path="/order/:orderId">
        {(params) => <ProtectedRoute component={OrderStatus} {...params} />}
      </Route>
      <Route path="/table-payment/:tableId">
        {(params) => <ProtectedRoute component={TablePayment} {...params} />}
      </Route>
      <Route path="/payment-success/:tableId">
        {(params) => <ProtectedRoute component={PaymentSuccess} {...params} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;