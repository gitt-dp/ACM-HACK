import { Routes, Route } from "react-router-dom";
import IntroPage from "./components/IntroPage";
import AuthPage from "./components/AuthPage";
import ChatBot from "./components/ChatBot";

function App() {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/chat" element={<ChatBot />} />
    </Routes>
  );
}

export default App;
