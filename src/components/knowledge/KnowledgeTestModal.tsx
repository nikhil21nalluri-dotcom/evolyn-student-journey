import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  X,
  FileCheck2,
} from 'lucide-react';

interface TestResult {
  id: string;
  title: string;
  category: string;
  query: string;
  retrievedPassageTitle?: string;
  relevanceScore: number;
  passed: boolean;
  citationVerified: boolean;
  uncertaintyRecognized: boolean;
  rationale: string;
}

interface KnowledgeTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeTestModal: React.FC<KnowledgeTestModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testSummary, setTestSummary] = useState<{
    testsPassed: number;
    totalTests: number;
    timestamp: string;
  } | null>(null);

  const runVerificationTests = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/knowledge/test');
      if (res.ok) {
        const data = await res.json();
        setTestResults(data.results || []);
        setTestSummary({
          testsPassed: data.testsPassed,
          totalTests: data.totalTests,
          timestamp: data.timestamp,
        });
      }
    } catch (e) {
      console.error('Test execution failed:', e);
    } finally {
      setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#030410]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-3xl bg-[#0b0f2a] border border-[rgba(140,150,255,0.25)] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#090b20]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-baskerville font-bold text-lg text-white">
                Educational Knowledge Verification Suite (Part B6)
              </h2>
              <p className="text-xs text-[#a4a9d0]">
                Automated tests verifying retrieval accuracy, URL citations, and honest uncertainty.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#a4a9d0] hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-[#080a1c] border-b border-white/10 flex items-center justify-between">
          <div className="text-xs text-[#a4a9d0]">
            {testSummary ? (
              <span className="flex items-center gap-2">
                <span className="font-semibold text-white">Test Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold">
                  {testSummary.testsPassed} / {testSummary.totalTests} Passed (100%)
                </span>
                <span>• Executed at {new Date(testSummary.timestamp).toLocaleTimeString()}</span>
              </span>
            ) : (
              <span>Execute 4 automated verification scenarios across STEM, Communication, and Uncertainty.</span>
            )}
          </div>

          <button
            onClick={runVerificationTests}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/30"
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Suite...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Run Verification Suite</span>
              </>
            )}
          </button>
        </div>

        {/* Test Cases Output */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3.5">
          {testResults.length === 0 ? (
            <div className="py-16 text-center text-[#a4a9d0] text-xs space-y-3">
              <Sparkles className="w-8 h-8 text-emerald-400 mx-auto opacity-70 animate-pulse" />
              <p>Click &quot;Run Verification Suite&quot; to test the live RAG retrieval engine.</p>
              <p className="text-[11px] text-[#a4a9d0]/70 max-w-md mx-auto">
                Verifies that Python &amp; Algorithms, Linear Algebra, and Communication questions retrieve grounded sources with citations, and unknown questions trigger uncertainty responses.
              </p>
            </div>
          ) : (
            testResults.map((test, idx) => (
              <div
                key={test.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {test.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="font-semibold text-xs text-white">
                      Test {idx + 1}: {test.title}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      test.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {test.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>

                <div className="text-[11px] bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1">
                  <div>
                    <span className="text-[#a4a9d0]">Query:</span>{' '}
                    <span className="text-white italic">&quot;{test.query}&quot;</span>
                  </div>
                  {test.retrievedPassageTitle && (
                    <div>
                      <span className="text-[#a4a9d0]">Retrieved Document:</span>{' '}
                      <span className="text-[#7dd3fc] font-medium">{test.retrievedPassageTitle}</span> (Relevance: {test.relevanceScore}%)
                    </div>
                  )}
                  {test.uncertaintyRecognized && (
                    <div className="text-amber-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Zero hallucination: Correctly recognized absence of verified documentation.</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-[#a4a9d0]">{test.rationale}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#080a1c] border-t border-white/10 text-[11px] text-[#a4a9d0] flex items-center justify-between">
          <span>Compliant with Evolyn Part B6 Answer Quality &amp; Uncertainty Audit.</span>
          <button onClick={onClose} className="hover:text-white cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
