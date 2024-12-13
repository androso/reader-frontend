import { Switch, Route } from "wouter";
import { Reader } from "./pages/Reader";
import { Library } from "./pages/Library";

function App() {
  return (
    <Switch>
      <Route path="/" component={Library} />
      <Route path="/read/:bookId" component={Reader} />
      <Route>404 Page Not Found</Route>
    </Switch>
  );
}

export default App;
