import { useNavigate } from "react-router-dom";

export default function IntroPage() {
  const navigate = useNavigate();

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
        color: "white"
      }}
    >
      <div className="text-center max-w-3xl px-6">

        <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight">
          Scheme<span className="text-[#38A2D7]">AI</span>
        </h1>

        <h2 className="text-2xl md:text-3xl mt-4 font-semibold text-slate-200">
          Scheme Intelligence Assistant
        </h2>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-12 px-12 py-4 rounded-2xl font-semibold text-lg btn-gradient"
        >
          Get Started →
        </button>

      </div>
    </div>
  );
}
