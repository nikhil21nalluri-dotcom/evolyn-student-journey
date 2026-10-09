import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audioEngine';

interface AmbientAudioToggleProps {
  scrollProgress: number;
}

export const AmbientAudioToggle: React.FC<AmbientAudioToggleProps> = ({ scrollProgress }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  useEffect(() => {
    if (isPlaying) {
      soundEngine.updateScrollProgress(scrollProgress);
    }
  }, [scrollProgress, isPlaying]);

  const toggleSound = async () => {
    setHasInteracted(true);
    if (!isPlaying) {
      const success = await soundEngine.start();
      if (success) setIsPlaying(true);
    } else {
      soundEngine.stop();
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-auto flex items-center gap-3">
      {/* Sound Controller Button */}
      <button
        onClick={toggleSound}
        aria-label={isPlaying ? 'Mute ambient soundscape' : 'Enable ambient soundscape'}
        className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all duration-300 border shadow-lg cursor-pointer ${
          isPlaying
            ? 'bg-[rgba(255,106,43,0.2)] border-[#ff6a2b]/60 shadow-[0_0_20px_rgba(255,106,43,0.3)] text-white'
            : 'bg-[rgba(14,16,40,0.75)] border-[rgba(140,150,255,0.2)] hover:border-[#ff6a2b]/40 text-[#a4a9d0] hover:text-[#f0f1ff]'
        } backdrop-blur-md`}
      >
        {isPlaying ? (
          <>
            {/* Animated sound wave bars */}
            <div className="flex items-center gap-0.5 h-3.5 px-0.5">
              <span className="w-0.5 bg-[#ff6a2b] rounded-full animate-pulse h-2" style={{ animationDuration: '0.6s' }} />
              <span className="w-0.5 bg-[#6f8dff] rounded-full animate-pulse h-3.5" style={{ animationDuration: '0.4s' }} />
              <span className="w-0.5 bg-[#ffb27a] rounded-full animate-pulse h-1.5" style={{ animationDuration: '0.7s' }} />
              <span className="w-0.5 bg-[#ff6a2b] rounded-full animate-pulse h-3" style={{ animationDuration: '0.5s' }} />
            </div>
            <Volume2 className="w-4 h-4 text-[#ff6a2b]" />
            <span className="text-xs font-semibold tracking-wide">
              Ambient Audio <span className="text-[10px] text-[#ffb27a] font-mono">({Math.round(320 + scrollProgress * 680)}Hz)</span>
            </span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 text-[#a4a9d0] group-hover:text-[#ff6a2b] transition-colors" />
            <span className="text-xs font-medium tracking-wide">
              Enable 3D Sound
            </span>
          </>
        )}
      </button>

      {/* Subtle First-Time Audio Hint */}
      {!hasInteracted && (
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(14,16,40,0.7)] border border-[rgba(140,150,255,0.2)] backdrop-blur-md text-[11px] text-[#a4a9d0] animate-bounce">
          <Sparkles className="w-3 h-3 text-[#ff6a2b]" />
          <span>Cinematic Soundscape</span>
        </div>
      )}
    </div>
  );
};
