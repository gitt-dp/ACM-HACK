import { useEffect, useState } from "react";

export default function TypewriterText({ text, speed = 40 }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <p className="text-slate-400 text-lg md:text-xl mt-6 min-h-[2.5rem]">
      {displayed}
      <span className="animate-pulse">|</span>
    </p>
  );
}