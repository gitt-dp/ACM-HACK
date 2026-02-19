import AuthPage from "./AuthPage";

export default function EntryPage({ onSuccess }) {
  return (
    <div className="glass-card rounded-3xl p-10 w-[420px] shadow-2xl">
      <AuthPage onSuccess={onSuccess} />
    </div>
  );
}
