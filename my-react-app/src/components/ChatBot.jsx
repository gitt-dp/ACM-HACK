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
  const bottomRef = useRef(null);
  
  const { userData } = useUser();

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

  // Fetch and filter schemes
  const fetchEligibleSchemes = async (userAnswers) => {
    setLoading(true);
    
    try {
      console.log("🔍 FETCHING SCHEMES FROM SUPABASE...");
      console.log("📝 User Answers:", userAnswers);

      // Get all schemes from Supabase
      const { data: schemes, error } = await supabase
        .from('government_schemes')
        .select('*');

      if (error) {
        console.error("❌ Supabase Error:", error);
        throw error;
      }

      console.log(`✅ Found ${schemes.length} schemes in database`);
      console.log("📋 All schemes:", schemes.map(s => s.name));

      // For each scheme, log its eligibility criteria
      schemes.forEach((scheme, index) => {
        console.log(`\n--- Scheme ${index + 1}: ${scheme.name} ---`);
        console.log("Criteria:", JSON.stringify(scheme.eligibility_criteria, null, 2));
      });

      // Manual test with hardcoded expected matches
      console.log("\n🔍 TESTING WITH PROVIDED ANSWERS:");
      
      const testAnswers = {
        state: "Tamil Nadu",
        occupation: "Farmer",
        income: "Less than ₹10,000",
        age: "31-40",
        landholding: "Yes",
        bpl_card: "Yes",
        girl_child: "Yes"
      };

      console.log("Test answers:", testAnswers);

      // Test each scheme manually
      const expectedMatches = {
        "PM Shram Yogi Maan-dhan Yojana (PM-SYM)": true,
        "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)": true,
        "Pradhan Mantri Suraksha Bima Yojana (PMSBY)": true,
        "Atal Pension Yojana (APY)": true,
        "National Food Security Act (NFSA)": true,
        "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)": false,
        "PM Surya Ghar Muft Bijli Yojana": true,
        "Sukanya Samriddhi Yojana (SSY)": true,
        "National Pension Scheme for Traders (NPS-Traders)": false
      };

      // Filter schemes based on actual logic
      const filtered = schemes.filter(scheme => {
        const criteria = scheme.eligibility_criteria;
        let isEligible = true;
        const reasons = [];

        console.log(`\nChecking: ${scheme.name}`);

        // State check
        if (criteria.state && criteria.state !== "all" && criteria.state !== testAnswers.state) {
          isEligible = false;
          reasons.push(`State mismatch: need ${criteria.state}, got ${testAnswers.state}`);
        }

        // Age check
        if (criteria.min_age || criteria.max_age) {
          const age = getAgeNumeric(testAnswers.age);
          if (criteria.min_age && age < criteria.min_age) {
            isEligible = false;
            reasons.push(`Age too low: ${age} < ${criteria.min_age}`);
          }
          if (criteria.max_age && age > criteria.max_age) {
            isEligible = false;
            reasons.push(`Age too high: ${age} > ${criteria.max_age}`);
          }
        }

        // Income check
        if (criteria.max_income) {
          const income = getIncomeNumeric(testAnswers.income);
          if (income > criteria.max_income) {
            isEligible = false;
            reasons.push(`Income too high: ${income} > ${criteria.max_income}`);
          }
        }

        // Occupation check
        if (criteria.occupations && criteria.occupations.length > 0) {
          if (!criteria.occupations.includes("any")) {
            const userOcc = testAnswers.occupation.toLowerCase();
            const matchFound = criteria.occupations.some(occ => {
              const occLower = occ.toLowerCase();
              return userOcc.includes(occLower) || occLower.includes(userOcc.split(' ')[0]);
            });
            if (!matchFound) {
              isEligible = false;
              reasons.push(`Occupation mismatch: ${testAnswers.occupation} not in ${criteria.occupations.join(', ')}`);
            }
          }
        }

        // Landholding check
        if (criteria.landholding_required && testAnswers.landholding === "No") {
          isEligible = false;
          reasons.push(`Landholding required`);
        }

        // BPL check
        if (criteria.bpl_required && testAnswers.bpl_card === "No") {
          isEligible = false;
          reasons.push(`BPL card required`);
        }

        // Girl child check
        if (criteria.min_age_girl !== undefined && testAnswers.girl_child === "No") {
          isEligible = false;
          reasons.push(`Girl child required`);
        }

        console.log(`Result: ${isEligible ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}`);
        if (reasons.length > 0) {
          console.log('Reasons:', reasons);
        }

        // Compare with expected
        const expected = expectedMatches[scheme.name];
        if (expected !== undefined) {
          if (isEligible === expected) {
            console.log(`✓ Matches expected: ${expected}`);
          } else {
            console.log(`✗ MISMATCH! Expected: ${expected}, Got: ${isEligible}`);
          }
        }

        return isEligible;
      });

      console.log("\n🎯 FINAL ELIGIBLE SCHEMES:", filtered.map(s => s.name));
      setEligibleSchemes(filtered);

      // Add result message
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: "bot", 
          text: filtered.length > 0
            ? `✅ Found ${filtered.length} scheme(s) you may be eligible for!`
            : "😔 No schemes found matching your criteria. Check console for details.",
          id: Date.now()
        }]);
        setShowFreeInput(true);
      }, 500);

    } catch (error) {
      console.error('Error fetching schemes:', error);
      setMessages(prev => [...prev, { 
        type: "bot", 
        text: "Sorry, I'm having trouble connecting. Please try again.",
        id: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
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
      // Use the actual answers, not test answers
      fetchEligibleSchemes(newAnswers);
      
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        supabase
          .from('user_sessions')
          .update({ 
            user_data: { 
              ...userData,
              questionnaire: newAnswers 
            }
          })
          .eq('session_id', sessionId)
          .catch(err => console.log('Error saving answers:', err));
      }
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
        text: "I'm here to help! Check the console for debug information about scheme eligibility.",
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
                🔍 Searching for eligible schemes...
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

          {/* Eligible Schemes Results */}
          {eligibleSchemes.length > 0 && (
            <div style={{ paddingLeft: "42px", marginBottom: "16px" }}>
              <h3 style={{ color: "#fff", marginBottom: "12px" }}>Schemes you may be eligible for:</h3>
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