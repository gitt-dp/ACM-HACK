import { useEffect, useRef } from "react";

export default function SplashScreen({ onDone }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // FULL SCREEN CANVAS
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // PARTICLES
    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6,
      alpha: Math.random(),
    }));

    let animFrame;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // GLOW CENTER BACKGROUND
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 1.4
      );
      gradient.addColorStop(0, "#1e3a8a33");
      gradient.addColorStop(1, "#00000000");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // PARTICLE DRAW
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120,200,255,${p.alpha})`;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      animFrame = requestAnimationFrame(draw);
    }

    draw();

    // AUTO NEXT PAGE
    const timer = setTimeout(() => {
      cancelAnimationFrame(animFrame);
      if (onDone) onDone();
    }, 3000);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animFrame);
    };
  }, [onDone]);

  return (
    <div className="w-screen h-screen flex items-center justify-center relative overflow-hidden bg-black">
      
      {/* CANVAS BACKGROUND */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* BIG CENTER GLOW */}
      <div className="absolute w-[750px] h-[750px] rounded-full bg-cyan-400/10 blur-3xl" />

      {/* TEXT CONTENT */}
      <div className="relative z-10 text-center">
        
        <h1 className="text-7xl md:text-8xl font-black tracking-tight mb-6">
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent">
            SCHEME AI
          </span>
        </h1>

        <p className="text-gray-300 text-xl md:text-2xl font-light">
          Your Government Scheme Assistant
        </p>

        {/* LOADING BAR */}
        <div className="mt-10 w-56 h-[3px] bg-gray-700 mx-auto overflow-hidden rounded-full">
          <div className="h-full w-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
        </div>

      </div>
    </div>
  );
}