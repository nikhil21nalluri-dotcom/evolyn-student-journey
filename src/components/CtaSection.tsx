import React from 'react';

interface CtaSectionProps {
  onOpenDemo: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onOpenDemo }) => {
  return (
    <section id="start" className="py-24 px-6 text-center max-w-4xl mx-auto relative z-10 pb-28">
      <h2 className="font-baskerville text-3xl sm:text-4xl md:text-5xl font-bold text-[#f0f1ff] mb-3 tracking-tight">
        Turn student data into student success
      </h2>
      <p className="text-[#a4a9d0] text-base sm:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
        Join the pilot and see your institution's first trajectory insights in minutes.
      </p>
      <button
        onClick={onOpenDemo}
        className="btn-primary px-8 py-3.5 rounded-full font-semibold text-sm sm:text-base text-white tracking-wide cursor-pointer inline-block"
      >
        Request a demo
      </button>
    </section>
  );
};
