import { useState } from "react";
import { UserProvider } from "./context/UserContext";

import IntroPage from "./components/IntroPage";
import EntryPage from "./components/EntryPage";

export default function App() {
  const [page, setPage] = useState("intro");

  return (
    <UserProvider>

      {/* GLOBAL BACKGROUND */}
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden text-white">

        {/* Glow */}
        <div
          className="absolute w-[900px] h-[900px] opacity-25 blur-3xl rounded-full"
          style={{ backgroundImage: "linear-gradient(135deg,#38A2D7,#561139)" }}
        />

        {/* Page Content */}
        <div className="relative z-10 w-full flex items-center justify-center">
          {page === "intro" && <IntroPage onStart={() => setPage("login")} />}
          {page === "login" && <EntryPage onSuccess={() => setPage("done")} />}
        </div>

      </div>

    </UserProvider>
  );
}
