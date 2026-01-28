
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_USER } from './constants';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';
import { User, MiningPackage, TransactionType, TransactionStatus, DeviceStatus, AppNotification, NotificationType, UserPackage, Transaction } from './types';

const isPlaceHolder = SUPABASE_URL.includes("your-project-id") || SUPABASE_ANON_KEY.includes("your-public-anon-key");

const supabase = (SUPABASE_URL.startsWith('http') && !isPlaceHolder) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

interface UserContextType {
  user: User;
  isAuthenticated: boolean;
  isSyncing: boolean;
  isCloudConnected: boolean;
  latestNotification: AppNotification | null;
  login: (email: string, password?: string) => Promise<{ success: boolean, error?: string }>;
  register: (email: string, password?: string) => Promise<{ success: boolean, error?: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean, error?: string }>;
  checkEmailExists: (email: string) => Promise<{ exists: boolean }>;
  logout: () => void;
  purchaseDevice: (pkg: MiningPackage) => Promise<boolean>;
  claimWelcomeGift: () => Promise<boolean>; 
  activateCycle: (instanceId: string, days: number, rate: number) => Promise<boolean>;
  depositFunds: (amount: number, method: 'crypto', txHash?: string) => Promise<void>;
  withdrawFunds: (amount: number, address: string) => Promise<boolean>;
  approveTransaction: (targetUserId: string, txId: string) => Promise<void>;
  rejectTransaction: (targetUserId: string, txId: string) => Promise<void>;
  addNotification: (title: string, message: string, type: NotificationType) => void;
  markChatAsRead: () => void;
  toggleRole: () => void;
  resetSystem: () => void;
  completeOnboarding: () => void;
  confirmRecoveryKeySaved: () => void;
  autoPilotMode: boolean;
  toggleAutoPilot: () => void;
  requestNotificationPermission: () => Promise<boolean>;
  exportAccount: () => string;
  markNotificationsAsRead: () => void;
  clearNotifications: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const AUTH_KEY = 'minecloud_active_session';

export const UserProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem(AUTH_KEY));
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoPilotMode, setAutoPilotMode] = useState(false);
  const [latestNotification, setLatestNotification] = useState<AppNotification | null>(null);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const isCloudConnected = !!supabase;

  const addNotification = useCallback((title: string, message: string, type: NotificationType) => {
    const newNotif: AppNotification = { id: `NOT-${Date.now()}`, title, message, type, date: new Date().toISOString(), isRead: false };
    setLatestNotification(newNotif);
    setUser(prev => ({ ...prev, notifications: [newNotif, ...(prev.notifications || [])].slice(0, 20) }));
    
    setTimeout(() => {
      setLatestNotification(null);
    }, 5000);
  }, []);

  const markChatAsRead = useCallback(() => {
    setUser(prev => ({ ...prev, lastSeenChatTime: Date.now() }));
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const email = localStorage.getItem(AUTH_KEY);
      if (!email || !supabase) return;
      setIsSyncing(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('data')
          .eq('email', email.toLowerCase())
          .maybeSingle();
        if (data && !error) {
          setUser(data.data);
          addNotification("تم تسجيل الدخول", `مرحباً بك مجدداً في MineCloud`, NotificationType.SUCCESS);
        }
      } catch (e) { console.error("Fetch failed", e); }
      setIsSyncing(false);
    };
    if (isAuthenticated) fetchUser();
  }, [isAuthenticated, addNotification]);

  useEffect(() => {
    if (!isAuthenticated || !user.email || !supabase) return;

    const syncUser = async () => {
      try {
        await supabase
          .from('profiles')
          .upsert({ 
            email: userRef.current.email.toLowerCase(), 
            data: userRef.current 
          }, { onConflict: 'email' });
      } catch (e) { console.debug("Sync postponed"); }
    };

    const interval = setInterval(syncUser, 30000); 
    return () => clearInterval(interval);
  }, [user.email, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      setUser(current => {
        if (!current.activePackages.length) return current;
        const now = Date.now();
        let totalNewProfit = 0;
        let hasUpdates = false;
        const updatedPackages = current.activePackages.map(pkg => {
          if (pkg.status === DeviceStatus.RUNNING && pkg.expiryDate) {
            if (now >= pkg.expiryDate) { 
              hasUpdates = true; 
              addNotification("دورة مكتملة", `انتهت دورة التعدين للجهاز: ${pkg.name}`, NotificationType.INFO);
              return { ...pkg, status: DeviceStatus.COMPLETED }; 
            }
            const dailyValue = (pkg.priceAtPurchase * (pkg.currentDailyRate || 0)) / 100;
            totalNewProfit += dailyValue / 86400; 
          }
          return pkg;
        });
        if (totalNewProfit > 0 || hasUpdates) {
          return { 
            ...current, 
            balance: current.balance + totalNewProfit, 
            totalEarnings: current.totalEarnings + totalNewProfit, 
            activePackages: updatedPackages 
          };
        }
        return current;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, addNotification]);

  const login = async (email: string, pass: string) => {
    if (isPlaceHolder || !supabase) return { success: false, error: 'تأكد من إعدادات الربط' };
    setIsSyncing(true);
    try {
      const { data } = await supabase.from('profiles').select('data').eq('email', email.toLowerCase()).maybeSingle();
      if (data && data.data.password === pass) {
        localStorage.setItem(AUTH_KEY, email.toLowerCase());
        setUser(data.data);
        setIsAuthenticated(true);
        setIsSyncing(false);
        return { success: true };
      }
    } catch (err) { }
    setIsSyncing(false);
    return { success: false, error: 'بيانات غير صحيحة' };
  };

  const register = async (email: string, pass: string) => {
    if (isPlaceHolder || !supabase) return { success: false, error: 'تأكد من إعدادات الربط' };
    setIsSyncing(true);
    try {
      const { data: existing } = await supabase.from('profiles').select('email').eq('email', email.toLowerCase()).maybeSingle();
      if (existing) { setIsSyncing(false); return { success: false, error: 'مسجل مسبقاً' }; }
      const newUser: User = { 
        ...INITIAL_USER, 
        id: `USR-${Date.now()}`, 
        email: email.toLowerCase(), 
        password: pass, 
        referralCode: 'MINE-' + Math.floor(1000 + Math.random() * 9000) 
      };
      await supabase.from('profiles').insert({ email: email.toLowerCase(), data: newUser });
      localStorage.setItem(AUTH_KEY, email.toLowerCase());
      setUser(newUser);
      setIsAuthenticated(true);
      setIsSyncing(false);
      addNotification("أهلاً بك!", "تم إنشاء حسابك بنجاح.", NotificationType.SUCCESS);
      return { success: true };
    } catch (err) {
      setIsSyncing(false);
      return { success: false, error: 'فشل الإنشاء' };
    }
  };

  const purchaseDevice = async (pkg: MiningPackage) => {
    if (user.balance < pkg.price) {
      addNotification("فشل الشراء", "رصيدك غير كافٍ.", NotificationType.WARNING);
      return false;
    }
    const newDev: UserPackage = { instanceId: `DEV-${Date.now()}`, packageId: pkg.id, name: pkg.name, priceAtPurchase: pkg.price, status: DeviceStatus.IDLE, purchaseDate: Date.now(), isClaimed: true, icon: pkg.icon, dailyProfit: (pkg.price * pkg.dailyProfitPercent) / 100 };
    const updatedUser = { ...user, balance: user.balance - pkg.price, activePackages: [newDev, ...user.activePackages] };
    setUser(updatedUser);
    addNotification("تم الشراء!", `لقد تملكت ${pkg.name} بنجاح.`, NotificationType.SUCCESS);
    if (supabase) await supabase.from('profiles').update({ data: updatedUser }).eq('email', user.email.toLowerCase());
    return true;
  };

  return (
    <UserContext.Provider value={{ 
      user, isAuthenticated, isSyncing, isCloudConnected, latestNotification, 
      login, register, logout: () => { localStorage.removeItem(AUTH_KEY); setIsAuthenticated(false); },
      purchaseDevice,
      claimWelcomeGift: async () => {
        if (user.hasClaimedWelcomeGift) return false;
        const gift: UserPackage = { instanceId: `GIFT-${Date.now()}`, packageId: 'gift-001', name: 'Turbo S9 - تجريبي', priceAtPurchase: 5.0, status: DeviceStatus.RUNNING, purchaseDate: Date.now(), lastActivationDate: Date.now(), expiryDate: Date.now() + 86400000, currentDurationDays: 1, currentDailyRate: 100, isClaimed: true, icon: 'https://j.top4top.io/p_3669iibh30.jpg', dailyProfit: 5.0 };
        const updatedUser = { ...user, hasClaimedWelcomeGift: true, activePackages: [gift, ...user.activePackages] };
        setUser(updatedUser);
        addNotification("هدية انضمام!", "تم تفعيل جهاز الـ 5 دولار التجريبي.", NotificationType.PROFIT);
        if (supabase) await supabase.from('profiles').update({ data: updatedUser }).eq('email', user.email.toLowerCase());
        return true;
      },
      activateCycle: async (id, days, rate) => {
        const now = Date.now();
        const pkgName = user.activePackages.find(p => p.instanceId === id)?.name;
        const updatedUser = { ...user, activePackages: user.activePackages.map(pkg => pkg.instanceId === id ? { ...pkg, status: DeviceStatus.RUNNING, lastActivationDate: now, expiryDate: now + (days * 86400000), currentDurationDays: days, currentDailyRate: rate } : pkg ) };
        setUser(updatedUser);
        if (supabase) await supabase.from('profiles').update({ data: updatedUser }).eq('email', user.email.toLowerCase());
        addNotification("بدأ التعدين", `تم تفعيل دورة ${days} أيام لجهاز ${pkgName}.`, NotificationType.SUCCESS);
        return true;
      },
      depositFunds: async (amount, method, txHash) => {
        const tx: Transaction = { id: `TX-DEP-${Date.now()}`, amount, type: TransactionType.DEPOSIT, status: TransactionStatus.PENDING, date: new Date().toISOString(), currency: 'USDT', txHash };
        const updatedUser = { ...user, transactions: [tx, ...user.transactions] };
        setUser(updatedUser);
        addNotification("طلب إيداع", "جاري التحقق من عملية الشحن عبر الشبكة.", NotificationType.INFO);
        if (supabase) await supabase.from('profiles').update({ data: updatedUser }).eq('email', user.email.toLowerCase());
      },
      withdrawFunds: async (amount, address) => {
        if (user.balance < amount) return false;
        const tx: Transaction = { id: `TX-WDR-${Date.now()}`, amount, type: TransactionType.WITHDRAWAL, status: TransactionStatus.PENDING, date: new Date().toISOString(), currency: 'USDT', address };
        const updatedUser = { ...user, balance: user.balance - amount, transactions: [tx, ...user.transactions] };
        setUser(updatedUser);
        addNotification("طلب سحب", "تم استلام طلب السحب بنجاح وقيد المعالجة.", NotificationType.INFO);
        if (supabase) await supabase.from('profiles').update({ data: updatedUser }).eq('email', user.email.toLowerCase());
        return true;
      },
      approveTransaction: async (targetUserId, txId) => {
        if (!supabase) return;
        const { data: targetProfile } = await supabase.from('profiles').select('data').eq('data->>id', targetUserId).maybeSingle();
        if (targetProfile) {
          const tData = targetProfile.data;
          tData.transactions = tData.transactions.map((tx: any) => {
             if (tx.id === txId && tx.status === TransactionStatus.PENDING) {
                if (tx.type === TransactionType.DEPOSIT) tData.balance += tx.amount;
                return { ...tx, status: TransactionStatus.COMPLETED };
             }
             return tx;
          });
          await supabase.from('profiles').update({ data: tData }).eq('email', tData.email);
          if (user.id === targetUserId) setUser(tData);
        }
      },
      rejectTransaction: async (targetUserId, txId) => {
        if (!supabase) return;
        const { data: targetProfile } = await supabase.from('profiles').select('data').eq('data->>id', targetUserId).maybeSingle();
        if (targetProfile) {
          const tData = targetProfile.data;
          tData.transactions = tData.transactions.map((tx: any) => {
             if (tx.id === txId && tx.status === TransactionStatus.PENDING) {
                if (tx.type === TransactionType.WITHDRAWAL) tData.balance += tx.amount;
                return { ...tx, status: TransactionStatus.REJECTED };
             }
             return tx;
          });
          await supabase.from('profiles').update({ data: tData }).eq('email', tData.email);
          if (user.id === targetUserId) setUser(tData);
        }
      },
      addNotification,
      markChatAsRead,
      resetPassword: async (email, pass) => {
        if (!supabase) return { success: false };
        const { data } = await supabase.from('profiles').select('data').eq('email', email.toLowerCase()).maybeSingle();
        if (data) {
          const updated = { ...data.data, password: pass };
          await supabase.from('profiles').update({ data: updated }).eq('email', email.toLowerCase());
          addNotification("تغيير كلمة المرور", "تم تحديث كلمة المرور بنجاح.", NotificationType.SUCCESS);
          return { success: true };
        }
        return { success: false };
      },
      checkEmailExists: async (e) => {
        if (!supabase) return { exists: false };
        const { data } = await supabase.from('profiles').select('email').eq('email', e.toLowerCase()).maybeSingle();
        return { exists: !!data };
      },
      toggleRole: () => setUser(prev => ({ ...prev, role: prev.role === 'ADMIN' ? 'USER' : 'ADMIN' })),
      resetSystem: () => { localStorage.clear(); window.location.reload(); },
      completeOnboarding: () => setUser(p => ({ ...p, hasSeenOnboarding: true })),
      confirmRecoveryKeySaved: () => setUser(p => ({ ...p, hasSavedRecoveryKey: true })),
      autoPilotMode,
      toggleAutoPilot: () => setAutoPilotMode(!autoPilotMode),
      requestNotificationPermission: async () => {
        if (!('Notification' in window)) return false;
        return (await Notification.requestPermission()) === 'granted';
      },
      exportAccount: () => {
        try {
          const json = JSON.stringify(userRef.current);
          return btoa(unescape(encodeURIComponent(json)));
        } catch (e) {
          console.error("Export failed", e);
          return "";
        }
      },
      markNotificationsAsRead: () => setUser(prev => ({ ...prev, notifications: prev.notifications.map(n => ({ ...n, isRead: true })) })),
      clearNotifications: () => setUser(prev => ({ ...prev, notifications: [] }))
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser error');
  return context;
};
