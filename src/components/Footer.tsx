import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[rgba(140,150,255,0.18)] text-center text-[#a4a9d0] text-xs sm:text-sm py-6 px-6 bg-[rgba(3,4,16,0.6)] backdrop-blur-md relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-baskerville font-bold text-sm text-[#f0f1ff]">
          Evo<b className="text-[#ff6a2b]">lyn</b>
        </span>
        <span>Evolyn · Built for Student Success Intelligence</span>
        <div className="flex items-center gap-4 text-xs text-[#a4a9d0]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#impact" className="hover:text-white transition-colors">Impact</a>
          <a href="#simulator" className="hover:text-white transition-colors">Simulator</a>
        </div>
      </div>
    </footer>
  );
};
