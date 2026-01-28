
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './views/Landing';
import Dashboard from './views/Dashboard';
import Market from './views/Market';
import MyDevices from './views/MyDevices';
import ChatRoom from './views/ChatRoom'; 
import Wallet from './views/Wallet';
import Admin from './views/Admin';
import Transactions from './views/Transactions';
import Referrals from './views/Referrals';
import Support from './views/Support';
import Settings from './views/Settings';
import Notifications from './views/Notifications';
import About from './views/About';
import Privacy from './views/Privacy';
import AIChatBot from './components/AIChatBot';
import { UserProvider, useUser } from './UserContext';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { Loader2, AlertCircle, Eye, EyeOff, ArrowRight, Zap, TrendingUp, FileText, UserCircle, ShieldCheck, Lock, Mail, KeyRound, CheckCircle2, RefreshCcw, Gift, Star, Sparkles, UserPlus, Rocket, Info } from 'lucide-react';

const LOGO_URL = "https://c.top4top.io/p_3676pdlj43.jpg";

const GuestWelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const hasSeen = localStorage.getItem('minecloud_guest_welcome_seen');
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 1500); 
      return () => clearTimeout(timer);
    }
  }, []);
  const handleClose = () => {
    localStorage.setItem('minecloud_guest_welcome_seen', 'true');
    setIsOpen(false);
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-500 font-cairo text-right" dir="rtl">
      <div className="relative w-full max-w-lg overflow-hidden glass rounded-[3.5rem] p-1 border-blue-500/30 shadow-[0_0_80px_rgba(37,99,235,0.2)] animate-in zoom-in-95 duration-500">
        <div className="bg-slate-950/80 rounded-[3.4rem] p-10 md:p-14 text-center relative">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <Sparkles className="absolute top-10 left-10 text-blue-500/20 animate-pulse" size={40} />
            <Sparkles className="absolute bottom-10 right-10 text-blue-500/20 animate-pulse" size={32} />
          </div>
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-blue-600/20 rounded-[2.5rem] flex items-center justify-center mx-auto border border-blue-500/30 relative shadow-2xl shadow-blue-600/20 overflow-hidden">
              <img src={LOGO_URL} alt="MineCloud" className="w-full h-full object-cover" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">أهلاً بك في MineCloud</h2>
          <p className="text-slate-400 font-bold leading-relaxed mb-10 text-lg">
            أول منصة عربية احترافية لـ <span className="text-blue-500">شراء</span> أجهزة التعدين السحابي الحقيقي. اشترِ أجهزتك الخاصة الآن وابدأ بجني الأرباح من قوة المعالجة العالمية.
          </p>
          <button onClick={handleClose} className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xl shadow-2xl shadow-blue-600/40 transition-all active:scale-95 flex items-center justify-center gap-3 group">
            ابدأ رحلة الشراء الآن <ArrowRight className="group-hover:translate-x-1 transition-transform rotate-180" />
          </button>
          <p className="mt-6 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Future of Cloud Ownership is here</p>
        </div>
      </div>
    </div>
  );
};

const OnboardingModal = () => {
  const { completeOnboarding } = useUser();
  const [step, setStep] = useState(1);
  const steps = [
    { title: "قانون الملكية المباشرة", desc: "في منصتنا، أنت لا تستأجر الأجهزة، بل تشتريها وتصبح ملكك. ثمن الشراء يخصم لمرة واحدة وتضاف الأجهزة لصفحة 'أجهزتي'. يمكنك تشغيلها متى شئت دون الحاجة لإعادة الشراء.", icon: <FileText className="text-blue-400" size={48} /> },
    { title: "استراتيجية جني الأرباح", desc: "يعمل جهازك بنظام الدورات الحرة. اختر دورة 3 أيام لربح 2.0% يومياً، أو 7 أيام لربح 2.5% يومياً. الأرباح تضاف لرصيدك لحظياً، والجهاز يبقى تحت تصرفك بعد انتهاء الدورة لتشغيله مجدداً.", icon: <Zap className="text-yellow-400" size={48} /> },
    { title: "نظام الترقية الذكي", desc: "إذا كنت تملك جهازاً وترغب في الحصول على الأقوى منه، لست بحاجة لشراء جهاز جديد بالكامل. يمكنك دفع 'فرق السعر' فقط وترقية معداتك الحالية عبر قسم 'أجهزتي' فوراً لقوة معالجة أعلى وأرباح أكبر.", icon: <TrendingUp className="text-emerald-400" size={48} /> }
  ];
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-xl animate-in fade-in">
      <div className="glass w-full max-w-md rounded-[3rem] p-10 text-center relative overflow-hidden shadow-2xl border border-blue-500/20 font-cairo">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800"><div className="h-full bg-blue-600 transition-all duration-500 shadow-[0_0_10px_#2563eb]" style={{ width: `${(step/3)*100}%` }}></div></div>
        <div className="mb-8 flex justify-center scale-110">{steps[step-1].icon}</div>
        <h3 className="text-2xl font-black text-white mb-4 tracking-tight leading-tight">{steps[step-1].title}</h3>
        <p className="text-slate-400 mb-10 leading-relaxed text-sm font-semibold">{steps[step-1].desc}</p>
        <div className="space-y-3">
          <button onClick={() => step < 3 ? setStep(step + 1) : completeOnboarding()} className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 group transition-all">
            {step < 3 ? 'موافقة ومتابعة' : 'أوافق على كافة الشروط'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          {step > 1 && <button onClick={() => setStep(step - 1)} className="text-slate-500 text-sm font-bold hover:text-white transition-colors">السابق</button>}
        </div>
      </div>
    </div>
  );
};

const WelcomeGiftModal = () => {
  const { user, claimWelcomeGift, isSyncing } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (user.hasSeenOnboarding && !user.hasClaimedWelcomeGift) { setIsOpen(true); }
  }, [user.hasSeenOnboarding, user.hasClaimedWelcomeGift]);
  if (!isOpen) return null;
  const handleClaim = async () => { const success = await claimWelcomeGift(); if (success) setIsOpen(false); };
  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-lg overflow-hidden glass rounded-[3.5rem] p-1 border-amber-500/30 shadow-[0_0_80px_rgba(245,158,11,0.15)] animate-in zoom-in-95 duration-500">
        <div className="bg-slate-950/80 rounded-[3.4rem] p-8 md:p-12 text-center relative">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <Sparkles className="absolute top-10 left-10 text-amber-500/20 animate-pulse" size={40} />
            <Sparkles className="absolute bottom-10 right-10 text-amber-500/20 animate-pulse" size={32} />
          </div>
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-amber-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto border border-amber-500/30 relative">
              <Gift size={64} className="text-amber-500 animate-bounce" />
              <div className="absolute -top-3 -right-3 bg-white text-slate-950 px-3 py-1 rounded-full text-[10px] font-black shadow-xl rotate-12">هدية حصرية</div>
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-4">هدية انضمام فورية بقيمة 5.00$!</h2>
          <p className="text-slate-400 font-bold leading-relaxed mb-10">
            أهلاً بك في MineCloud. نمنحك <span className="text-amber-500 text-xl">5 دولارات مجانية</span> يتم تعدينها خلال الـ 24 ساعة القادمة عبر جهاز Turbo S9 التجريبي. ابدأ الآن وشاهد أرباحك تنمو!
          </p>
          <button disabled={isSyncing} onClick={handleClaim} className="w-full h-16 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black text-xl shadow-2xl shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-3">
            {isSyncing ? <Loader2 className="animate-spin" /> : <>فعل جهاز الـ 5$ الآن <Sparkles size={20} /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

const AuthView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { login, register, checkEmailExists, resetPassword } = useUser();
  const { isRtl } = useLanguage();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('minecloud_pending_ref', refCode);
      setAuthMode('register');
    }
  }, [searchParams]);

  const getButtonText = () => {
    if (isLoading) return <Loader2 className="animate-spin" />;
    switch (authMode) {
      case 'login': return isRtl ? 'تسجيل الدخول للمنصة' : 'Secure Login';
      case 'register': return isRtl ? 'فتح حساب تعدين جديد' : 'Open Mining Account';
      case 'forgot-password': return isRtl ? 'التحقق من البريد' : 'Verify Email';
      case 'reset-password': return isRtl ? 'تحديث كلمة المرور' : 'Update Password';
      default: return 'Enter';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSuccess(null); setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    if (authMode === 'forgot-password') {
      const { exists } = await checkEmailExists(normalizedEmail);
      if (exists) { 
        setAuthMode('reset-password'); 
        setSuccess(isRtl ? 'تم العثور على الحساب بنجاح. يرجى تعيين كلمة مرور جديدة.' : 'Account identified. Set a new password.'); 
      } else { 
        setError(isRtl ? 'هذا البريد الإلكتروني غير مسجل في نظامنا.' : 'Email not found in our global records.'); 
      }
      setIsLoading(false); return;
    }

    if (authMode === 'reset-password') {
      if (password.length < 6) { setError(isRtl ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.' : 'Password must be 6+ characters.'); setIsLoading(false); return; }
      if (password !== confirmPassword) { setError(isRtl ? 'كلمات المرور غير متطابقة.' : 'Passwords do not match.'); setIsLoading(false); return; }
      const res = await resetPassword(normalizedEmail, password);
      if (res.success) { 
        setAuthMode('login'); 
        setSuccess(isRtl ? 'تم تحديث كلمة المرور، يمكنك الدخول الآن.' : 'Password updated, proceed to login.'); 
      } else { 
        setError(res.error || 'فشل التحديث'); 
      }
      setIsLoading(false); return;
    }

    const result = authMode === 'register' ? await register(normalizedEmail, password) : await login(normalizedEmail, password);
    if (result.success) { 
      navigate('/dashboard', { replace: true }); 
    } else { 
      setError(result.error || (isRtl ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials')); 
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden font-cairo text-right">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="glass w-full max-w-md p-8 md:p-10 rounded-[2.5rem] space-y-8 relative z-10 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-500">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] mx-auto flex items-center justify-center overflow-hidden shadow-2xl shadow-blue-600/30 mb-6"><img src={LOGO_URL} alt="MineCloud" className="w-full h-full object-cover" /></div>
          <h2 className="text-3xl font-black text-white mb-2 leading-tight">
            {authMode === 'login' ? (isRtl ? 'تسجيل الدخول' : 'Sign In') : 
             authMode === 'register' ? (isRtl ? 'إنشاء حساب جديد' : 'Get Started') : 
             (isRtl ? 'تحديث كلمة السر' : 'Reset Password')}
          </h2>
          <p className="text-slate-500 text-sm font-bold">
            {isRtl ? 'تمتع بالوصول لأجهزتك من أي مكان في العالم' : 'Access your mining fleet from anywhere'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 text-xs font-bold flex flex-col gap-3 animate-shake">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-3 animate-in fade-in"><CheckCircle2 size={18} className="shrink-0" /><span>{success}</span></div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative group">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={18} />
            <input required type="email" value={email} readOnly={authMode === 'reset-password'} onChange={(e) => setEmail(e.target.value)} placeholder={isRtl ? "البريد الإلكتروني" : "Email Address"} className={`w-full bg-slate-900/50 border border-slate-800 p-4 pr-12 rounded-2xl text-white outline-none focus:border-blue-500 transition-all text-right ${authMode === 'reset-password' ? 'opacity-50 cursor-not-allowed' : ''}`} />
          </div>
          
          {authMode !== 'forgot-password' && (
            <div className="relative group">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={18} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              <input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isRtl ? "كلمة المرور" : "Password"} className="w-full bg-slate-900/50 border border-slate-800 p-4 pr-12 rounded-2xl text-white outline-none focus:border-blue-500 transition-all text-right" />
            </div>
          )}
          
          {(authMode === 'register' || authMode === 'reset-password') && (
            <div className="relative group">
              <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={18} />
              <input required type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={isRtl ? "تأكيد كلمة المرور" : "Confirm Password"} className="w-full bg-slate-900/50 border border-slate-800 p-4 pr-12 rounded-2xl text-white outline-none focus:border-blue-500 transition-all text-right" />
            </div>
          )}

          <button disabled={isLoading} className="w-full py-5 rounded-[1.25rem] font-black text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2">
            {getButtonText()}
          </button>
        </form>

        <div className="text-center pt-2 space-y-4">
          <div className="flex flex-col gap-3">
            {authMode === 'login' && <button onClick={() => { setAuthMode('forgot-password'); setError(null); }} className="text-blue-400 text-sm font-bold">{isRtl ? 'نسيت كلمة السر؟' : 'Forgot Password?'}</button>}
            {(authMode === 'forgot-password' || authMode === 'reset-password') && <button onClick={() => { setAuthMode('login'); setError(null); }} className="text-slate-400 text-sm font-bold">{isRtl ? 'العودة لتسجيل الدخول' : 'Back to Login'}</button>}
            <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setError(null); }} className="text-slate-400 text-sm font-bold">
              {authMode === 'login' ? (isRtl ? 'ليس لديك حساب؟ سجل الآن' : 'New here? Create account') : (isRtl ? 'لديك حساب بالفعل؟ سجل دخولك' : 'Have an account? Login')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useUser();
  return (
    <>
      {!isAuthenticated && <GuestWelcomeModal />}
      {isAuthenticated && !user.hasSeenOnboarding && <OnboardingModal />}
      {isAuthenticated && <WelcomeGiftModal />}
      {isAuthenticated && <AIChatBot />}
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/auth" element={!isAuthenticated ? <AuthView /> : <Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={isAuthenticated ? <Layout userRole={user.role}><Dashboard /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/market" element={isAuthenticated ? <Layout userRole={user.role}><Market /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/my-devices" element={isAuthenticated ? <Layout userRole={user.role}><MyDevices /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/chat" element={isAuthenticated ? <Layout userRole={user.role}><ChatRoom /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/wallet" element={isAuthenticated ? <Layout userRole={user.role}><Wallet /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/transactions" element={isAuthenticated ? <Layout userRole={user.role}><Transactions /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/referrals" element={isAuthenticated ? <Layout userRole={user.role}><Referrals /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/support" element={isAuthenticated ? <Layout userRole={user.role}><Support /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/settings" element={isAuthenticated ? <Layout userRole={user.role}><Settings /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/notifications" element={isAuthenticated ? <Layout userRole={user.role}><Notifications /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/about" element={isAuthenticated ? <Layout userRole={user.role}><About /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/privacy" element={isAuthenticated ? <Layout userRole={user.role}><Privacy /></Layout> : <Navigate to="/auth" replace />} />
        {isAuthenticated && user.role === 'ADMIN' && <Route path="/admin" element={<Layout userRole={user.role}><Admin /></Layout>} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => (<LanguageProvider><UserProvider><AppRoutes /></UserProvider></LanguageProvider>);
export default App;
