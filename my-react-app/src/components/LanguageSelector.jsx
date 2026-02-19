import { useUser } from "../context/UserContext";

export default function LanguageSelector({ onNext }) {
  const { setUserData } = useUser();

  const handleSelect = (lang) => {
    setUserData((prev) => ({ ...prev, language: lang }));
    onNext();
  };

  return (
    <div className="text-center space-y-8">
      <h1 className="text-4xl font-bold text-blue-700">
        Welcome / வரவேற்கிறோம்
      </h1>
      <p className="text-gray-500">Select your language</p>
      <div className="flex gap-6 justify-center">
        <button
          onClick={() => handleSelect("English")}
          className="px-10 py-5 bg-blue-600 text-white rounded-2xl text-xl font-semibold hover:bg-blue-700 transition"
        >
          English
        </button>
        <button
          onClick={() => handleSelect("Tamil")}
          className="px-10 py-5 bg-green-600 text-white rounded-2xl text-xl font-semibold hover:bg-green-700 transition"
        >
          தமிழ்
        </button>
      </div>
    </div>
  );
}