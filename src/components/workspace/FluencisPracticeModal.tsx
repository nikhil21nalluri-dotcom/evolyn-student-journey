import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Play,
  Square,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  Volume2,
  FileText,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { CuratedPracticeChallenge } from '../../data/skillsPlacementEngine';

interface FluencisPracticeModalProps {
  challenge: CuratedPracticeChallenge;
  studentId: string;
  onClose: () => void;
  onComplete: (data: {
    studentId: string;
    title: string;
    category: any;
    prompt: string;
    transcriptOrJournal: string;
    durationSeconds: number;
    reflectionMood?: 'confident' | 'progressing' | 'needs-review';
    reflectionNotes?: string;
  }) => void;
}

export const FluencisPracticeModal: React.FC<FluencisPracticeModalProps> = ({
  challenge,
  studentId,
  onClose,
  onComplete,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [journalText, setJournalText] = useState('');
  const [hasSpeechSupport, setHasSpeechSupport] = useState<boolean>(true);
  const [speechActive, setSpeechActive] = useState<boolean>(false);
  const [reflectionMood, setReflectionMood] = useState<'confident' | 'progressing' | 'needs-review'>('progressing');
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [step, setStep] = useState<'practice' | 'reflect'>('practice');

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          if (currentTranscript.trim()) {
            setJournalText(currentTranscript.trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition error or permission declined:', event.error);
          setSpeechActive(false);
        };

        recognition.onend = () => {
          setSpeechActive(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition init caught:', err);
        setHasSpeechSupport(false);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const handleStartPractice = () => {
    setIsRecording(true);
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    if (hasSpeechSupport && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setSpeechActive(true);
      } catch (e) {
        console.warn('Speech start caught:', e);
      }
    }
  };

  const handleStopPractice = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setSpeechActive(false);
    }
    setStep('reflect');
  };

  const handleFinish = () => {
    onComplete({
      studentId,
      title: challenge.title,
      category: challenge.category,
      prompt: challenge.prompt,
      transcriptOrJournal: journalText || 'Practice session completed without journal notes.',
      durationSeconds: elapsedSeconds || 60,
      reflectionMood,
      reflectionNotes,
    });
    onClose();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#090d29] border border-[#2dd4bf]/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#0c123b] border-b border-white/10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2dd4bf]/20 border border-[#2dd4bf]/40 flex items-center justify-center text-[#2dd4bf]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#2dd4bf]/15 text-[#5eead4] border border-[#2dd4bf]/30 text-[10px] font-mono font-bold">
                <span>{challenge.badge}</span>
                <span>•</span>
                <span>Self-Paced Practice</span>
              </div>
              <h3 className="font-baskerville text-lg sm:text-xl font-bold text-white mt-1">
                {challenge.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#a4a9d0] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-[#cbd5e1] flex-1">
          {step === 'practice' ? (
            <>
              {/* Practice Prompt Card */}
              <div className="p-4 rounded-2xl bg-[#05071a] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#93c5fd]">
                  <span className="uppercase font-bold tracking-wider">Speaking Prompt / Exercise</span>
                  <span className="flex items-center gap-1 text-[#a4a9d0]">
                    <Clock className="w-3.5 h-3.5" /> Target: {challenge.targetDurationMinutes} mins
                  </span>
                </div>
                <p className="text-sm font-medium text-white leading-relaxed italic">
                  "{challenge.prompt}"
                </p>

                {challenge.guidingPoints && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-[#8e96c8] block">
                      Guiding checkpoints:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-[#94a3b8] text-[11px]">
                      {challenge.guidingPoints.map((pt: string, i: number) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Timer & Speech Controls */}
              <div className="p-4 rounded-2xl bg-[#0e1442] border border-[#2dd4bf]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="font-mono text-2xl font-black text-white px-3 py-1.5 rounded-xl bg-black/40 border border-white/10">
                    {formatTime(elapsedSeconds)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      {isRecording ? 'Practice in Progress...' : 'Ready to begin'}
                    </div>
                    <div className="text-[10px] text-[#a4a9d0] font-mono">
                      {hasSpeechSupport
                        ? speechActive
                          ? '🎤 Browser voice input active'
                          : 'Voice input ready (or type below)'
                        : 'Text-based practice journal mode'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isRecording ? (
                    <button
                      onClick={handleStartPractice}
                      className="px-4 py-2 rounded-xl bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-[#2dd4bf]/30 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Practice</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopPractice}
                      className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-rose-500/30 cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Complete & Reflect</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Practice Journal / Live Speech Transcript Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#2dd4bf]" />
                    <span>Practice Journal & Spoken Notes</span>
                  </label>
                  <span className="text-[10px] text-[#8e96c8] font-mono">
                    {hasSpeechSupport ? 'Auto-transcribed or manually editable' : 'Manual text entry'}
                  </span>
                </div>
                <textarea
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="Record your spoken thoughts, outline points, or transcript here during practice..."
                  rows={5}
                  className="w-full p-3 rounded-2xl bg-[#05071a] border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-[#2dd4bf] transition-colors resize-none placeholder:text-white/30 font-sans"
                />
              </div>

              {/* Responsible non-causal disclaimer */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-[#8e96c8] flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-[#818cf8] shrink-0 mt-0.5" />
                <p>
                  This module tracks self-assessment activity and practice consistency. Completing a practice activity does not claim objective skill mastery or replace accredited faculty assessments.
                </p>
              </div>
            </>
          ) : (
            /* Step 2: Post-Practice Self-Reflection */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0e1442] border border-[#2dd4bf]/40 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#2dd4bf] mx-auto" />
                <h4 className="font-baskerville text-base font-bold text-white">
                  Practice Session Completed! ({formatTime(elapsedSeconds)})
                </h4>
                <p className="text-xs text-[#a4a9d0]">
                  Take 30 seconds to reflect on your delivery and comfort level.
                </p>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-white block mb-2">
                  How did you feel about this session?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setReflectionMood('confident')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      reflectionMood === 'confident'
                        ? 'bg-[#2dd4bf]/20 border-[#2dd4bf] text-white font-bold'
                        : 'bg-[#05071a] border-white/10 text-[#a4a9d0] hover:text-white'
                    }`}
                  >
                    <div className="text-lg mb-1">💪</div>
                    <div className="text-xs">Confident</div>
                    <div className="text-[10px] text-[#8e96c8]">Smooth flow</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReflectionMood('progressing')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      reflectionMood === 'progressing'
                        ? 'bg-[#60a5fa]/20 border-[#60a5fa] text-white font-bold'
                        : 'bg-[#05071a] border-white/10 text-[#a4a9d0] hover:text-white'
                    }`}
                  >
                    <div className="text-lg mb-1">📈</div>
                    <div className="text-xs">Progressing</div>
                    <div className="text-[10px] text-[#8e96c8]">Good effort</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReflectionMood('needs-review')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      reflectionMood === 'needs-review'
                        ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-white font-bold'
                        : 'bg-[#05071a] border-white/10 text-[#a4a9d0] hover:text-white'
                    }`}
                  >
                    <div className="text-lg mb-1">🎯</div>
                    <div className="text-xs">Needs Polish</div>
                    <div className="text-[10px] text-[#8e96c8]">Will repeat</div>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-white block">
                  Self-Reflection Notes (Optional):
                </label>
                <textarea
                  value={reflectionNotes}
                  onChange={(e) => setReflectionNotes(e.target.value)}
                  placeholder="Note what went well or what you'd like to refine next time (e.g., eye contact, pacing, fewer fillers)..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[#05071a] border border-white/10 text-white text-xs focus:outline-none focus:border-[#2dd4bf] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#0c123b] border-t border-white/10 flex items-center justify-between">
          {step === 'reflect' ? (
            <button
              onClick={() => setStep('practice')}
              className="text-xs text-[#a4a9d0] hover:text-white transition-colors cursor-pointer"
            >
              Back to Journal
            </button>
          ) : (
            <div className="text-[11px] text-[#8e96c8] font-mono">
              Activity duration: {formatTime(elapsedSeconds)}
            </div>
          )}

          {step === 'practice' ? (
            <button
              onClick={handleStopPractice}
              className="px-4 py-2 rounded-xl bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold text-xs transition-colors cursor-pointer"
            >
              Save Notes & Review
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-5 py-2 rounded-xl bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Record Practice Milestone</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
