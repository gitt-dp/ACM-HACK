import { useState } from "react";
import { UserProvider } from "./context/UserContext";
import IntroPage from "./components/IntroPage";
import EntryPage from "./components/EntryPage";

export default function App() {
  const [screen, setScreen] = useState("intro");

  return (
    <UserProvider>

      {screen === "intro" && (
        <IntroPage onStart={() => setScreen("auth")} />
      )}

      {screen === "auth" && (
        <EntryPage onSuccess={() => alert("Login success")} />
      )}

    </UserProvider>
  );
}
