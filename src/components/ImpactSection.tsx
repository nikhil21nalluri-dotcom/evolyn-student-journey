import React from 'react';

export const ImpactSection: React.FC = () => {
  return (
    <section id="impact" className="py-16 px-6 max-w-6xl mx-auto relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border border-[rgba(140,150,255,0.18)] rounded-2xl p-8 sm:p-10 bg-[rgba(14,16,40,0.55)] backdrop-blur-md shadow-xl">
        <div className="flex flex-col items-center justify-center p-2">
          <b className="font-baskerville text-4xl sm:text-5xl lg:text-6xl text-[#ff6a2b] font-bold block mb-1">
            4×
          </b>
          <span className="text-xs sm:text-sm text-[#a4a9d0] uppercase tracking-wider font-medium">
            Faster risk identification
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-2">
          <b className="font-baskerville text-4xl sm:text-5xl lg:text-6xl text-[#ff6a2b] font-bold block mb-1">
            360°
          </b>
          <span className="text-xs sm:text-sm text-[#a4a9d0] uppercase tracking-wider font-medium">
            View of each student
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-2">
          <b className="font-baskerville text-4xl sm:text-5xl lg:text-6xl text-[#ff6a2b] font-bold block mb-1">
            24/7
          </b>
          <span className="text-xs sm:text-sm text-[#a4a9d0] uppercase tracking-wider font-medium">
            AI trajectory guidance
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-2">
          <b className="font-baskerville text-4xl sm:text-5xl lg:text-6xl text-[#ff6a2b] font-bold block mb-1">
            1
          </b>
          <span className="text-xs sm:text-sm text-[#a4a9d0] uppercase tracking-wider font-medium">
            Unified platform
          </span>
        </div>
      </div>
    </section>
  );
};
