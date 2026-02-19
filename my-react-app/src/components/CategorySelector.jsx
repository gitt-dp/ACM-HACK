import { useUser } from "../context/UserContext";

const categories = [
  { label: "Farmer", icon: "🌾" },
  { label: "Student", icon: "🎓" },
  { label: "Worker", icon: "🔧" },
  { label: "Women", icon: "👩" },
  { label: "Senior Citizen", icon: "👴" },
  { label: "General Low Income", icon: "💰" },
];

export default function CategorySelector({ onNext, onBack }) {
  const { setUserData } = useUser();

  const handleSelect = (category) => {
    setUserData((prev) => ({ ...prev, category }));
    onNext();
  };

  return (
    <div className="text-center space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Who Are You?</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => handleSelect(cat.label)}
            className="flex flex-col items-center p-6 bg-white rounded-2xl shadow hover:shadow-lg border-2 border-transparent hover:border-blue-400 transition"
          >
            <span className="text-5xl">{cat.icon}</span>
            <span className="mt-3 font-semibold text-gray-700">{cat.label}</span>
          </button>
        ))}
      </div>
      <button onClick={onBack} className="text-gray-400 underline text-sm">
        ← Back
      </button>
    </div>
  );
}