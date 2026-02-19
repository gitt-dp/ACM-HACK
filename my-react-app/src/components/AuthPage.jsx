import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuth = () => {
    // later you can add Supabase here
    navigate("/chat");   // 👉 go to chatbot page
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: "linear-gradient(to bottom right, #38A2D7, #561139)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
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
            className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900/60 border border-gray-700 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900/60 border border-gray-700 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900/60 border border-gray-700 
              text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          )}

          <button
            type="button"
            onClick={handleAuth}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-12 rounded mt-4 mx-auto block"
          >
            {isLogin ? "Log In" : "Sign Up"}
          </button>

        </div>

        {/* Toggle */}
        <div className="glass-card rounded-3xl p-10 shadow-2xl text-center text-white">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-blue-600 font-semibold"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Have an account?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-blue-600 font-semibold"
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
