export default function AuthPage({ onSuccess }) {
  return (
    <div className="text-white w-full">

      <h2 className="text-2xl font-semibold mb-6 text-center">Welcome</h2>

      <input
        type="email"
        placeholder="Email"
        className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900/60 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full mb-6 px-4 py-3 rounded-lg bg-gray-900/60 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
      />

      <button
        onClick={onSuccess}
        className="btn-gradient w-full py-3 rounded-lg font-medium"
      >
        Sign in
      </button>

    </div>
  );
}
