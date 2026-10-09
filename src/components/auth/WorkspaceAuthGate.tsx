import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { WorkspaceRole } from '../../context/WorkspaceContext';
import {
  Lock,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Building2,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

interface WorkspaceAuthGateProps {
  requestedRole: WorkspaceRole;
  onBackToLanding: () => void;
  onSuccess?: () => void;
  onExploreDemo?: () => void;
}

export const WorkspaceAuthGate: React.FC<WorkspaceAuthGateProps> = ({
  requestedRole,
  onBackToLanding,
  onSuccess,
  onExploreDemo,
}) => {
  const { signInWithGoogle, signUpWithEmail, loginWithEmail, error, clearError } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Map workspace role to initial auth role
  const defaultAuthRole =
    requestedRole === 'faculty' ? 'advisor' : requestedRole === 'student' ? 'student' : 'admin';
  const [authRole, setAuthRole] = useState<'advisor' | 'educator' | 'student' | 'admin'>(
    defaultAuthRole
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const getWorkspaceMeta = () => {
    switch (requestedRole) {
      case 'faculty':
        return {
          title: 'Faculty & Advisor Workspace',
          badge: '1: FACULTY COCKPIT',
          subtitle: 'Holistic cohort trajectory detection, causal intelligence & direct care intervention.',
          icon: <UserCheck className="w-7 h-7 text-[#ff6a2b]" />,
          accentColor: '#ff6a2b',
          glowClass: 'from-[#ff6a2b]/20 to-transparent',
          defaultRoleName: 'Faculty / Academic Advisor',
        };
      case 'student':
        return {
          title: 'Student Success Studio',
          badge: '2: STUDENT STUDIO',
          subtitle: 'Supportive development cockpit, personalized learning modules & mentor communication.',
          icon: <GraduationCap className="w-7 h-7 text-[#2dd4bf]" />,
          accentColor: '#2dd4bf',
          glowClass: 'from-[#2dd4bf]/20 to-transparent',
          defaultRoleName: 'Student Scholar',
        };
      case 'admin':
        return {
          title: 'Institutional Administrator HQ',
          badge: '3: ADMINISTRATOR HQ',
          subtitle: 'Institution-wide cohort health telemetry, faculty response pacing & early signals.',
          icon: <Building2 className="w-7 h-7 text-[#a855f7]" />,
          accentColor: '#a855f7',
          glowClass: 'from-[#a855f7]/20 to-transparent',
          defaultRoleName: 'Dean / Administrator',
        };
    }
  };

  const meta = getWorkspaceMeta();

  const parseErrorMessage = (err: unknown): string => {
    const raw = err instanceof Error ? err.message : String(err);
    if (raw.includes('email-already-in-use')) {
      return 'An account with this email already exists. Please switch to Sign In.';
    }
    if (raw.includes('invalid-credential') || raw.includes('wrong-password')) {
      return 'Invalid credentials. Please verify your email and password.';
    }
    if (raw.includes('user-not-found')) {
      return 'No account exists with this email address. Please sign up below.';
    }
    if (raw.includes('weak-password')) {
      return 'Password is too weak. Please use at least 6 characters.';
    }
    if (raw.includes('invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (raw.includes('popup-closed-by-user')) {
      return 'Google sign-in popup was closed before completion.';
    }
    return raw;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) {
          setLocalError('Please enter your full name');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setLocalError('Password must be at least 6 characters');
          setIsSubmitting(false);
          return;
        }
        await signUpWithEmail(email.trim(), password, displayName.trim(), authRole);
      } else {
        await loginWithEmail(email.trim(), password);
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      setLocalError(parseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      setLocalError(parseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-[#ff6a2b]/15 via-[#6f8dff]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-xl mx-auto rounded-3xl bg-[#090b20]/90 backdrop-blur-2xl border border-[rgba(140,150,255,0.25)] p-6 sm:p-10 shadow-2xl text-[#f0f1ff]">
        {/* Top return link */}
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-1.5 text-xs text-[#a4a9d0] hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Overview</span>
        </button>

        {/* Security Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[11px] mb-3">
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>AUTHENTICATION REQUIRED</span>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center mb-3 shadow-lg">
            {meta.icon}
          </div>

          <h2 className="font-baskerville text-2xl sm:text-3xl font-bold text-white">
            {meta.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#a4a9d0] mt-1.5 max-w-md mx-auto leading-relaxed">
            {meta.subtitle}
          </p>

          <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-[#c2d1ff] flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Please sign in or create an account to securely access this workspace.</span>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="flex rounded-xl bg-black/50 p-1 mb-6 border border-white/10 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setLocalError(null);
              clearError();
            }}
            className={`flex-1 py-2.5 rounded-lg transition-all cursor-pointer font-bold ${
              mode === 'signin'
                ? 'bg-gradient-to-r from-[#ff6a2b] to-[#ff8a50] text-white shadow-md'
                : 'text-[#a4a9d0] hover:text-white'
            }`}
          >
            Sign In to Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setLocalError(null);
              clearError();
            }}
            className={`flex-1 py-2.5 rounded-lg transition-all cursor-pointer font-bold ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-[#ff6a2b] to-[#ff8a50] text-white shadow-md'
                : 'text-[#a4a9d0] hover:text-white'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Instant Demo Exploration Option */}
        {onExploreDemo && (
          <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-[#2dd4bf]/15 via-[#0ea5e9]/10 to-transparent border border-[#2dd4bf]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2dd4bf] shrink-0" />
              <span className="text-[#e2e8f0]">
                Quick Preview? <strong>Explore workspace in demo mode</strong> without credentials.
              </span>
            </div>
            <button
              type="button"
              onClick={onExploreDemo}
              className="px-3.5 py-1.5 rounded-xl bg-[#2dd4bf] text-black font-bold text-xs hover:bg-[#5eead4] transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              Explore Demo Mode →
            </button>
          </div>
        )}

        {/* Google One-Click Auth */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:border-[#6f8dff]/50 mb-4"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 my-4 text-xs text-[#a4a9d0]/60">
          <div className="flex-1 h-px bg-white/10" />
          <span>or continue with institutional email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Error Notification */}
        {(localError || error) && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-xs text-[#a4a9d0] mb-1.5 block font-medium">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#a4a9d0] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Gupta or Arjun Kumar"
                    className="w-full bg-black/40 border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#a4a9d0]/50 focus:outline-none focus:border-[#ff6a2b]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#a4a9d0] mb-1.5 block font-medium">
                  Institutional Persona / Role
                </label>
                <select
                  value={authRole}
                  onChange={(e) =>
                    setAuthRole(e.target.value as 'advisor' | 'educator' | 'student' | 'admin')
                  }
                  className="w-full bg-[#06081c] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff6a2b]"
                >
                  <option value="advisor" className="bg-[#090b20]">
                    Faculty / Academic Advisor
                  </option>
                  <option value="educator" className="bg-[#090b20]">
                    Faculty Professor / Instructor
                  </option>
                  <option value="student" className="bg-[#090b20]">
                    Student Scholar
                  </option>
                  <option value="admin" className="bg-[#090b20]">
                    Institution Administrator / Dean
                  </option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-xs text-[#a4a9d0] mb-1.5 block font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#a4a9d0] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full bg-black/40 border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#a4a9d0]/50 focus:outline-none focus:border-[#ff6a2b]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-[#a4a9d0] block font-medium">Password</label>
              {mode === 'signup' && (
                <span className="text-[11px] text-[#a4a9d0]/70 font-mono">Min. 6 characters</span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#a4a9d0] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/15 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-[#a4a9d0]/50 focus:outline-none focus:border-[#ff6a2b]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a4a9d0] hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold text-sm text-white tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ff6a2b]/30 bg-gradient-to-r from-[#ff6a2b] to-[#ff8a50] hover:opacity-95 transition-all mt-4"
          >
            {isSubmitting ? (
              <span>Authenticating Secure Session...</span>
            ) : (
              <>
                <span>
                  {mode === 'signin'
                    ? `Sign In & Enter ${meta.title}`
                    : `Complete Sign Up & Access Workspace`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Disclaimers */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#a4a9d0]">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>End-to-End Encrypted Auth</span>
          </span>
          <span className="text-[#a4a9d0]/70 font-mono">FERPA Compliant System</span>
        </div>
      </div>
    </div>
  );
};
