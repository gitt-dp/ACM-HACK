import { useState } from "react";
import { useUser } from "../context/UserContext";
import { supabase } from "../supabase";

export default function AuthPage({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const { setUserData } = useUser();

  const handleAuth = async () => {
    // Simple validation
    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      if (isLogin) {
        // LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email, password
        });

        if (error) throw error;

        if (data.user) {
          setUserData({ 
            user: {
              email: email,
              id: data.user.id
            }
          });
          onSuccess();
        }
      } else {
        // SIGN UP
        const { data, error } = await supabase.auth.signUp({
          email, password
        });

        if (error) throw error;

        if (data.user) {
          setUserData({ 
            user: {
              email: email,
              id: data.user.id
            }
          });
          
          if (data.user && !data.session) {
            alert("Please check your email for confirmation link");
          } else {
            onSuccess();
          }
        }
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Main Card */}
      <div className="bg-white border border-gray-300 rounded-md p-8 text-center">
        <h1 className="text-4xl font-bold mb-6 text-black">
          Scheme<span className="text-blue-600">AI</span>
        </h1>

        {!isLogin && (
          <p className="text-gray-500 text-sm mb-4">
            Sign up to find government schemes you qualify for.
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900/60 border border-gray-700 
          text-white placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900/60 border border-gray-700 
          text-white placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        {!isLogin && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900/60 border border-gray-700 
            text-white placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        )}

        <button
          onClick={handleAuth}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-12 rounded mt-4 mx-auto block"
        >
          {isLogin ? "Log In" : "Sign Up"}
        </button>
      </div>

      {/* Bottom Toggle Box */}
      <div className="glass-card rounded-3xl p-10 shadow-2xl text-center text-white">
        {isLogin ? (
          <>
            Don't have an account?{" "}
            <button
              onClick={() => {
                setIsLogin(false);
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-blue-600 font-semibold"
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
                setPassword("");
              }}
              className="text-blue-600 font-semibold"
            >
              Log in
            </button>
          </>
        )}
      </div>
    </div>
  );
}