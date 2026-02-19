import AuthPage from "./AuthPage";

export default function EntryPage({ onSuccess }) {
  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center relative overflow-hidden">

      <div
        className="absolute w-[700px] h-[700px] opacity-20 blur-3xl rounded-full"
        style={{ backgroundImage: "linear-gradient(135deg,#38A2D7,#561139)" }}
      />

      <div className="glass-card rounded-3xl p-10 w-[420px] shadow-2xl">
        <AuthPage onSuccess={onSuccess} />
      </div>
    </div>
  );
}
