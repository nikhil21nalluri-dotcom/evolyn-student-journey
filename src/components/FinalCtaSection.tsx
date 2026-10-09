import React from 'react';
import { ArrowRight, Sparkles, Shield, HeartHandshake, School } from 'lucide-react';

interface FinalCtaSectionProps {
  onOpenDemo: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ onOpenDemo }) => {
  return (
    <section id="about" className="relative w-full pt-28 pb-16 px-6 md:px-12 z-20">
      <div className="max-w-7xl mx-auto">
        {/* Cinematic Grand Finale Banner */}
        <div className="relative rounded-3xl glass-panel-glow p-8 md:p-16 border border-pink-500/30 text-center overflow-hidden shadow-2xl">
          {/* Ambient Lighting Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-pink-500/20 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-pink-200 rounded-full bg-white/5 border border-white/10 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Transform Institutional Success</span>
            </div>

            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
              Understand The Student. <br />
              <span className="text-gradient-ethereal">Not Just The Score.</span>
            </h2>

            <p className="mt-6 text-base sm:text-lg md:text-xl text-purple-200/80 font-normal leading-relaxed max-w-2xl mx-auto text-balance">
              Evolyn turns student data into meaningful insight, helping institutions recognize
              change earlier and support students better.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onOpenDemo}
                className="group inline-flex items-center gap-2.5 px-8 py-4 text-sm md:text-base font-semibold tracking-wide text-white rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-xl shadow-pink-600/30 hover:scale-[1.02] cursor-pointer"
              >
                <span>Explore Evolyn</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onOpenDemo}
                className="px-7 py-3.5 text-sm md:text-base font-medium text-purple-200 hover:text-white rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              >
                <span>Experience Student Intelligence</span>
              </button>
            </div>

            {/* Institutional Trust Badges */}
            <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">FERPA & Privacy Compliant</h4>
                  <p className="text-xs text-purple-300/70 mt-1">
                    Student data is institutional-governed, encrypted, and never sold or commercialized.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HeartHandshake className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Human-Centered Advising</h4>
                  <p className="text-xs text-purple-300/70 mt-1">
                    AI flags early warning signals to empower human educators and mentors, not replace them.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <School className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">LMS Agnostic Integration</h4>
                  <p className="text-xs text-purple-300/70 mt-1">
                    Seamless connectors for Canvas, Blackboard, Moodle, and university SIS platforms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-purple-300/70">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-white text-base tracking-wider">EVOLYN</span>
            <span>·</span>
            <span>AI Student Success Intelligence Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#hero" className="hover:text-white transition-colors">Home</a>
            <a href="#intelligence" className="hover:text-white transition-colors">Intelligence</a>
            <a href="#journey" className="hover:text-white transition-colors">Student Journey</a>
            <a href="#why" className="hover:text-white transition-colors">Insights</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>

          <div>
            <span>© {new Date().getFullYear()} Evolyn Inc. Built for educational potential.</span>
          </div>
        </footer>
      </div>
    </section>
  );
};
