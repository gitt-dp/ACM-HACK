import { useState, useEffect, useRef } from "react";
import SchemeCard from "./SchemeCard";
import schemes from "../data/schemes.json";

const questions = [
  {
    id: "state",
    text: "Hi! 👋 I'm SchemeAI. Which state are you from?",
    options: ["Tamil Nadu", "Karnataka", "Maharashtra", "Delhi"],
  },
  {
    id: "category",
    text: "What best describes you?",
    options: ["Farmer", "Student", "Worker", "Women", "Senior Citizen", "General Low Income"],
  },
];

function getEligibleSchemes(answers) {
  return schemes.filter(
    (s) =>
      s.category === answers.category &&
      (s.state === "All" || s.state === answers.state)
  );
}

function useTypingEffect(text, speed = 30) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);

  return { displayed, done };
}

function BotMessage({ text, onDone }) {
  const { displayed, done } = useTypingEffect(text);
  useEffect(() => {
    if (done && onDone) onDone();
  }, [done]);

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px" }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%",
        background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.3)", display: "flex",
        alignItems: "center", justifyContent: "center", color: "#fff",
        fontSize: "11px", fontWeight: "700", flexShrink: 0
      }}>AI</div>
      <div style={{
        background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.2)", color: "#fff",
        padding: "12px 16px", borderRadius: "18px", borderTopLeftRadius: "4px",
        maxWidth: "75%", fontSize: "14px", lineHeight: "1.6"
      }}>
        {displayed}
        {!done && <span style={{ opacity: 0.5 }}>|</span>}
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
      <div style={{
        background: "rgba(255,255,255,0.25)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.3)", color: "#fff",
        padding: "12px 16px", borderRadius: "18px", borderTopRightRadius: "4px",
        maxWidth: "75%", fontSize: "14px"
      }}>
        {text}
      </div>
    </div>
  );
}

function VoiceMic({ onResult }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setError("Use Chrome for voice!"); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    setListening(true);
    setError("");
    recognition.start();
    recognition.onresult = (e) => { setListening(false); onResult(e.results[0][0].transcript); };
    recognition.onerror = () => { setListening(false); setError("Couldn't hear you. Try again!"); };
    recognition.onend = () => setListening(false);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }`}</style>
      <button onClick={handleVoice} style={{
        width: "42px", height: "42px", borderRadius: "50%",
        background: listening ? "rgba(255,80,80,0.35)" : "rgba(255,255,255,0.12)",
        border: listening ? "2px solid rgba(255,100,100,0.8)" : "2px solid rgba(255,255,255,0.3)",
        color: "#fff", fontSize: "18px", cursor: "pointer",
        animation: listening ? "pulse 1s infinite" : "none"
      }}>
        {listening ? "🔴" : "🎤"}
      </button>
      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>
        {listening ? "Listening... speak now!" : "Or tap mic to speak"}
      </span>
      {error && <span style={{ color: "#ff8080", fontSize: "12px" }}>{error}</span>}
    </div>
  );
}

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showOptions, setShowOptions] = useState(false);
  const [results, setResults] = useState(null);
  const [freeText, setFreeText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showFreeInput, setShowFreeInput] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages([{ type: "bot", text: questions[0].text }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showOptions, showFreeInput]);

  const handleBotDone = () => setShowOptions(true);

  const handleOption = (option) => {
    const q = questions[currentQ];
    const newAnswers = { ...answers, [q.id]: option };
    setAnswers(newAnswers);
    setShowOptions(false);
    setMessages((prev) => [...prev, { type: "user", text: option }]);
    const nextQ = currentQ + 1;
    if (nextQ < questions.length) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { type: "bot", text: questions[nextQ].text }]);
        setCurrentQ(nextQ);
      }, 500);
    } else {
      const eligible = getEligibleSchemes(newAnswers);
      setResults(eligible);
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          type: "bot",
          text: eligible.length > 0
            ? `✅ Found ${eligible.length} scheme(s) for you! You can also ask me anything below 👇`
            : "😔 No schemes found. But you can still ask me anything below 👇"
        }]);
        setShowFreeInput(true);
      }, 500);
    }
  };

  const handleVoiceResult = (text) => {
    const match = questions[currentQ].options.find(
      opt => text.toLowerCase().includes(opt.toLowerCase())
    );
    if (match) handleOption(match);
  };

  // Send free text question to Claude AI
  const handleAskAI = async () => {
    if (!freeText.trim()) return;
    const userQ = freeText.trim();
    console.log("API KEY:", import.meta.env.VITE_CLAUDE_API_KEY);
    setFreeText("");
    setMessages((prev) => [...prev, { type: "user", text: userQ }]);
    setAiLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 400,
          system: `You are SchemeAI, a helpful assistant that answers questions about Indian government welfare schemes. 
Keep answers short, simple and in plain English. 
Only answer questions related to government schemes, eligibility, documents needed, and how to apply.
If asked something unrelated, politely say you only help with government schemes.`,
          messages: [{ role: "user", content: userQ }]
        })
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't get an answer. Try again!";
      setMessages((prev) => [...prev, { type: "bot", text: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { type: "bot", text: "❌ Something went wrong. Check your API key in .env file." }]);
    }

    setAiLoading(false);
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setAnswers({});
    setShowOptions(false);
    setResults(null);
    setFreeText("");
    setShowFreeInput(false);
    setAiLoading(false);
    setMessages([]);
    setTimeout(() => {
      setMessages([{ type: "bot", text: questions[0].text }]);
    }, 100);
  };

  return (
    <div style={{
      width: "100vw", height: "100vh",
      backgroundImage: "linear-gradient(to bottom right, #38A2D7, #561139)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Segoe UI', sans-serif", overflow: "hidden"
    }}>

      {/* NAVBAR */}
      <div style={{
        padding: "16px 24px",
        background: "rgba(255,255,255,0.10)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.18)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>🇮🇳</span>
          <div>
            <div style={{ color: "#fff", fontWeight: "800", fontSize: "18px", fontFamily: "'Georgia', serif" }}>SchemeAI</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>Government Scheme Assistant</div>
          </div>
        </div>
        <button onClick={handleRestart} style={{
          padding: "8px 18px", background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.25)", borderRadius: "999px",
          color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer"
        }}>🔄 New Chat</button>
      </div>

      {/* CHAT AREA */}
      <div style={{
        flex: 1, overflowY: "auto", display: "flex",
        flexDirection: "column", alignItems: "center", padding: "32px 16px 24px"
      }}>
        <div style={{ width: "100%", maxWidth: "720px" }}>

          {messages.map((msg, i) =>
            msg.type === "bot"
              ? <BotMessage key={i} text={msg.text} onDone={i === messages.length - 1 ? handleBotDone : null} />
              : <UserMessage key={i} text={msg.text} />
          )}

          {/* Option buttons + Voice */}
          {showOptions && results === null && (
            <div style={{ paddingLeft: "42px", marginBottom: "24px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "4px" }}>
                {questions[currentQ].options.map((opt) => (
                  <button key={opt} onClick={() => handleOption(opt)} style={{
                    padding: "10px 20px", background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.4)", color: "#fff",
                    borderRadius: "999px", cursor: "pointer", fontSize: "13px",
                    fontWeight: "600", transition: "all 0.2s", backdropFilter: "blur(8px)"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.10)"}
                  >{opt}</button>
                ))}
              </div>
              <VoiceMic onResult={handleVoiceResult} />
            </div>
          )}

          {/* Scheme Results */}
          {results !== null && results.length > 0 && (
            <div style={{ paddingLeft: "42px", marginBottom: "16px" }}>
              {results.map((s, i) => <SchemeCard key={i} scheme={s} />)}
            </div>
          )}

          {/* AI loading */}
          {aiLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "rgba(255,255,255,0.2)", display: "flex",
                alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: "700"
              }}>AI</div>
              <div style={{
                background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)",
                padding: "12px 16px", borderRadius: "18px", fontSize: "14px"
              }}>Thinking...</div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* FREE TEXT INPUT BOX — shows after results */}
      {showFreeInput && (
        <div style={{
          flexShrink: 0, padding: "16px 24px",
          background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.15)",
          display: "flex", justifyContent: "center"
        }}>
          <div style={{ width: "100%", maxWidth: "720px", display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              value={freeText}
              onChange={e => setFreeText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAskAI()}
              placeholder="Ask me anything about government schemes..."
              style={{
                flex: 1, padding: "14px 20px",
                background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.25)", borderRadius: "999px",
                color: "#fff", fontSize: "14px", outline: "none"
              }}
            />
            <button onClick={handleAskAI} disabled={aiLoading} style={{
              padding: "14px 24px", background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)", borderRadius: "999px",
              color: "#fff", fontWeight: "700", fontSize: "14px",
              cursor: aiLoading ? "not-allowed" : "pointer"
            }}>
              {aiLoading ? "..." : "Send ➤"}
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM TEXT */}
      {!showFreeInput && (
        <div style={{
          flexShrink: 0, display: "flex", justifyContent: "center",
          padding: "14px 16px", background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.12)"
        }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
            SchemeAI · Built for Bharat 🇮🇳 · Voice supported in Chrome
          </div>
        </div>
      )}

    </div>
  );
}