
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Send, MessageSquare, ArrowRight, Clock, CheckCheck, Loader2, Globe, AlertCircle
} from 'lucide-react';
import { useUser } from '../UserContext';
import { useLanguage } from '../LanguageContext';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabaseConfig';

const supabase = (SUPABASE_URL.startsWith('http')) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

interface ChatMessage {
  id: string;
  sender_email: string;
  sender_role: 'USER' | 'ADMIN';
  message_text: string;
  created_at: string;
}

const ChatRoom = () => {
  const navigate = useNavigate();
  const { user, markChatAsRead, isCloudConnected } = useUser();
  const { isRtl } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('global_chat')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);
      if (data && !error) setMessages(data);
    } catch (e) {
      console.error("Chat fetch error", e);
    }
  };

  useEffect(() => {
    fetchMessages();
    markChatAsRead();

    if (!supabase) return;

    // اشتراك واحد فقط عند التحميل
    const channel = supabase
      .channel('chat_channel_v2')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_chat' }, (payload) => {
        const newMessage = payload.new as ChatMessage;
        setMessages(prev => {
          // تجنب تكرار الرسائل
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        // تحديث وقت المشاهدة دون التسبب في إعادة الاتصال
        setTimeout(markChatAsRead, 500);
      })
      .subscribe((status) => {
        console.debug("Chat status:", status);
        if (status === 'CHANNEL_ERROR') setError(isRtl ? "خطأ في الاتصال بالسحابة" : "Cloud Connection Error");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [markChatAsRead, isRtl]);

  // تمرير تلقائي عند وصول رسالة جديدة
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = inputText.trim();
    if (!trimmedText || isSending || !supabase) return;

    setIsSending(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('global_chat').insert({
        sender_email: user.email,
        sender_role: user.role,
        message_text: trimmedText
      });

      if (insertError) {
        throw insertError;
      }
      
      setInputText('');
    } catch (err: any) {
      console.error("Message send failed:", err);
      setError(isRtl ? "فشل الإرسال، يرجى المحاولة لاحقاً" : "Send failed, try again");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 animate-in fade-in duration-500 font-cairo text-right" dir="rtl">
      <header className="flex items-center justify-between glass p-6 rounded-[2rem] border border-white/5 shrink-0 shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-all">
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <MessageSquare className="text-blue-500" size={20} />
              مركز الدعم المباشر
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
              {isCloudConnected ? 'متصل بالسحابة' : 'بانتظار الربط...'}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 glass rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col bg-slate-900/20 shadow-2xl relative">
        
        {error && (
          <div className="absolute top-4 left-4 right-4 z-10 animate-in slide-in-from-top-4">
            <div className="bg-rose-600 text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xl">
              <AlertCircle size={18} />
              <span className="text-xs font-black">{error}</span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 && !isSending && (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
               <MessageSquare size={48} className="text-slate-600 mb-4" />
               <p className="font-black">لا توجد رسائل سابقة</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender_email === user.email;
            const isAdmin = msg.sender_role === 'ADMIN';
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className="flex items-center gap-2 mb-1 px-2">
                  {!isMe && <span className="text-[10px] font-black text-slate-500">{msg.sender_email.split('@')[0]}</span>}
                  {isAdmin && <span className="bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded-md">ADMIN</span>}
                </div>
                <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl relative ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-white/5 shadow-sm'}`}>
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap break-words">{msg.message_text}</p>
                  <div className={`flex items-center gap-1.5 mt-2 opacity-50 text-[9px] font-bold ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <Clock size={10} />
                    {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    {isMe && <CheckCheck size={12} className="text-white/70" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-5 bg-slate-950/50 border-t border-white/5 flex gap-3 items-end">
           <textarea 
             rows={1} 
             value={inputText} 
             onChange={(e) => setInputText(e.target.value)} 
             onKeyDown={(e) => {
               if (e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault();
                 handleSendMessage(e as any);
               }
             }}
             placeholder="اكتب رسالتك للمدير..." 
             className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-all text-sm resize-none" 
           />
           <button 
             type="submit" 
             disabled={!inputText.trim() || isSending || !isCloudConnected} 
             className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl ${inputText.trim() && isCloudConnected && !isSending ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-800 text-slate-600'}`}
           >
             {isSending ? <Loader2 className="animate-spin" /> : <Send size={24} className="mr-1" />}
           </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
