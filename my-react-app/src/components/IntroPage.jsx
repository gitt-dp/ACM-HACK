export default function IntroPage({ onStart }) {
  return (
    <div className="text-center max-w-3xl px-6">

      <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight">
        Scheme<span className="text-[#38A2D7]">AI</span>
      </h1>

      <h2 className="text-2xl md:text-3xl mt-4 font-semibold text-slate-200">
        Scheme Intelligence Assistant
      </h2>

      <button
        onClick={onStart}
        className="mt-12 px-12 py-4 rounded-2xl font-semibold text-lg btn-gradient"
      >
        Get Started →
      </button>

    </div>
  );
}
