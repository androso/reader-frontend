import { Switch, Route, useLocation } from "wouter";
import { Reader } from "./pages/Reader";
import { Library } from "./pages/Library";
import { Login } from "./pages/Login";
import { AuthProvider } from "./components/AuthProvider";
import { useAuth } from "./lib/auth";

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any> }) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return <Component {...rest} />;
}

function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/">
          <ProtectedRoute component={Library} />
        </Route>
        <Route path="/read/:bookId">
          <ProtectedRoute component={Reader} />
        </Route>
        <Route>404 Page Not Found</Route>
      </Switch>
    </AuthProvider>
  );
}

export default App;
