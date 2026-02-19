import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { supabase } from "../supabase";

export default function AuthPage({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { setUserData } = useUser();
  const navigate = useNavigate();

  const handleAuth = async () => {
    setError("");
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email, password
        });

        if (error) throw error;

        if (data.user) {
          await setUserData({ 
            user: {
              email: email,
              id: data.user.id
            }
          });
          
          if (onSuccess) {
            onSuccess();
          } else {
            navigate("/chat");
          }
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password
        });

        if (error) {
          if (error.message?.includes("rate limit") || error.status === 429) {
            throw new Error("Email rate limit reached. Please wait an hour or try with a different email.");
          }
          throw error;
        }

        if (data.user) {
          await setUserData({ 
            user: {
              email: email,
              id: data.user.id
            }
          });
          
          if (data.user && !data.session) {
            setError("Please check your email for confirmation link");
          } else {
            if (onSuccess) {
              onSuccess();
            } else {
              navigate("/chat");
            }
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: "linear-gradient(to bottom right, #38A2D7, #561139)",
        display: "flex",
        alignItems: "center",     // ✅ This centers vertically
        justifyContent: "center", // ✅ This centers horizontally
        margin: 0,
        padding: 0,
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* Added a wrapper div with flex column to stack the card and language selector */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        width: "100%",
        maxWidth: "400px"
      }}>
        {/* Main Card */}
        <div className="bg-white border border-gray-300 rounded-md p-8 text-center w-full">
          <h1 className="text-4xl font-bold mb-6 text-black">
            Scheme<span className="text-blue-600">AI</span>
          </h1>

          {!isLogin && (
            <p className="text-gray-500 text-sm mb-4">
              Sign up to find government schemes you qualify for.
            </p>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900/60 border border-gray-700 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900/60 border border-gray-700 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            disabled={loading}
          />

          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900/60 border border-gray-700 
              text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              disabled={loading}
            />
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-12 rounded mt-4 mx-auto block disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : (isLogin ? "Log In" : "Sign Up")}
          </button>

          {isLogin && (
            <button
              onClick={async () => {
                if (email) {
                  const { error } = await supabase.auth.resetPasswordForEmail(email);
                  if (!error) {
                    setError("Password reset email sent! Check your inbox.");
                  } else {
                    setError(error.message);
                  }
                } else {
                  setError("Please enter your email first");
                }
              }}
              className="text-sm text-blue-600 mt-2 hover:underline"
            >
              Forgot password?
            </button>
          )}
        </div>

        {/* Bottom Toggle Box - Now properly centered under the card */}
        <div className="glass-card rounded-3xl p-6 shadow-2xl text-center text-white w-full">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Have an account?{" "}
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                  setPassword("");
                }}
                className="text-blue-600 font-semibold hover:underline"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}