import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { useUser } from "../context/UserContext";
import SchemeCard from "./SchemeCard";

const questions = [
  {
    id: "state",
    text: "Hi! 👋 I'm SchemeAI. Which state are you from?",
    options: ["Tamil Nadu", "Karnataka", "Maharashtra", "Delhi", "Uttar Pradesh", "West Bengal", "All India"],
  },
  {
    id: "occupation",
    text: "What is your occupation?",
    options: ["Farmer", "Student", "Street Vendor", "Construction Worker", "Shopkeeper", "Fisherman", "Casual Labour", "Other"],
  },
  {
    id: "income",
    text: "What is your monthly income? (in ₹)",
    options: ["Less than ₹10,000", "₹10,000 - ₹15,000", "₹15,000 - ₹25,000", "Above ₹25,000"],
  },
  {
    id: "age",
    text: "What is your age?",
    options: ["Below 18", "18-30", "31-40", "41-50", "51-60", "60-70", "70+"],
  },
  {
    id: "landholding",
    text: "Do you own any agricultural land?",
    options: ["Yes", "No"],
  },
  {
    id: "bpl_card",
    text: "Do you have a BPL (Below Poverty Line) card?",
    options: ["Yes", "No"],
  },
  {
    id: "girl_child",
    text: "Do you have a girl child below 10 years?",
    options: ["Yes", "No"],
  }
];

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
    if (done && onDone) {
      onDone();
    }
  }, [done, onDone]);

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
  const [eligibleSchemes, setEligibleSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [freeText, setFreeText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showFreeInput, setShowFreeInput] = useState(false);
  const [allSchemes, setAllSchemes] = useState([]);
  const bottomRef = useRef(null);
  
  const { userData } = useUser();

  // Load all schemes from Supabase on mount
  useEffect(() => {
    loadAllSchemes();
  }, []);

  // Initialize chat
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ type: "bot", text: questions[0].text, id: Date.now() }]);
    }
  }, []);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadAllSchemes = async () => {
    try {
      console.log("Loading schemes from Supabase...");
      const { data, error } = await supabase
        .from('government_schemes')
        .select('*');

      if (error) {
        console.error("Error loading schemes:", error);
        return;
      }

      console.log(`Loaded ${data.length} schemes:`, data.map(s => s.name));
      setAllSchemes(data);
    } catch (err) {
      console.error("Failed to load schemes:", err);
    }
  };

  // Handle when bot message finishes typing
  const handleBotDone = () => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === "bot" && !showOptions && eligibleSchemes.length === 0) {
      setShowOptions(true);
    }
  };

  // Helper function to convert age range to numeric value
  const getAgeNumeric = (ageRange) => {
    const ageMap = {
      "Below 18": 15,
      "18-30": 25,
      "31-40": 35,
      "41-50": 45,
      "51-60": 55,
      "60-70": 65,
      "70+": 75
    };
    return ageMap[ageRange] || 0;
  };

  // Helper function to convert income range to numeric value
  const getIncomeNumeric = (incomeRange) => {
    const incomeMap = {
      "Less than ₹10,000": 5000,
      "₹10,000 - ₹15,000": 12500,
      "₹15,000 - ₹25,000": 20000,
      "Above ₹25,000": 30000
    };
    return incomeMap[incomeRange] || 0;
  };

  // Check if user is eligible for a specific scheme based on hardcoded rules
  const isEligibleForScheme = (schemeName, answers) => {
    const age = getAgeNumeric(answers.age);
    const income = getIncomeNumeric(answers.income);
    const occupation = answers.occupation.toLowerCase();
    const landholding = answers.landholding === "Yes";
    const bplCard = answers.bpl_card === "Yes";
    const hasGirlChild = answers.girl_child === "Yes";

    console.log(`Checking eligibility for: ${schemeName}`);

    // PM Shram Yogi Maan-dhan Yojana (PM-SYM)
    if (schemeName.includes("PM Shram Yogi") || schemeName.includes("PM-SYM")) {
      const eligibleOccupations = ["street vendor", "construction worker", "fisherman", "casual labour"];
      const occupationMatch = eligibleOccupations.some(occ => occupation.includes(occ));
      return age >= 18 && age <= 40 && income <= 15000 && occupationMatch;
    }

    // Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)
    if (schemeName.includes("PMJJBY") || schemeName.includes("Jeevan Jyoti")) {
      return age >= 18 && age <= 50;
    }

    // Pradhan Mantri Suraksha Bima Yojana (PMSBY)
    if (schemeName.includes("PMSBY") || schemeName.includes("Suraksha Bima")) {
      return age >= 18 && age <= 70;
    }

    // Atal Pension Yojana (APY)
    if (schemeName.includes("Atal Pension") || schemeName.includes("APY")) {
      return age >= 18 && age <= 40;
    }

    // National Food Security Act (NFSA)
    if (schemeName.includes("NFSA") || schemeName.includes("Food Security")) {
      return bplCard === true;
    }

    // Indira Gandhi National Old Age Pension Scheme (IGNOAPS)
    if (schemeName.includes("IGNOAPS") || schemeName.includes("Old Age Pension")) {
      return age >= 60 && bplCard === true;
    }

    // PM Surya Ghar Muft Bijli Yojana
    if (schemeName.includes("Surya Ghar") || schemeName.includes("Solar")) {
      return landholding === true;
    }

    // Sukanya Samriddhi Yojana (SSY)
    if (schemeName.includes("Sukanya") || schemeName.includes("SSY")) {
      return hasGirlChild === true;
    }

    // National Pension Scheme for Traders (NPS-Traders)
    if (schemeName.includes("NPS-Traders") || schemeName.includes("Traders")) {
      const eligibleOccupations = ["shopkeeper"];
      const occupationMatch = eligibleOccupations.some(occ => occupation.includes(occ));
      return age >= 18 && age <= 40 && occupationMatch;
    }

    return false;
  };

  const handleOption = (option) => {
    if (!showOptions) return;
    
    const q = questions[currentQ];
    const newAnswers = { ...answers, [q.id]: option };
    
    setAnswers(newAnswers);
    setShowOptions(false);
    setMessages(prev => [...prev, { type: "user", text: option, id: Date.now() }]);
    
    const nextQ = currentQ + 1;
    
    if (nextQ < questions.length) {
      setTimeout(() => {
        setCurrentQ(nextQ);
        setMessages(prev => [...prev, { 
          type: "bot", 
          text: questions[nextQ].text,
          id: Date.now() 
        }]);
      }, 500);
    } else {
      // All questions answered - check eligibility
      setLoading(true);
      
      setTimeout(() => {
        // Filter schemes based on eligibility rules
        const eligible = allSchemes.filter(scheme => {
          return isEligibleForScheme(scheme.name, newAnswers);
        });
        
        console.log("User answers:", newAnswers);
        console.log("Eligible schemes:", eligible.map(s => s.name));
        
        setEligibleSchemes(eligible);
        setLoading(false);
        
        setMessages(prev => [...prev, { 
          type: "bot", 
          text: eligible.length > 0
            ? `✅ Found ${eligible.length} scheme(s) you may be eligible for!`
            : "😔 No schemes found matching your criteria. Try different answers?",
          id: Date.now()
        }]);
        setShowFreeInput(true);
      }, 500);
    }
  };

  const handleVoiceResult = (text) => {
    if (!showOptions) return;
    const match = questions[currentQ].options.find(
      opt => text.toLowerCase().includes(opt.toLowerCase())
    );
    if (match) handleOption(match);
  };

  const handleAskAI = async () => {
    if (!freeText.trim() || aiLoading) return;
    
    const userQ = freeText.trim();
    setFreeText("");
    setAiLoading(true);
    
    setMessages(prev => [...prev, { type: "user", text: userQ, id: Date.now() }]);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: "bot",
        text: "I'm here to help! Try the questionnaire to find schemes you're eligible for.",
        id: Date.now()
      }]);
      setAiLoading(false);
    }, 1000);
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setAnswers({});
    setShowOptions(false);
    setEligibleSchemes([]);
    setFreeText("");
    setShowFreeInput(false);
    setAiLoading(false);
    setMessages([{ type: "bot", text: questions[0].text, id: Date.now() }]);
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
          {messages.map((msg) => (
            msg.type === "bot"
              ? <BotMessage 
                  key={msg.id} 
                  text={msg.text} 
                  onDone={msg.id === messages[messages.length-1]?.id && !loading ? handleBotDone : null} 
                />
              : <UserMessage key={msg.id} text={msg.text} />
          ))}

          {/* Loading indicator */}
          {loading && (
            <div style={{ paddingLeft: "42px", marginBottom: "16px" }}>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
                🔍 Checking eligible schemes...
              </div>
            </div>
          )}

          {/* Option buttons */}
          {showOptions && !loading && currentQ < questions.length && (
            <div style={{ paddingLeft: "42px", marginBottom: "24px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "4px" }}>
                {questions[currentQ].options.map((opt) => (
                  <button 
                    key={opt} 
                    onClick={() => handleOption(opt)} 
                    style={{
                      padding: "10px 20px", background: "rgba(255,255,255,0.10)",
                      border: "1px solid rgba(255,255,255,0.4)", color: "#fff",
                      borderRadius: "999px", cursor: "pointer", fontSize: "13px",
                      fontWeight: "600", transition: "all 0.2s", backdropFilter: "blur(8px)"
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <VoiceMic onResult={handleVoiceResult} />
            </div>
          )}

          {/* Eligible Schemes Results - ONLY ONE BLOCK */}
          {eligibleSchemes.length > 0 && (
            <div style={{ paddingLeft: "42px", marginBottom: "16px" }}>
              <h3 style={{ 
                color: "#fff", 
                marginBottom: "12px",
                fontSize: "18px",
                fontWeight: "600" 
              }}>
                Schemes you may be eligible for:
              </h3>
              {eligibleSchemes.map((scheme, i) => (
                <SchemeCard key={i} scheme={scheme} />
              ))}
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

      {/* FREE TEXT INPUT BOX */}
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