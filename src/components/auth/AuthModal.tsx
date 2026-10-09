import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, User, Shield, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'advisor' | 'educator' | 'student' | 'admin';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'advisor',
  onSuccess,
}) => {
  const { signInWithGoogle, signUpWithEmail, loginWithEmail, error, clearError } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'advisor' | 'educator' | 'student' | 'admin'>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Sync initialRole if changed
  React.useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  if (!isOpen) return null;

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
      return 'Please enter a valid institutional email address.';
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
        await signUpWithEmail(email.trim(), password, displayName.trim(), role);
      } else {
        await loginWithEmail(email.trim(), password);
      }
      onClose();
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
      onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-[#090b20] border border-[rgba(140,150,255,0.25)] p-6 sm:p-8 shadow-2xl text-[#f0f1ff]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 text-[#a4a9d0] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff6a2b] to-[#6f8dff] mx-auto flex items-center justify-center mb-3 shadow-lg shadow-[#ff6a2b]/25">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-baskerville text-2xl sm:text-3xl font-bold text-white">
            {mode === 'signin' ? 'Welcome Back' : 'Create Advisor Account'}
          </h3>
          <p className="text-xs text-[#a4a9d0] mt-1">
            Secure, real-time institutional authentication for Evolyn
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-black/40 p-1 mb-6 border border-white/10 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setLocalError(null);
              clearError();
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-[#ff6a2b] text-white shadow-md'
                : 'text-[#a4a9d0] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setLocalError(null);
              clearError();
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#ff6a2b] text-white shadow-md'
                : 'text-[#a4a9d0] hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Google One-Click Auth */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:border-[#6f8dff]/50 mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>or with email & password</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Error message */}
        {(localError || error) && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-xs text-[#a4a9d0] mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#a4a9d0] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Gupta"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-[#a4a9d0]/50 focus:outline-none focus:border-[#ff6a2b]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#a4a9d0] mb-1 block">Institutional Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'advisor' | 'educator' | 'student' | 'admin')}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff6a2b]"
                >
                  <option value="advisor" className="bg-[#090b20]">Faculty / Academic Advisor</option>
                  <option value="educator" className="bg-[#090b20]">Faculty Professor / Instructor</option>
                  <option value="student" className="bg-[#090b20]">Student Scholar</option>
                  <option value="admin" className="bg-[#090b20]">Institution Administrator / Dean</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-xs text-[#a4a9d0] mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#a4a9d0] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="advisor@university.edu"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-[#a4a9d0]/50 focus:outline-none focus:border-[#ff6a2b]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-[#a4a9d0] block">Password</label>
              {mode === 'signup' && (
                <span className="text-[10px] text-[#a4a9d0]/70 font-mono">Min. 6 characters</span>
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
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-10 py-2 text-sm text-white placeholder-[#a4a9d0]/50 focus:outline-none focus:border-[#ff6a2b]"
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
            className="w-full btn-primary py-3 rounded-xl font-bold text-sm text-white tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ff6a2b]/30 mt-4"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In to Evolyn' : 'Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security badges */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#a4a9d0]">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Firestore & Auth</span>
          </span>
          <span className="text-[#a4a9d0]/60">FERPA Compliant</span>
        </div>
      </div>
    </div>
  );
};
