import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/integrations/api/client';
import { Mail, Lock, User, Loader2, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import AppLoader from '@/components/AppLoader';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { PublicFooter, PublicHeader } from '@/components/layout/PublicShell';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters').max(128);

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const redirectTo = searchParams.get('next') || '/dashboard';

  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>(() =>
    searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  );
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupDisplayName, setSignupDisplayName] = useState('');

  useEffect(() => {
    if (user && !authLoading) {
      const target = user.roles?.includes('admin') ? '/admin' : redirectTo;
      navigate(target);
    }
  }, [user, authLoading, navigate, redirectTo]);

  useEffect(() => {
    setMode(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  }, [searchParams]);

  const validate = (email: string, password: string) => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: 'Validation Error', description: err.errors[0].message, variant: 'destructive' });
        return false;
      }
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(loginEmail, loginPassword)) return;
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);
    if (error) {
      let message = error.message;
      if (message.includes('Invalid login credentials')) message = 'Invalid email or password. Please try again.';
      toast({ title: 'Login Failed', description: message, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(signupEmail, signupPassword)) return;
    if (signupPassword !== signupConfirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Please make sure your passwords match.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupDisplayName);
    setIsLoading(false);
    if (error) {
      let message = error.message;
      if (message.includes('User already registered')) message = 'An account with this email already exists. Please sign in instead.';
      toast({ title: 'Signup Failed', description: message, variant: 'destructive' });
    } else {
      toast({ title: 'Account created!', description: "Welcome to CV Builder. Let's build your resume." });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try { emailSchema.parse(forgotPasswordEmail); } catch (err) {
      if (err instanceof z.ZodError) { toast({ title: 'Validation Error', description: err.errors[0].message, variant: 'destructive' }); return; }
    }
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotPasswordEmail });
      setResetEmailSent(true);
      toast({ title: 'Email Sent!', description: 'Check your inbox for the password reset link.' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  if (authLoading) {
    return <AppLoader message="Opening your CV workspace" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#07111f] text-white overflow-x-hidden selection:bg-cyan-300 selection:text-slate-950">
      <PublicHeader />

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12 relative">
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] rounded-full bg-cyan-400/10 blur-[100px]" />
          <div className="absolute inset-0 opacity-[.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <div className="w-full max-w-6xl relative z-10 grid items-center gap-12 lg:grid-cols-[1fr_480px]">
          <section className="hidden lg:block pr-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[.07] px-3 py-1.5 text-xs font-semibold text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" /> Your next opportunity starts here
            </div>
            <h1 className="mt-7 text-5xl font-black leading-[1.05] tracking-[-.05em]">
              Build a resume that gets you <span className="bg-gradient-to-r from-cyan-200 to-blue-400 bg-clip-text text-transparent">noticed.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
              Join CareerCanvas to create polished, ATS-friendly resumes and manage every version in one secure workspace.
            </p>
            <div className="mt-9 grid grid-cols-2 gap-4">
              {['Guided resume builder', 'ATS-friendly templates', 'Secure cloud saving', 'One-click PDF export'].map((item) => (
                <span key={item} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-300/10"><Check className="h-3 w-3 text-emerald-300" /></span>{item}
                </span>
              ))}
            </div>
          </section>

          <div className="w-full max-w-md mx-auto lg:max-w-none">
          {/* Card */}
          <div className="rounded-[1.75rem] border border-white/10 bg-[#101d2e]/85 backdrop-blur-xl p-6 sm:p-8 shadow-[0_32px_100px_rgba(0,0,0,.38)]">
            {showForgotPassword ? (
              /* ── Forgot Password ── */
              <>
                <div className="text-center mb-8">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 shadow-lg shadow-cyan-500/20 mb-4">
                    <Mail size={22} className="text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-white mb-1">
                    {resetEmailSent ? 'Check Your Email' : 'Reset Password'}
                  </h1>
                  <p className="text-sm text-slate-400">
                    {resetEmailSent
                      ? 'We sent you a password reset link. Check your inbox and spam folder.'
                      : 'Enter your email to receive a password reset link'}
                  </p>
                </div>

                {!resetEmailSent ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className="w-full h-11 rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail size={16} />}
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setShowForgotPassword(false); setForgotPasswordEmail(''); }}
                      className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors py-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Sign In
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(false); setResetEmailSent(false); setForgotPasswordEmail(''); }}
                    className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors py-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </button>
                )}
              </>
            ) : (
              /* ── Login / Signup ── */
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
                    <span className="text-white font-bold text-sm">CV</span>
                  </div>
                  <h1 className="text-xl font-bold text-white mb-1">
                    {mode === 'login' ? 'Welcome back' : 'Create your account'}
                  </h1>
                  <p className="text-sm text-slate-400">
                    {mode === 'login'
                      ? 'Sign in to save and manage your resumes'
                      : 'Start building professional resumes in minutes'}
                  </p>
                </div>

                {/* Tab switcher */}
                <div className="flex rounded-xl bg-black/20 border border-white/10 p-1 mb-6">
                  <button
                    onClick={() => setMode('login')}
                    className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                      mode === 'login'
                        ? 'bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setMode('signup')}
                    className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                      mode === 'signup'
                        ? 'bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {mode === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full h-11 rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="password"
                          placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full h-11 rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Forgot your password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight size={16} />}
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Jane Doe"
                          value={signupDisplayName}
                          onChange={(e) => setSignupDisplayName(e.target.value)}
                          className="w-full h-11 rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="w-full h-11 rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="password"
                          placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          minLength={6}
                          className="w-full h-11 rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="password"
                          placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          minLength={6}
                          className="w-full h-11 rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 rounded-xl bg-cyan-300 hover:bg-cyan-200 text-slate-950 text-sm font-bold shadow-lg shadow-cyan-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight size={16} />}
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                  </form>
                )}

                {/* Divider */}
                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                  <p className="text-xs text-slate-500">
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                      onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      {mode === 'login' ? 'Sign up for free' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
          <p className="mt-5 text-center text-[11px] leading-5 text-slate-500">By continuing, you agree to use CareerCanvas responsibly. Your resume data stays private to your account.</p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Auth;
