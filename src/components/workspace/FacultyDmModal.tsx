import React, { useState } from 'react';
import { X, Send, Heart, Sparkles, CheckCircle2, MessageSquare, Clock, User } from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { useAuth } from '../../context/AuthContext';
import { STUDENT_GROWTH_DATA } from '../../data/studentGrowthData';

interface FacultyDmModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudentId?: string;
}

export const FacultyDmModal: React.FC<FacultyDmModalProps> = ({
  isOpen,
  onClose,
  targetStudentId,
}) => {
  const { sendMessage, sendReply, getStudentMessages } = useLms();
  const { userProfile, user } = useAuth();
  const facultyAuthor = userProfile?.displayName || user?.displayName || 'Prof. Elena Vance';

  const [selectedStudentId, setSelectedStudentId] = useState(
    targetStudentId || STUDENT_GROWTH_DATA[0].id
  );
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [careCategory, setCareCategory] = useState<
    'Academic Support' | 'Wellness Check-in' | 'Placement Mentoring' | 'Project Guidance' | 'Encouragement'
  >('Wellness Check-in');
  const [quickReplyText, setQuickReplyText] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  // Sync if targetStudentId changes
  React.useEffect(() => {
    if (targetStudentId) {
      setSelectedStudentId(targetStudentId);
    }
  }, [targetStudentId]);

  if (!isOpen) return null;

  const currentStudent =
    STUDENT_GROWTH_DATA.find((s) => s.id === selectedStudentId) || STUDENT_GROWTH_DATA[0];

  const studentMessages = getStudentMessages(currentStudent.id);

  const quickCareTemplates = [
    {
      category: 'Wellness Check-in' as const,
      subject: 'Checking in on your semester rhythm and workload',
      body: `Hi ${currentStudent.name}, I noticed your activity was slightly more spaced out recently. I know balancing multiple courses can be demanding. How are you feeling this week? Please feel welcome to stop by during my office hours if you'd like a quick chat.`,
    },
    {
      category: 'Academic Support' as const,
      subject: `Support with course concepts in ${currentStudent.branch}`,
      body: `Hi ${currentStudent.name}, great persistence on the recent assignments. I wanted to share an additional set of practice references to help with the current unit. Let me know if you would like to review any questions together!`,
    },
    {
      category: 'Placement Mentoring' as const,
      subject: 'Upcoming campus placement preparation milestones',
      body: `Hi ${currentStudent.name}, your placement readiness metrics are trending nicely. Let's schedule a 15-minute mock interview session this Friday to practice behavioral and system design prompts.`,
    },
    {
      category: 'Encouragement' as const,
      subject: 'Kudos on your recent growth & consistency!',
      body: `Hi ${currentStudent.name}, I wanted to commend you on your strong dedication in our department. Your progress is noticeable and appreciated. Keep up this momentum!`,
    },
  ];

  const handleApplyTemplate = (tmpl: typeof quickCareTemplates[0]) => {
    setCareCategory(tmpl.category);
    setSubject(tmpl.subject);
    setMessageText(tmpl.body);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !subject.trim()) return;

    sendMessage(
      currentStudent.id,
      currentStudent.name,
      subject.trim(),
      messageText.trim(),
      careCategory
    );

    setSubject('');
    setMessageText('');
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
    }, 3000);
  };

  const handleSendQuickReply = (messageId: string) => {
    if (!quickReplyText.trim()) return;
    sendReply(messageId, quickReplyText.trim(), 'faculty', facultyAuthor);
    setQuickReplyText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0b0f2a] border border-[#2b3368] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1c224a] bg-[#0e1335]/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff6a2b] to-[#ff8a50] flex items-center justify-center text-white shadow-md">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-baskerville text-lg sm:text-xl font-bold text-white">
                  Personal Caring Direct Message
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#ff6a2b]/20 border border-[#ff6a2b]/30 text-[10px] font-mono text-[#ffb27a]">
                  Faculty ↔ Student DM
                </span>
              </div>
              <p className="text-xs text-[#9aa2d4]">
                Reach out personally to check in, offer guidance, or provide supportive feedback.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#9aa2d4] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-5 py-2.5 flex items-center space-x-2 text-xs text-emerald-300 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Direct care message delivered to {currentStudent.name}! Notification dispatched.</span>
          </div>
        )}

        {/* Content Body: Scrollable */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Student Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#06081c] border border-[#1f2552]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#182054] to-[#0c1033] border border-[#303a7d] flex items-center justify-center font-bold text-xs text-[#6f8dff] font-mono">
                {currentStudent.avatarInitials}
              </div>
              <div>
                <div className="text-xs text-[#8e96c8] font-mono uppercase">Target Student</div>
                <div className="text-sm font-bold text-white font-serif">{currentStudent.name}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#8e96c8]">Switch:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-[#0e1335] border border-[#232854] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#ff6a2b]"
              >
                {STUDENT_GROWTH_DATA.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.branch} - {s.studentId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Empathetic Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#c2c8f0] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ff8a50]" />
                <span>Empathetic Message Starters</span>
              </span>
              <span className="text-[10px] text-[#767ea8] font-mono">Click to prefill</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickCareTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="text-left p-2.5 rounded-xl bg-[#0e1335]/70 hover:bg-[#151c4a] border border-[#1f2552] hover:border-[#ff6a2b]/50 transition-all cursor-pointer group"
                >
                  <div className="text-xs font-semibold text-white group-hover:text-[#ff8a50]">
                    {tmpl.category}
                  </div>
                  <div className="text-[11px] text-[#8e96c8] line-clamp-1 mt-0.5">
                    {tmpl.subject}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Form */}
          <form onSubmit={handleSend} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                  Caring Dimension
                </label>
                <select
                  value={careCategory}
                  onChange={(e) => setCareCategory(e.target.value as any)}
                  className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff6a2b]"
                >
                  <option value="Wellness Check-in">🌿 Wellness Check-in</option>
                  <option value="Academic Support">📚 Academic Support</option>
                  <option value="Placement Mentoring">💼 Placement Mentoring</option>
                  <option value="Project Guidance">🚀 Project Guidance</option>
                  <option value="Encouragement">⭐ Encouragement & Recognition</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Checking in on your distributed systems module"
                  className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl px-3 py-2 text-xs text-white placeholder-[#5a6296] focus:outline-none focus:border-[#ff6a2b]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                Direct Message (Empathetic & Constructive)
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
                placeholder={`Write your personal note to ${currentStudent.name}...`}
                className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl p-3 text-xs text-white placeholder-[#5a6296] focus:outline-none focus:border-[#ff6a2b]"
                required
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#a4a9d0] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff6a2b] to-[#ff8a50] hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-[#ff6a2b]/25 flex items-center space-x-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Direct Care Message</span>
              </button>
            </div>
          </form>

          {/* Conversation History / Chat Thread with this student */}
          <div className="pt-4 border-t border-[#1c224a]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-white font-mono flex items-center space-x-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#6f8dff]" />
                <span>Conversation Thread with {currentStudent.name}</span>
                <span className="text-[10px] text-[#8e96c8]">({studentMessages.length} messages)</span>
              </h4>
            </div>

            {studentMessages.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#6b73a6] bg-[#06081c]/60 rounded-xl border border-[#181d45]">
                No prior direct messages with {currentStudent.name}. Send your first note above!
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {studentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3.5 rounded-xl bg-[#090d26] border border-[#1c224a] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full bg-[#ff6a2b]/20 border border-[#ff6a2b]/30 text-[9px] font-mono text-[#ffb27a]">
                          {msg.careCategory}
                        </span>
                        <span className="font-bold text-white">{msg.subject}</span>
                      </div>
                      <span className="text-[10px] text-[#8e96c8] font-mono">{msg.timestamp}</span>
                    </div>

                    <p className="text-[#c2c8f0] leading-relaxed text-[11px] bg-[#06081c]/60 p-2.5 rounded-lg border border-white/5">
                      {msg.message}
                    </p>

                    {/* Replies */}
                    {msg.replies && msg.replies.length > 0 && (
                      <div className="space-y-1.5 pl-3 border-l-2 border-[#6f8dff]/40 mt-2">
                        {msg.replies.map((rep) => (
                          <div key={rep.id} className="text-[11px]">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-white font-mono">{rep.senderName}</span>
                              <span className="text-[9px] text-[#8e96c8]">{rep.timestamp}</span>
                            </div>
                            <div className="text-[#a4addd] mt-0.5">{rep.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
