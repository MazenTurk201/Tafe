import { useState } from "react";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import MainMenu from "./components/MainMenu/MainMenu";

type Page = "login" | "register" | "main";

export default function App() {
  const [page, setPage] = useState<Page>("login");

  if (page === "login") {
    return (
      <Login
        onRegister={() => setPage("register")}
        onSubmit={() => setPage("main")}
      />
    );
  }

  if (page === "register") {
    return (
      <Register
        onSignIn={() => setPage("login")}
        onSubmit={() => setPage("main")}
      />
    );
  }

  return <MainMenu onLogout={() => setPage("login")} />;
}
