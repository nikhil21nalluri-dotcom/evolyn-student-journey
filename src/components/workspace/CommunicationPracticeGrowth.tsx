import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Sparkles,
  Users,
  MessageSquare,
  Play,
  Square,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Volume2,
  PhoneCall,
  PhoneOff,
  Share2,
  Check,
  Compass,
  BookOpen,
  ExternalLink,
  FileCheck2,
  Lock,
  Key,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSkillsPlacement } from '../../context/SkillsPlacementContext';
import {
  CuratedPracticeChallenge,
  PracticeCategory,
  PracticeActivityRecord,
} from '../../data/skillsPlacementEngine';
import { FluencisPracticeModal } from './FluencisPracticeModal';
import { LiveWebRtcPracticeRoom } from './LiveWebRtcPracticeRoom';
import { KnowledgeLibraryModal } from '../knowledge/KnowledgeLibraryModal';
import { KnowledgeTestModal } from '../knowledge/KnowledgeTestModal';

interface CommunicationPracticeGrowthProps {
  studentId: string;
  studentName?: string;
  onNavigate?: (view: any) => void;
  defaultSubView?: 'coach' | 'rooms' | 'activities' | 'progress';
}

interface RetrievedSource {
  id: string;
  title: string;
  author: string;
  sourceUrl: string;
  license: string;
  topic: string;
  sectionTitle: string;
  excerpt: string;
  relevanceScore: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: RetrievedSource[];
  isGrounded?: boolean;
  uncertaintyAcknowledged?: boolean;
  expandedSources?: boolean;
}

interface PracticeRoom {
  id: string;
  title: string;
  category: PracticeCategory;
  categoryLabel: string;
  hostId: string;
  hostName: string;
  hostRole: string;
  accessType: 'public' | 'private' | string;
  passcode?: string;
  maxParticipants: number;
  participants: Array<{
    id: string;
    name: string;
    role: string;
    joinedAt: string;
    isMuted?: boolean;
    isVideoOn?: boolean;
  }>;
  createdAt: string;
  status: 'active' | 'closed';
  topicNotes?: string;
  messages: Array<{
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: string;
  }>;
}

export const CommunicationPracticeGrowth: React.FC<CommunicationPracticeGrowthProps> = ({
  studentId,
  studentName,
  onNavigate,
  defaultSubView = 'coach',
}) => {
  const { user, userProfile } = useAuth();
  const {
    challenges,
    practices,
    recordPracticeCompletion,
    getStudentOverview,
  } = useSkillsPlacement();

  // Active Sub-Section:
  // 1. 'coach' -> Evolyn AI Coach
  // 2. 'rooms' -> Live Practice Rooms
  // 3. 'activities' -> Communication Practice Activities
  // 4. 'progress' -> My Practice Progress
  const [activeSection, setActiveSection] = useState<'coach' | 'rooms' | 'activities' | 'progress'>(
    defaultSubView
  );

  useEffect(() => {
    if (defaultSubView) {
      setActiveSection(defaultSubView);
    }
  }, [defaultSubView]);

  const displayName = userProfile?.displayName || user?.displayName || studentName || 'Student';
  const effectiveStudentId = studentId || user?.uid || 'authenticated-student';
  const overview = getStudentOverview(effectiveStudentId);

  // Student's completed practices
  const studentPractices = practices.filter(
    (p) => p.studentId === effectiveStudentId || p.studentId === studentId
  );

  // Modals for Knowledge System & Testing
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // =========================================================================
  // 1. EVOLYN AI COACH STATE (KNOWLEDGE-GROUNDED RAG)
  // =========================================================================
  const [aiStatus, setAiStatus] = useState<{
    configured: boolean;
    model: string;
    ragConfigured?: boolean;
    notice?: string;
  }>({
    configured: true,
    model: 'gemini-3.8-flash',
    ragConfigured: true,
  });

  const [coachCategoryFilter, setCoachCategoryFilter] = useState<string>('all');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Hello ${displayName}! I'm your Evolyn AI Coach, grounded in our educational knowledge repository across Computer Science, Mathematics, Study Strategies, and Placement Communication.\n\nAsk me concept questions, technical trade-offs, or interview frameworks. Every verified response cites open educational textbooks and documentation, with transparent sources below.`,
      timestamp: 'Just now',
      isGrounded: true,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Check AI service status on mount
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/ai/status');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAiStatus({
              configured: data.configured,
              model: data.model || 'gemini-3.8-flash',
              ragConfigured: data.ragConfigured,
              notice: data.notice,
            });
          }
        }
      } catch (e) {
        console.warn('AI status check returned fallback:', e);
      }
    };
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeSection === 'coach') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeSection]);

  const toggleMessageSources = (msgId: string) => {
    setChatMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, expandedSources: !m.expandedSources } : m))
    );
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim() || isAiLoading) return;

    setAiError(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    if (!customPrompt) setChatInput('');
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          conversationHistory: newHistory.map((m) => ({ role: m.role, content: m.content })),
          studentId: effectiveStudentId,
          studentName: displayName,
          learningGoal: 'Technical articulation, programming problem-solving, and campus placement readiness',
          categoryFilter: coachCategoryFilter !== 'all' ? coachCategoryFilter : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `AI Coach request failed with status ${response.status}.`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.retrievedSources,
        isGrounded: data.isGrounded,
        uncertaintyAcknowledged: data.uncertaintyAcknowledged,
        expandedSources: Boolean(data.retrievedSources && data.retrievedSources.length > 0),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI Coach conversation error:', err);
      setAiError(err.message || 'Unable to connect to the educational AI coaching service.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // =========================================================================
  // 2. LIVE PRACTICE ROOMS STATE (WEBRTC + WEBSOCKET SIGNALING)
  // =========================================================================
  const [rooms, setRooms] = useState<PracticeRoom[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(false);
  const [roomCategoryFilter, setRoomCategoryFilter] = useState<string>('all');

  // Active full WebRTC Room session
  const [activeWebRtcRoom, setActiveWebRtcRoom] = useState<PracticeRoom | null>(null);

  // Modals for Room Creation & Join by ID
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomCategory, setNewRoomCategory] = useState<PracticeCategory>('speaking');
  const [newRoomAccessType, setNewRoomAccessType] = useState<'public' | 'private'>('public');
  const [newRoomPasscode, setNewRoomPasscode] = useState('');
  const [newRoomMaxParticipants, setNewRoomMaxParticipants] = useState(6);
  const [newRoomTopicNotes, setNewRoomTopicNotes] = useState('');

  // Join by ID modal
  const [isJoinByIdOpen, setIsJoinByIdOpen] = useState(false);
  const [joinRoomIdInput, setJoinRoomIdInput] = useState('');
  const [joinPasscodeInput, setJoinPasscodeInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  // Post-Room Practice Reflection Modal
  const [isPostReflectionOpen, setIsPostReflectionOpen] = useState(false);
  const [postReflectionText, setPostReflectionText] = useState('');
  const [postReflectionMood, setPostReflectionMood] = useState<'confident' | 'progressing' | 'needs-review'>('progressing');
  const [lastConcludedRoomTitle, setLastConcludedRoomTitle] = useState('');

  // Fetch rooms from backend API
  const fetchRooms = async () => {
    setIsRoomsLoading(true);
    try {
      let url = '/api/practice-rooms';
      if (roomCategoryFilter !== 'all') {
        url += `?category=${roomCategoryFilter}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (e) {
      console.warn('Backend practice rooms sync notice:', e);
    } finally {
      setIsRoomsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'rooms') {
      fetchRooms();
    }
  }, [activeSection, roomCategoryFilter]);

  const handleJoinPublicRoom = async (room: PracticeRoom) => {
    // If room is private, prompt for passcode via Join By ID modal
    if (room.accessType === 'private') {
      setJoinRoomIdInput(room.id);
      setIsJoinByIdOpen(true);
      return;
    }

    try {
      const res = await fetch(`/api/practice-rooms/${room.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: effectiveStudentId,
          participantName: displayName,
          participantRole: 'Participant',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to join room');
        return;
      }

      const data = await res.json();
      setActiveWebRtcRoom(data.room);
    } catch (err: any) {
      console.error('Join room error:', err);
      // Launch room with WebRTC directly
      setActiveWebRtcRoom(room);
    }
  };

  const handleJoinByIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    if (!joinRoomIdInput.trim()) return;

    try {
      const res = await fetch(`/api/practice-rooms/${joinRoomIdInput.trim()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: effectiveStudentId,
          participantName: displayName,
          participantRole: 'Participant',
          passcode: joinPasscodeInput.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setJoinError(err.error || 'Could not join room with provided ID and passcode.');
        return;
      }

      const data = await res.json();
      setIsJoinByIdOpen(false);
      setJoinRoomIdInput('');
      setJoinPasscodeInput('');
      setActiveWebRtcRoom(data.room);
    } catch (e: any) {
      setJoinError(e.message || 'Error connecting to room.');
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomTitle.trim()) return;

    const payload = {
      title: newRoomTitle.trim(),
      category: newRoomCategory,
      hostId: effectiveStudentId,
      hostName: displayName,
      hostRole: 'Student Host',
      accessType: newRoomAccessType,
      passcode: newRoomAccessType === 'private' ? newRoomPasscode.trim() : undefined,
      maxParticipants: newRoomMaxParticipants,
      topicNotes: newRoomTopicNotes.trim() || 'Peer practice session.',
    };

    try {
      const res = await fetch('/api/practice-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setRooms((prev) => [data.room, ...prev]);
        setIsCreatingRoom(false);
        setNewRoomTitle('');
        setNewRoomTopicNotes('');
        setNewRoomPasscode('');
        // Immediately enter room as host
        setActiveWebRtcRoom(data.room);
      }
    } catch (err) {
      console.error('Create room error:', err);
    }
  };

  const handleLeaveWebRtcRoom = () => {
    if (activeWebRtcRoom) {
      setLastConcludedRoomTitle(activeWebRtcRoom.title);
      setActiveWebRtcRoom(null);
      setIsPostReflectionOpen(true);
      fetchRooms();
    }
  };

  const handleSavePostReflection = () => {
    if (postReflectionText.trim() && lastConcludedRoomTitle) {
      recordPracticeCompletion({
        studentId: effectiveStudentId,
        title: `Live Room: ${lastConcludedRoomTitle}`,
        category: 'speaking',
        prompt: `Live peer discussion in ${lastConcludedRoomTitle}`,
        transcriptOrJournal: postReflectionText.trim(),
        durationSeconds: 300,
        reflectionMood: postReflectionMood,
        reflectionNotes: postReflectionText.trim(),
      });
      setPracticeSuccessNotice(`Recorded live room reflection for "${lastConcludedRoomTitle}"! Added to Practice History.`);
    }
    setIsPostReflectionOpen(false);
    setPostReflectionText('');
  };

  // =========================================================================
  // 3. COMMUNICATION PRACTICE ACTIVITIES STATE
  // =========================================================================
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<PracticeCategory | 'all'>('all');
  const [activeModalChallenge, setActiveModalChallenge] = useState<CuratedPracticeChallenge | null>(null);
  const [practiceSuccessNotice, setPracticeSuccessNotice] = useState<string | null>(null);

  const practiceCategoriesList: Array<{
    id: PracticeCategory;
    label: string;
    description: string;
    icon: any;
  }> = [
    {
      id: 'speaking',
      label: 'Everyday Speaking Practice',
      description: 'Oral fluency, impromptu articulation, and concise 2-minute elevator pitches.',
      icon: Mic,
    },
    {
      id: 'mock-interview',
      label: 'Interview Practice',
      description: 'Behavioral responses, technical STAR-method trade-offs, and panel questions.',
      icon: Users,
    },
    {
      id: 'presentation',
      label: 'Presentation Practice',
      description: 'Executive presence, architecture diagrams, and slide-deck cadence pacing.',
      icon: Sparkles,
    },
    {
      id: 'group-discussion',
      label: 'Group Discussion & Debate',
      description: 'Constructive counter-arguments, active listening, and consensus building.',
      icon: MessageSquare,
    },
    {
      id: 'technical-discussion',
      label: 'Technical Discussion',
      description: 'Engineering design defense, modular tradeoffs, and debugging walkthroughs.',
      icon: Compass,
    },
    {
      id: 'placement-communication',
      label: 'Placement Communication',
      description: 'Campus placement drive etiquette, HR fit dialogue, and corporate articulation.',
      icon: Award,
    },
  ];

  const filteredChallenges = challenges.filter((c) => {
    if (selectedCategoryFilter === 'all') return true;
    return c.category === selectedCategoryFilter;
  });

  const handlePracticeCompleted = (data: {
    studentId: string;
    title: string;
    category: any;
    prompt: string;
    transcriptOrJournal: string;
    durationSeconds: number;
    reflectionMood?: 'confident' | 'progressing' | 'needs-review';
    reflectionNotes?: string;
  }) => {
    recordPracticeCompletion(data);
    setPracticeSuccessNotice(`Completed practice: "${data.title}"! Milestone recorded in Success Score.`);
    setTimeout(() => setPracticeSuccessNotice(null), 4500);
  };

  return (
    <div className="space-y-6 text-[#f0f1ff] animate-fadeIn">
      {/* Top Banner: Fluencis × Evolyn Integrated Space */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0c1a36] via-[#09152b] to-[#070e1e] border border-[#2dd4bf]/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2dd4bf]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2dd4bf]/15 border border-[#2dd4bf]/30 text-xs font-mono font-bold text-[#5eead4] mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2dd4bf]" />
              <span>EVOLYN × FLUENCIS INTEGRATED DEVELOPMENT WORKSPACE</span>
            </div>
            <h2 className="font-baskerville text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Communication Practice &amp; Growth
            </h2>
            <p className="text-xs sm:text-sm text-[#cbd5e1] mt-1 max-w-2xl leading-relaxed">
              Strengthen your oral communication, placement interview agility, and technical dialogue with AI-guided coaching, live peer pods, and structured practice challenges.
            </p>
          </div>

          {/* Quick AI & Readiness Badges */}
          <div className="flex flex-wrap items-center gap-3 font-mono">
            <button
              onClick={() => setIsKnowledgeModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-[#0b1226]/80 hover:bg-[#0f1833] border border-[#2dd4bf]/30 flex items-center gap-2.5 shadow-md transition-colors cursor-pointer text-left"
              title="Open Educational Knowledge Repository (RAG)"
            >
              <BookOpen className="w-4 h-4 text-[#2dd4bf]" />
              <div>
                <div className="text-[10px] text-[#8e96c8] uppercase">Knowledge RAG</div>
                <div className="text-xs font-bold text-white">Open Repository</div>
              </div>
            </button>

            <button
              onClick={() => setIsTestModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-[#0b1226]/80 hover:bg-[#0f1833] border border-emerald-500/30 flex items-center gap-2.5 shadow-md transition-colors cursor-pointer text-left"
              title="Run Automated Knowledge Verification Tests"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-[#8e96c8] uppercase">Knowledge Audit</div>
                <div className="text-xs font-bold text-emerald-300">Run Tests</div>
              </div>
            </button>

            <div className="px-3.5 py-2 rounded-2xl bg-[#0b1226]/80 border border-[#38bdf8]/30 flex items-center gap-2.5 shadow-md">
              <Mic className="w-4 h-4 text-[#38bdf8]" />
              <div>
                <div className="text-[10px] text-[#8e96c8] uppercase">Completed Sessions</div>
                <div className="text-xs font-bold text-white font-mono">
                  {studentPractices.length} Sessions
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Main Sub-Section Navigation Tabs */}
        <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSection('coach')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'coach'
                ? 'bg-[#2dd4bf] text-black shadow-md shadow-[#2dd4bf]/25 font-bold'
                : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>1. Evolyn AI Coach</span>
          </button>

          <button
            onClick={() => setActiveSection('rooms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'rooms'
                ? 'bg-[#2dd4bf] text-black shadow-md shadow-[#2dd4bf]/25 font-bold'
                : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. Live Practice Rooms</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] ml-1">
              {rooms.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('activities')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'activities'
                ? 'bg-[#2dd4bf] text-black shadow-md shadow-[#2dd4bf]/25 font-bold'
                : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>3. Practice Activities</span>
          </button>

          <button
            onClick={() => setActiveSection('progress')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'progress'
                ? 'bg-[#2dd4bf] text-black shadow-md shadow-[#2dd4bf]/25 font-bold'
                : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>4. My Practice Progress</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] ml-1">
              {studentPractices.length}
            </span>
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {practiceSuccessNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 font-mono flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{practiceSuccessNotice}</span>
        </div>
      )}

      {/* =====================================================================
          SECTION 1: EVOLYN AI COACH (KNOWLEDGE-GROUNDED RAG CHAT)
      ===================================================================== */}
      {activeSection === 'coach' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2 rounded-3xl bg-[#090d26] border border-[#1f295c] shadow-2xl flex flex-col h-[700px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 bg-[#0c1236] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0d9488] to-[#2dd4bf] flex items-center justify-center text-slate-950 font-bold shadow-md shadow-[#2dd4bf]/20">
                  <Sparkles className="w-4 h-4 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-baskerville text-sm sm:text-base font-bold text-white">
                      Evolyn AI Coach
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                      RAG GROUNDED
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9aa2d4]">
                    Knowledge-backed responses with source citations, algorithm proofs, and interview guides.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Domain Selector */}
                <select
                  value={coachCategoryFilter}
                  onChange={(e) => setCoachCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-[#a4a9d0] focus:outline-none focus:border-[#2dd4bf]"
                  title="Filter by Educational Domain"
                >
                  <option value="all">All Domains</option>
                  <option value="computer-science">Computer Science & Algorithms</option>
                  <option value="mathematics-engineering">Mathematics & Engineering</option>
                  <option value="academic-study">Study & Revision</option>
                  <option value="communication-english">Communication & Articulation</option>
                  <option value="career-placement">Placement & Interviews</option>
                </select>

                <button
                  onClick={() => {
                    setChatMessages([
                      {
                        id: `reset-${Date.now()}`,
                        role: 'assistant',
                        content: `Fresh coaching session initialized for ${displayName}! What concept or interview question would you like to explore?`,
                        timestamp: 'Just now',
                      },
                    ]);
                    setAiError(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-[#a4a9d0] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  title="Restart coaching conversation"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* AI Status Banner if unconfigured */}
            {!aiStatus.configured && (
              <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs flex items-center justify-between px-5 font-mono">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Deterministic Knowledge Fallback Active. (Supply GEMINI_API_KEY in Secrets for live generative dialog).
                  </span>
                </div>
              </div>
            )}

            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {chatMessages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAssistant && (
                      <div className="w-7 h-7 rounded-lg bg-[#2dd4bf]/20 border border-[#2dd4bf]/40 flex items-center justify-center text-[#2dd4bf] shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                        isAssistant
                          ? 'bg-[#121940] border border-[#26336e] text-[#f0f1ff]'
                          : 'bg-gradient-to-r from-[#0d9488] to-[#0284c7] text-white shadow-lg'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Uncertainty Recognition Alert */}
                      {isAssistant && msg.uncertaintyAcknowledged && (
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Honest Uncertainty: No verified documentation in repository for this specific topic.</span>
                        </div>
                      )}

                      {/* Retrieved Sources & Citations Drawer */}
                      {isAssistant && msg.sources && msg.sources.length > 0 && (
                        <div className="pt-2 border-t border-white/10 space-y-1.5">
                          <button
                            onClick={() => toggleMessageSources(msg.id)}
                            className="flex items-center justify-between w-full text-[11px] font-mono text-[#5eead4] hover:underline cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="w-3 h-3 text-[#2dd4bf]" />
                              <span>Verified Citations ({msg.sources.length} sources)</span>
                            </span>
                            {msg.expandedSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {msg.expandedSources && (
                            <div className="space-y-1.5 animate-fadeIn">
                              {msg.sources.map((s, idx) => (
                                <div
                                  key={s.id || idx}
                                  className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] space-y-1"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="font-semibold text-white truncate">
                                      {idx + 1}. {s.title}
                                    </div>
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono shrink-0">
                                      {s.relevanceScore}% match
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-[#a4a9d0]">
                                    Author: {s.author} • License: {s.license}
                                  </div>
                                  <p className="text-[#cbd5e1] italic text-[10px] line-clamp-2">
                                    &quot;{s.excerpt}&quot;
                                  </p>
                                  {s.sourceUrl && (
                                    <a
                                      href={s.sourceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#38bdf8] hover:underline flex items-center gap-1 text-[10px]"
                                    >
                                      Inspect source <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`text-[10px] font-mono mt-1 text-right ${
                          isAssistant ? 'text-[#8e96c8]' : 'text-white/70'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Loading State */}
              {isAiLoading && (
                <div className="flex gap-3 justify-start items-center animate-fadeIn">
                  <div className="w-7 h-7 rounded-lg bg-[#2dd4bf]/20 border border-[#2dd4bf]/40 flex items-center justify-center text-[#2dd4bf] shrink-0">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-[#121940] border border-[#26336e] text-xs text-[#5eead4] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-ping" />
                    <span>Searching educational knowledge repository &amp; formulating citations...</span>
                  </div>
                </div>
              )}

              {/* Error State */}
              {aiError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                  <button
                    onClick={() => handleSendMessage(chatMessages[chatMessages.length - 1]?.content)}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-[11px] font-mono text-rose-200 transition-colors cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Grounded Question Prompts */}
            <div className="px-4 py-2 border-t border-white/5 bg-[#080c22] flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
              <span className="text-[#8e96c8] font-mono shrink-0">Sample Queries:</span>
              <button
                onClick={() =>
                  handleSendMessage('Why is binary search O(log n) and how does dividing the search space bound comparisons?')
                }
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#cbd5e1] whitespace-nowrap transition-colors cursor-pointer border border-white/5"
              >
                Binary Search Complexity (CS)
              </button>
              <button
                onClick={() =>
                  handleSendMessage('Explain eigenvalues and eigenvectors in linear algebra: how does Ax = λx work?')
                }
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#cbd5e1] whitespace-nowrap transition-colors cursor-pointer border border-white/5"
              >
                Eigenvalues Derivation (Math)
              </button>
              <button
                onClick={() =>
                  handleSendMessage('How do I structure behavioral interview answers using the STAR method?')
                }
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#cbd5e1] whitespace-nowrap transition-colors cursor-pointer border border-white/5"
              >
                STAR Method (Communication)
              </button>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 sm:p-4 border-t border-white/10 bg-[#0c1236] flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask an educational question in CS, Math, Study Planning, or Placement Prep..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-[#06091c] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#2dd4bf] transition-colors"
                disabled={isAiLoading}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAiLoading}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  chatInput.trim() && !isAiLoading
                    ? 'bg-[#2dd4bf] text-black hover:bg-[#14b8a6] shadow-md shadow-[#2dd4bf]/20'
                    : 'bg-white/5 text-[#6c739e] cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask Coach</span>
              </button>
            </form>
          </div>

          {/* Coach Guidance Framework & RAG Transparency Panel */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#0c1033] border border-[#222955] shadow-xl space-y-4">
              <h4 className="font-baskerville text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#5eead4]" />
                <span>RAG Knowledge Grounding</span>
              </h4>
              <p className="text-xs text-[#a4a9d0] leading-relaxed">
                Evolyn AI Coach retrieves passages from authorized open-access curriculum materials before formulating each response:
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#06081c] border border-white/5 flex items-start justify-between">
                  <div>
                    <div className="font-bold text-[#5eead4]">1. Python &amp; Algorithms</div>
                    <div className="text-[11px] text-[#9aa2d4] mt-0.5">
                      Python Software Foundation docs &amp; Big-O analysis.
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#a4a9d0]">PSF 2.0</span>
                </div>

                <div className="p-3 rounded-xl bg-[#06081c] border border-white/5 flex items-start justify-between">
                  <div>
                    <div className="font-bold text-[#5eead4]">2. Mathematics &amp; Engineering</div>
                    <div className="text-[11px] text-[#9aa2d4] mt-0.5">
                      OpenStax Calculus &amp; MIT OpenCourseWare 18.06.
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#a4a9d0]">CC BY-NC-SA</span>
                </div>

                <div className="p-3 rounded-xl bg-[#06081c] border border-white/5 flex items-start justify-between">
                  <div>
                    <div className="font-bold text-[#5eead4]">3. Communication &amp; Placement</div>
                    <div className="text-[11px] text-[#9aa2d4] mt-0.5">
                      STAR framework and technical problem-solving.
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#a4a9d0]">CC BY 4.0</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setIsKnowledgeModalOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#a4a9d0] hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#2dd4bf]" />
                  <span>Manage Knowledge Sources</span>
                </button>
                <button
                  onClick={() => setIsTestModalOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Run Verification Test Suite</span>
                </button>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#131f45] to-[#0a122e] border border-[#2dd4bf]/25 shadow-xl text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-[#5eead4] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Honest Uncertainty Policy</span>
              </div>
              <p className="text-[#a4a9d0] text-[11px] leading-relaxed">
                When a query asks about unindexed or unverifiable claims, Evolyn explicitly reports uncertainty rather than hallucinating citations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 2: LIVE PRACTICE ROOMS (WEBRTC AUDIO/VIDEO & CHAT)
      ===================================================================== */}
      {activeSection === 'rooms' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Active Live WebRTC Practice Room Component */}
          {activeWebRtcRoom && (
            <LiveWebRtcPracticeRoom
              roomId={activeWebRtcRoom.id}
              roomTitle={activeWebRtcRoom.title}
              categoryLabel={activeWebRtcRoom.categoryLabel}
              topicNotes={activeWebRtcRoom.topicNotes}
              currentUserId={effectiveStudentId}
              currentUserName={displayName}
              isHost={activeWebRtcRoom.hostId === effectiveStudentId}
              passcode={activeWebRtcRoom.passcode}
              onLeaveRoom={handleLeaveWebRtcRoom}
            />
          )}

          {/* ROOM DISCOVERY & JOIN CONTROLS */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-baskerville text-xl sm:text-2xl font-bold text-white">
                  Real-Time Practice Rooms
                </h3>
                <p className="text-xs text-[#a4a9d0]">
                  Public cohort circles and private invite-only pods for speaking, mock interviews, and technical debates.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setIsJoinByIdOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#a4a9d0] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Join by Room ID</span>
                </button>

                <button
                  onClick={fetchRooms}
                  disabled={isRoomsLoading}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#a4a9d0] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-mono"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRoomsLoading ? 'animate-spin text-[#ff6a2b]' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={() => setIsCreatingRoom(true)}
                  className="px-4 py-2 rounded-xl bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#2dd4bf]/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Room</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
              {[
                { id: 'all', label: 'All Rooms' },
                { id: 'speaking', label: 'Speaking' },
                { id: 'mock-interview', label: 'Mock Interview' },
                { id: 'presentation', label: 'Presentation' },
                { id: 'group-discussion', label: 'Group Discussion' },
                { id: 'technical-discussion', label: 'Technical Discussion' },
                { id: 'debate', label: 'Debate' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setRoomCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                    roomCategoryFilter === cat.id
                      ? 'bg-[#2dd4bf] text-black font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-[#a4a9d0]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Room Cards List */}
            {isRoomsLoading ? (
              <div className="py-16 text-center text-[#a4a9d0] text-xs">Loading available practice rooms...</div>
            ) : rooms.length === 0 ? (
              <div className="py-16 text-center text-[#a4a9d0] text-xs space-y-2 bg-white/5 rounded-3xl border border-white/10 p-6">
                <Users className="w-8 h-8 text-[#2dd4bf] mx-auto opacity-70" />
                <p>No active public rooms in this category right now.</p>
                <button
                  onClick={() => setIsCreatingRoom(true)}
                  className="px-4 py-2 rounded-xl bg-[#2dd4bf] text-black font-bold text-xs cursor-pointer inline-block mt-2"
                >
                  Create the First Room
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-6 rounded-3xl bg-[#0c1033] border border-[#222955] hover:border-[#2dd4bf]/50 transition-all shadow-xl space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#2dd4bf]/15 text-[#5eead4] font-mono text-[10px] font-bold border border-[#2dd4bf]/30">
                          {room.categoryLabel}
                        </span>
                        {room.accessType === 'private' ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono text-[10px] border border-amber-500/20">
                            <Lock className="w-2.5 h-2.5" /> Private
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-white/5 text-[#8e96c8] font-mono text-[10px]">
                            Public Cohort
                          </span>
                        )}
                      </div>

                      <h4 className="font-baskerville text-base font-bold text-white mb-1.5">
                        {room.title}
                      </h4>
                      <p className="text-xs text-[#9aa2d4] line-clamp-2">
                        {room.topicNotes}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="text-xs font-mono text-[#8e96c8]">
                        Host: <span className="text-white">{room.hostName}</span>
                        <div className="text-[11px] text-[#5eead4]">
                          {room.participants.length}/{room.maxParticipants} participants
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinPublicRoom(room)}
                        className="px-4 py-2 rounded-xl bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#2dd4bf]/20"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Join</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Create Room Modal */}
            {isCreatingRoom && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                <div className="w-full max-w-lg bg-[#0b0f2a] border border-[#2b3368] rounded-3xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-baskerville text-lg font-bold text-white">
                      Create Practice Room
                    </h3>
                    <button
                      onClick={() => setIsCreatingRoom(false)}
                      className="p-1 rounded-lg hover:bg-white/10 text-[#a4a9d0]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateRoom} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                        Room Topic &amp; Focus Title *
                      </label>
                      <input
                        type="text"
                        value={newRoomTitle}
                        onChange={(e) => setNewRoomTitle(e.target.value)}
                        placeholder="e.g. Distributed Consensus Mock Interview Practice"
                        className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl p-3 text-white focus:outline-none focus:border-[#2dd4bf]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                          Category
                        </label>
                        <select
                          value={newRoomCategory}
                          onChange={(e) => setNewRoomCategory(e.target.value as PracticeCategory)}
                          className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#2dd4bf]"
                        >
                          <option value="speaking">Everyday Speaking</option>
                          <option value="mock-interview">Interview Practice</option>
                          <option value="presentation">Presentation Practice</option>
                          <option value="group-discussion">Group Discussion</option>
                          <option value="technical-discussion">Technical Discussion</option>
                          <option value="placement-communication">Placement Communication</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                          Access Type
                        </label>
                        <select
                          value={newRoomAccessType}
                          onChange={(e) => setNewRoomAccessType(e.target.value as any)}
                          className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#2dd4bf]"
                        >
                          <option value="public">Public (Discoverable)</option>
                          <option value="private">Private (Passcode Protected)</option>
                        </select>
                      </div>
                    </div>

                    {newRoomAccessType === 'private' && (
                      <div>
                        <label className="block text-[11px] font-mono text-amber-300 uppercase mb-1">
                          Private Passcode *
                        </label>
                        <input
                          type="text"
                          required
                          value={newRoomPasscode}
                          onChange={(e) => setNewRoomPasscode(e.target.value)}
                          placeholder="e.g. evolyn-782"
                          className="w-full bg-[#06081c] border border-amber-500/40 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400 font-mono"
                        />
                        <p className="text-[10px] text-[#a4a9d0] mt-1">
                          Only peers with both Room ID and this Passcode can join this room.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                        Max Capacity
                      </label>
                      <select
                        value={newRoomMaxParticipants}
                        onChange={(e) => setNewRoomMaxParticipants(Number(e.target.value))}
                        className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#2dd4bf]"
                      >
                        <option value={2}>2 Participants (1-on-1 Mock)</option>
                        <option value={4}>4 Participants (Small Pod)</option>
                        <option value={6}>6 Participants (Standard Circle)</option>
                        <option value={8}>8 Participants (Large Debate)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                        Discussion Notes &amp; Preparation Guideline
                      </label>
                      <textarea
                        value={newRoomTopicNotes}
                        onChange={(e) => setNewRoomTopicNotes(e.target.value)}
                        rows={3}
                        placeholder="What should participants prepare or bring to this practice room?"
                        className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl p-3 text-white focus:outline-none focus:border-[#2dd4bf]"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCreatingRoom(false)}
                        className="px-4 py-2 rounded-xl bg-white/5 text-xs text-[#a4a9d0]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#2dd4bf] text-black font-bold text-xs cursor-pointer shadow-md"
                      >
                        Launch Room
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Join by Room ID Modal */}
            {isJoinByIdOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                <div className="w-full max-w-md bg-[#0b0f2a] border border-[#2b3368] rounded-3xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-baskerville text-lg font-bold text-white flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#38bdf8]" />
                      <span>Join Room by ID</span>
                    </h3>
                    <button
                      onClick={() => setIsJoinByIdOpen(false)}
                      className="p-1 rounded-lg hover:bg-white/10 text-[#a4a9d0]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {joinError && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{joinError}</span>
                    </div>
                  )}

                  <form onSubmit={handleJoinByIdSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                        Unique Room ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={joinRoomIdInput}
                        onChange={(e) => setJoinRoomIdInput(e.target.value)}
                        placeholder="e.g. room-priv-comm-8f2a1b94"
                        className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl p-3 text-white focus:outline-none focus:border-[#38bdf8] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                        Passcode (if private room)
                      </label>
                      <input
                        type="text"
                        value={joinPasscodeInput}
                        onChange={(e) => setJoinPasscodeInput(e.target.value)}
                        placeholder="Leave blank if public room"
                        className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl p-3 text-white focus:outline-none focus:border-[#38bdf8] font-mono"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsJoinByIdOpen(false)}
                        className="px-4 py-2 rounded-xl bg-white/5 text-xs text-[#a4a9d0]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#38bdf8] text-black font-bold text-xs cursor-pointer shadow-md"
                      >
                        Connect to Room
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Post Room Practice Reflection Modal */}
            {isPostReflectionOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                <div className="w-full max-w-md bg-[#0b0f2a] border border-[#2dd4bf]/40 rounded-3xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-baskerville text-lg font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#2dd4bf]" />
                      <span>Log Practice Reflection</span>
                    </h3>
                    <button
                      onClick={() => setIsPostReflectionOpen(false)}
                      className="p-1 rounded-lg hover:bg-white/10 text-[#a4a9d0]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-[#a4a9d0]">
                    You just completed a session in <strong className="text-white">{lastConcludedRoomTitle}</strong>. Record a quick takeaway to strengthen your Explainable Success Score and Practice History.
                  </p>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                        How did you feel about your delivery?
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'confident', label: 'Confident' },
                          { id: 'progressing', label: 'Progressing' },
                          { id: 'needs-review', label: 'Needs Review' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPostReflectionMood(m.id as any)}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                              postReflectionMood === m.id
                                ? 'bg-[#2dd4bf]/20 border-[#2dd4bf] text-[#5eead4] font-bold'
                                : 'bg-white/5 border-white/10 text-[#a4a9d0]'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                        Personal Takeaway / Notes
                      </label>
                      <textarea
                        rows={3}
                        value={postReflectionText}
                        onChange={(e) => setPostReflectionText(e.target.value)}
                        placeholder="What went well? Any filler words to reduce or technical trade-offs to clarify next time?"
                        className="w-full bg-[#06081c] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#2dd4bf]"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsPostReflectionOpen(false)}
                        className="px-4 py-2 rounded-xl bg-white/5 text-xs text-[#a4a9d0]"
                      >
                        Skip
                      </button>
                      <button
                        type="button"
                        onClick={handleSavePostReflection}
                        className="px-4 py-2 rounded-xl bg-[#2dd4bf] text-black font-bold text-xs cursor-pointer shadow-md"
                      >
                        Save to Practice History
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 3: COMMUNICATION PRACTICE ACTIVITIES
      ===================================================================== */}
      {activeSection === 'activities' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategoryFilter === 'all'
                  ? 'bg-[#2dd4bf] text-black font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-[#a4a9d0]'
              }`}
            >
              All Challenges ({challenges.length})
            </button>
            {practiceCategoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-[#2dd4bf] text-black font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-[#a4a9d0]'
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Activities Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="p-6 rounded-3xl bg-[#0c1033] border border-[#222955] hover:border-[#2dd4bf]/40 transition-all shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#2dd4bf]/15 text-[#5eead4] font-mono text-[10px] font-bold border border-[#2dd4bf]/20">
                      {challenge.category}
                    </span>
                    <span className="text-[11px] font-mono text-[#a4a9d0]">
                      {challenge.targetDurationMinutes} mins
                    </span>
                  </div>

                  <h4 className="font-baskerville text-base font-bold text-white">
                    {challenge.title}
                  </h4>
                  <p className="text-xs text-[#a4a9d0] leading-relaxed line-clamp-3">
                    {challenge.prompt}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#7dd3fc]">
                    Target: {challenge.badge}
                  </span>
                  <button
                    onClick={() => setActiveModalChallenge(challenge)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-md shadow-[#2dd4bf]/20"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Start Practice</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 4: MY PRACTICE PROGRESS
      ===================================================================== */}
      {activeSection === 'progress' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Progress Overview KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0c1033] border border-white/10 space-y-1">
              <div className="text-[11px] font-mono uppercase text-[#a4a9d0]">Total Practice Sessions</div>
              <div className="text-2xl font-bold font-mono text-white">{studentPractices.length}</div>
              <div className="text-[10px] text-emerald-400">Authenticated student records</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1033] border border-white/10 space-y-1">
              <div className="text-[11px] font-mono uppercase text-[#a4a9d0]">Success Score Impact</div>
              <div className="text-2xl font-bold font-mono text-[#5eead4]">
                +{Math.min(15, Math.round(studentPractices.length * 2.5))} pts
              </div>
              <div className="text-[10px] text-[#a4a9d0]">Boosts Skills &amp; Communication (15%)</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1033] border border-white/10 space-y-1">
              <div className="text-[11px] font-mono uppercase text-[#a4a9d0]">Behavioral Engagement</div>
              <div className="text-2xl font-bold font-mono text-[#38bdf8]">
                +{Math.min(10, Math.round(studentPractices.length * 1.5))} pts
              </div>
              <div className="text-[10px] text-[#a4a9d0]">Boosts Student Engagement (15%)</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1033] border border-white/10 space-y-1">
              <div className="text-[11px] font-mono uppercase text-[#a4a9d0]">Consistency Status</div>
              <div className="text-2xl font-bold font-mono text-[#ffb27a]">
                {studentPractices.length >= 3 ? 'Consistent' : studentPractices.length >= 1 ? 'Moderate' : 'Getting Started'}
              </div>
              <div className="text-[10px] text-[#a4a9d0]">Fluencis calibration status</div>
            </div>
          </div>

          {/* Practice History Table */}
          <div className="rounded-3xl bg-[#0c1033] border border-white/10 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-white/10 bg-[#090b20] flex items-center justify-between">
              <div>
                <h4 className="font-baskerville text-base font-bold text-white">Practice History &amp; Reflections</h4>
                <p className="text-xs text-[#a4a9d0]">Verified sessions tied to your stable student ID ({effectiveStudentId}).</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#a4a9d0]">
                <thead className="bg-[#06081c] text-[#8e96c8] uppercase font-mono text-[10px] border-b border-white/5">
                  <tr>
                    <th className="py-3 px-4">Activity Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Reflection</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {studentPractices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#a4a9d0]">
                        No completed activities yet. Start an everyday speaking challenge or join a live room!
                      </td>
                    </tr>
                  ) : (
                    studentPractices.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">{p.title}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#7dd3fc]">{p.category}</td>
                        <td className="py-3 px-4 font-mono">{p.completedAt}</td>
                        <td className="py-3 px-4 font-mono">{p.durationSeconds}s</td>
                        <td className="py-3 px-4 italic max-w-xs truncate text-[#cbd5e1]">
                          {p.reflectionNotes || p.reflectionMood || 'Completed'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Live WebRTC Practice Room Experience (Part D) */}
      {activeWebRtcRoom && (
        <LiveWebRtcPracticeRoom
          roomId={activeWebRtcRoom.id}
          roomTitle={activeWebRtcRoom.title}
          categoryLabel={activeWebRtcRoom.categoryLabel}
          topicNotes={activeWebRtcRoom.topicNotes}
          currentUserId={effectiveStudentId}
          currentUserName={displayName}
          isHost={activeWebRtcRoom.hostId === effectiveStudentId}
          passcode={activeWebRtcRoom.passcode}
          onLeaveRoom={handleLeaveWebRtcRoom}
        />
      )}

      {/* Fluencis Practice Challenge Modal */}
      {activeModalChallenge && (
        <FluencisPracticeModal
          challenge={activeModalChallenge}
          studentId={effectiveStudentId}
          onClose={() => setActiveModalChallenge(null)}
          onComplete={handlePracticeCompleted}
        />
      )}

      {/* Educational Knowledge Library Management Modal (Part B3) */}
      <KnowledgeLibraryModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
      />

      {/* Educational Knowledge Verification Suite Modal (Part B6) */}
      <KnowledgeTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
};
