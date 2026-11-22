import { useState } from "react";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";

function App() {
  const [page, setPage] = useState<"login" | "register">("register");

  if (page === "login") {
    return (
      <Login
        {...({ onRegister: () => setPage("register") } as any)}
      />
    );
  }

  return (
    <Register
      onSignIn={() => setPage("login")}
    />
  );
}

export default App;