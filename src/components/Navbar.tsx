import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace, WorkspaceRole } from '../context/WorkspaceContext';
import {
  User,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Mail,
  GraduationCap,
  UserCheck,
  Building2,
  Layers,
  ArrowRight,
  Database,
  UploadCloud,
  Mic,
} from 'lucide-react';

export type AppView =
  | 'landing'
  | 'growth-track'
  | 'silent-struggle'
  | 'segments'
  | 'skills-placement'
  | 'data-integration'
  | 'communication-practice'
  | 'faculty-workspace'
  | 'student-workspace'
  | 'admin-workspace';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenDemo: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenDemo,
  onOpenAuth,
}) => {
  const { user, userProfile, logout } = useAuth();
  const { activeWorkspace, setActiveWorkspace, openRoleModal } = useWorkspace();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const handleSelectWorkspace = (role: WorkspaceRole) => {
    setActiveWorkspace(role);
    setShowWorkspaceMenu(false);
    if (role === 'faculty') {
      onNavigate('faculty-workspace');
    } else if (role === 'student') {
      onNavigate('student-workspace');
    } else {
      onNavigate('admin-workspace');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getWorkspaceBadge = () => {
    if (activeWorkspace === 'student') {
      return {
        label: '2: Student',
        icon: <GraduationCap className="w-3.5 h-3.5 text-[#2dd4bf]" />,
        style: 'bg-[#2dd4bf]/15 text-[#5eead4] border-[#2dd4bf]/30',
      };
    }
    if (activeWorkspace === 'admin') {
      return {
        label: '3: Admin',
        icon: <Building2 className="w-3.5 h-3.5 text-[#a855f7]" />,
        style: 'bg-[#a855f7]/15 text-[#d8b4fe] border-[#a855f7]/30',
      };
    }
    return {
      label: '1: Faculty',
      icon: <UserCheck className="w-3.5 h-3.5 text-[#ff6a2b]" />,
      style: 'bg-[#ff6a2b]/15 text-[#ffb27a] border-[#ff6a2b]/30',
    };
  };

  const badgeInfo = getWorkspaceBadge();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 md:px-12 py-3 bg-[#030410]/80 backdrop-blur-md border-b border-[rgba(140,150,255,0.18)]">
      {/* Brand logo in Baskerville Old Face */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onNavigate('landing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="font-baskerville text-xl sm:text-2xl font-bold tracking-tight text-[#f0f1ff] hover:opacity-90 transition-opacity flex items-center gap-2"
      >
        <span>
          Evo<b className="text-[#ff6a2b] font-bold">lyn</b>
        </span>
      </a>

      {/* Navigation links & Workspace Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-5 text-xs sm:text-sm text-[#a4a9d0]">
        <button
          onClick={() => {
            onNavigate('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`transition-colors cursor-pointer hidden sm:inline ${
            currentView === 'landing' ? 'text-white font-semibold' : 'hover:text-[#f0f1ff]'
          }`}
        >
          Home
        </button>

        {/* WORKSPACE SWITCHER DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${badgeInfo.style} hover:brightness-110 shadow-sm`}
            title="Switch Evolyn Workspace Role"
          >
            {badgeInfo.icon}
            <span>{badgeInfo.label}</span>
            <ChevronDown className="w-3 h-3 opacity-70 ml-0.5" />
          </button>

          {showWorkspaceMenu && (
            <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 rounded-2xl bg-[#090b20] border border-[rgba(140,150,255,0.25)] p-3 shadow-2xl z-50 text-xs animate-fadeIn">
              <div className="px-2 py-1.5 font-mono text-[10px] uppercase font-bold text-[#a4a9d0] border-b border-white/10 mb-2">
                Evolyn Role Workspaces
              </div>

              {/* 1: Faculty */}
              <button
                onClick={() => handleSelectWorkspace('faculty')}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                  activeWorkspace === 'faculty' && currentView === 'faculty-workspace'
                    ? 'bg-[#ff6a2b]/20 text-[#ffb27a] font-bold'
                    : 'hover:bg-white/5 text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#ff6a2b]" />
                  <div>
                    <div className="text-xs font-semibold">1: Faculty Workspace</div>
                    <div className="text-[10px] text-[#a4a9d0]">Roster, Signals & Notes</div>
                  </div>
                </div>
                {activeWorkspace === 'faculty' && <span className="w-1.5 h-1.5 rounded-full bg-[#ff6a2b]" />}
              </button>

              {/* 2: Student */}
              <button
                onClick={() => handleSelectWorkspace('student')}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                  activeWorkspace === 'student' && currentView === 'student-workspace'
                    ? 'bg-[#2dd4bf]/20 text-[#5eead4] font-bold'
                    : 'hover:bg-white/5 text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#2dd4bf]" />
                  <div>
                    <div className="text-xs font-semibold">2: Student Workspace</div>
                    <div className="text-[10px] text-[#a4a9d0]">Journey, Strengths & Goals</div>
                  </div>
                </div>
                {activeWorkspace === 'student' && <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf]" />}
              </button>

              {/* Fluencis Native Communication Practice & Growth */}
              <button
                onClick={() => {
                  setActiveWorkspace('student');
                  setShowWorkspaceMenu(false);
                  onNavigate('communication-practice');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                  currentView === 'communication-practice'
                    ? 'bg-gradient-to-r from-[#2dd4bf]/20 to-[#38bdf8]/20 text-[#5eead4] font-bold border border-[#2dd4bf]/30'
                    : 'hover:bg-white/5 text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold flex items-center gap-1.5">
                      <span>Communication Practice & Growth</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-[#2dd4bf]/20 text-[#5eead4] text-[9px] font-mono">
                        Fluencis
                      </span>
                    </div>
                    <div className="text-[10px] text-[#a4a9d0]">AI Coach, Live Rooms & Labs</div>
                  </div>
                </div>
                {currentView === 'communication-practice' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf]" />
                )}
              </button>

              {/* 3: Administrator */}
              <button
                onClick={() => handleSelectWorkspace('admin')}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                  activeWorkspace === 'admin' && currentView === 'admin-workspace'
                    ? 'bg-[#a855f7]/20 text-[#d8b4fe] font-bold'
                    : 'hover:bg-white/5 text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#a855f7]" />
                  <div>
                    <div className="text-xs font-semibold">3: Administrator Workspace</div>
                    <div className="text-[10px] text-[#a4a9d0]">Institutional Cohorts & Governance</div>
                  </div>
                </div>
                {activeWorkspace === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />}
              </button>

              {/* Data Integration Workspace */}
              <button
                onClick={() => {
                  setShowWorkspaceMenu(false);
                  onNavigate('data-integration');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                  currentView === 'data-integration'
                    ? 'bg-[#38bdf8]/20 text-[#7dd3fc] font-bold'
                    : 'hover:bg-white/5 text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-[#38bdf8]" />
                  <div>
                    <div className="text-xs font-semibold">Data Integration Workspace</div>
                    <div className="text-[10px] text-[#a4a9d0]">Batch CSV Upload &amp; Validation</div>
                  </div>
                </div>
                {currentView === 'data-integration' && <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />}
              </button>

              <div className="mt-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowWorkspaceMenu(false);
                    openRoleModal();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] text-[#a4a9d0] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-[#ff6a2b]" />
                  <span>Choose Persona / Sign In...</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dedicated Student Growth Track Nav Link */}
        <button
          onClick={() => {
            onNavigate('growth-track');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all cursor-pointer hidden md:flex ${
            currentView === 'growth-track'
              ? 'bg-[#ff6a2b] text-white font-bold shadow-md shadow-[#ff6a2b]/30'
              : 'hover:text-[#f0f1ff] bg-white/5 border border-white/10 text-[#ffb27a]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>Growth Track</span>
        </button>

        {/* Dedicated Silent Struggle Detection Nav Link */}
        <button
          onClick={() => {
            onNavigate('silent-struggle');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all cursor-pointer hidden md:flex ${
            currentView === 'silent-struggle'
              ? 'bg-gradient-to-r from-[#ff6a2b] to-[#6f8dff] text-white font-bold shadow-md shadow-[#ff6a2b]/30'
              : 'hover:text-[#f0f1ff] bg-white/5 border border-white/10 text-[#c2d1ff]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff6a2b] animate-ping" />
          <span>Silent Struggle</span>
        </button>

        {/* Dedicated Student Segments Nav Link */}
        <button
          onClick={() => {
            onNavigate('segments');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all cursor-pointer hidden lg:flex ${
            currentView === 'segments'
              ? 'bg-[#6366f1] text-white font-bold shadow-md shadow-[#6366f1]/30'
              : 'hover:text-[#f0f1ff] bg-white/5 border border-white/10 text-[#c7d2fe]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#a5b4fc]" />
          <span>Segments</span>
        </button>

        {/* Dedicated Skills & Placement Intelligence Nav Link */}
        <button
          onClick={() => {
            onNavigate('skills-placement');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all cursor-pointer hidden xl:flex ${
            currentView === 'skills-placement'
              ? 'bg-[#2dd4bf] text-black font-bold shadow-md shadow-[#2dd4bf]/30'
              : 'hover:text-[#f0f1ff] bg-white/5 border border-white/10 text-[#5eead4]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2dd4bf]" />
          <span>Skills & Placement</span>
        </button>

        {/* Dedicated Fluencis Communication Practice Nav Link */}
        <button
          onClick={() => {
            setActiveWorkspace('student');
            onNavigate('communication-practice');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all cursor-pointer hidden lg:flex ${
            currentView === 'communication-practice'
              ? 'bg-gradient-to-r from-[#2dd4bf] to-[#38bdf8] text-slate-950 font-bold shadow-md shadow-[#2dd4bf]/30'
              : 'hover:text-[#f0f1ff] bg-white/5 border border-[#2dd4bf]/30 text-[#5eead4] hover:bg-[#2dd4bf]/10'
          }`}
          title="Fluencis Communication Practice, AI Coach & Live Rooms"
        >
          <Mic className="w-3.5 h-3.5 text-emerald-400" />
          <span>Communication Practice</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[9px] text-emerald-300 font-mono">
            Fluencis
          </span>
        </button>

        {/* Dedicated Data Integration & CSV Import Nav Link (Step 11) */}
        <button
          onClick={() => {
            onNavigate('data-integration');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all cursor-pointer hidden md:flex ${
            currentView === 'data-integration'
              ? 'bg-[#38bdf8] text-slate-950 font-bold shadow-md shadow-[#38bdf8]/30'
              : 'hover:text-[#f0f1ff] bg-white/5 border border-white/10 text-[#7dd3fc]'
          }`}
          title="CSV Student Data Integration & Validation"
        >
          <UploadCloud className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Data Integration</span>
        </button>

        {/* Real-Time Authentication Status & Profile Menu */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 transition-all text-xs font-semibold text-white cursor-pointer"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-6 h-6 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#ff6a2b] flex items-center justify-center text-[10px] font-bold text-white">
                  {(user.displayName || user.email || 'A').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="max-w-[100px] truncate hidden sm:inline">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#a4a9d0]" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#090b20] border border-[rgba(140,150,255,0.25)] p-4 shadow-2xl z-50 text-xs animate-fadeIn">
                <div className="pb-3 border-b border-white/10">
                  <div className="font-baskerville text-sm font-bold text-white">
                    {userProfile?.displayName || user.displayName || 'Authorized User'}
                  </div>
                  <div className="flex items-center gap-1.5 text-[#a4a9d0] mt-1 font-mono text-[11px] truncate">
                    <Mail className="w-3 h-3 text-[#ff6a2b] shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>

                <div className="py-3 space-y-2 text-[#a4a9d0]">
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Active Workspace:</span>
                    <span className="font-semibold text-[#ffb27a] capitalize">
                      {activeWorkspace} Workspace
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Institutional Role:</span>
                    <span className="font-semibold text-[#c2d1ff] capitalize">
                      {userProfile?.role || 'Academic User'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Security Status:</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <ShieldCheck className="w-3 h-3" /> Encrypted & Active
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-3.5 sm:px-4 py-1.5 rounded-full border border-[rgba(140,150,255,0.25)] hover:border-[#ff6a2b] text-xs font-semibold text-[#f0f1ff] bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <User className="w-3 h-3 text-[#ff6a2b]" />
            <span>Sign In</span>
          </button>
        )}

        <button
          onClick={onOpenDemo}
          className="btn-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold text-xs text-white cursor-pointer hidden sm:inline"
        >
          Explore Demo
        </button>
      </div>
    </nav>
  );
};
