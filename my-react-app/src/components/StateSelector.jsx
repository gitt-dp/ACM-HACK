import { useUser } from "../context/UserContext";

const states = ["Tamil Nadu", "Karnataka", "Maharashtra", "Delhi"];

export default function StateSelector({ onNext, onBack }) {
  const { setUserData } = useUser();

  const handleSelect = (state) => {
    setUserData((prev) => ({ ...prev, state }));
    onNext();
  };

  return (
    <div className="text-center space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Select Your State</h1>
      <div className="flex flex-col gap-3 items-center">
        {states.map((s) => (
          <button
            key={s}
            onClick={() => handleSelect(s)}
            className="w-72 px-6 py-4 bg-white border-2 border-blue-400 rounded-xl text-blue-700 font-medium hover:bg-blue-50 transition"
          >
            {s}
          </button>
        ))}
      </div>
      <button onClick={onBack} className="text-gray-400 underline text-sm">
        ← Back
      </button>
    </div>
  );
}