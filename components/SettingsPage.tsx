
import React, { useState, useEffect } from 'react';
import { User, Moon, Globe, Shield, Accessibility, Type, Eye, MousePointer, Volume2, Bell, ArrowRight, Check, Search, ChevronLeft, Lock, FileText, Download, Trash2, Key, Activity, Smartphone, Sun, Sparkles, MapPin, Image as ImageIcon, MessageSquare, RotateCcw, Loader2, Database, History, Pin, Calendar } from 'lucide-react';
import { User as UserType, ChatSession } from '../types';
import { storageService } from '../services/storageService';

interface SettingsPageProps {
  user: UserType;
  onLogout: () => void;
  onBack: () => void;
  initialTab?: 'general' | 'account' | 'accessibility' | 'privacy' | 'help' | 'trash' | 'history';
  chats?: ChatSession[];
  onRestoreChat?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  onEmptyTrash?: () => void;
  onOpenChat?: (id: string) => void;
  onPinChat?: (id: string) => void;
  onDeleteChat?: (id: string) => void; // Soft delete
}

type SettingsTab = 'general' | 'account' | 'accessibility' | 'privacy' | 'help' | 'trash' | 'history';

const SettingsPage: React.FC<SettingsPageProps> = ({ 
    user, 
    onLogout, 
    onBack, 
    initialTab = 'general', 
    chats = [], 
    onRestoreChat, 
    onPermanentDelete, 
    onEmptyTrash,
    onOpenChat,
    onPinChat,
    onDeleteChat
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  
  // Settings State
  const [textSize, setTextSize] = useState<number>(100);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<'he' | 'en'>('he');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);

  useEffect(() => {
    if (initialTab) {
        setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load Settings on Mount
  useEffect(() => {
    const savedSize = localStorage.getItem('AIVAN_TEXT_SIZE');
    if (savedSize) setTextSize(Number(savedSize));

    const savedContrast = localStorage.getItem('AIVAN_CONTRAST') === 'true';
    setHighContrast(savedContrast);

    const savedMotion = localStorage.getItem('AIVAN_REDUCED_MOTION') === 'true';
    setReducedMotion(savedMotion);

    const savedTheme = localStorage.getItem('AIVAN_THEME');
    setIsDarkMode(savedTheme === 'dark');

    const savedLang = localStorage.getItem('AIVAN_LANG');
    setLanguage(savedLang === 'en' ? 'en' : 'he');

    if ('Notification' in window && Notification.permission === 'granted') {
        setNotificationsEnabled(true);
    }
  }, []);

  // --- Handlers ---

  const handleTextSizeChange = (val: number) => {
      setTextSize(val);
      document.documentElement.style.fontSize = `${val}%`;
      localStorage.setItem('AIVAN_TEXT_SIZE', val.toString());
  };

  const handleContrastToggle = () => {
      const newVal = !highContrast;
      setHighContrast(newVal);
      document.body.style.filter = newVal ? 'contrast(1.25) saturate(1.2)' : 'none';
      localStorage.setItem('AIVAN_CONTRAST', newVal.toString());
  };

  const handleMotionToggle = () => {
      const newVal = !reducedMotion;
      setReducedMotion(newVal);
      const styleId = 'aivan-reduced-motion-style';
      let styleTag = document.getElementById(styleId);

      if (newVal) {
          if (!styleTag) {
              styleTag = document.createElement('style');
              styleTag.id = styleId;
              styleTag.innerHTML = `*, *::before, *::after { transition-duration: 0.01s !important; animation-duration: 0.01s !important; scroll-behavior: auto !important; }`;
              document.head.appendChild(styleTag);
          }
      } else {
          if (styleTag) styleTag.remove();
      }
      localStorage.setItem('AIVAN_REDUCED_MOTION', newVal.toString());
  };

  const handleEmptyTrashSafe = async () => {
      if (!onEmptyTrash) return;
      if (!window.confirm("לרוקן את כל סל המיחזור לצמיתות? פעולה זו בלתי הפיכה.")) return;
      
      setIsEmptyingTrash(true);
      try {
          await onEmptyTrash();
      } finally {
          setIsEmptyingTrash(false);
      }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
      case 'account':
      case 'privacy':
      case 'help':
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400">
             <Shield size={64} className="mb-6 opacity-20" />
             <h2 className="text-2xl font-bold text-gray-500">הגדרות לא זמינות</h2>
             <p className="mt-2 text-sm text-gray-400">לחלק מהאפשרויות אין גישה בגרסה זו.</p>
          </div>
        );

      case 'accessibility':
        return (
            <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
                <div className="flex items-center justify-between"><h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 google-sans bg-clip-text text-transparent bg-gradient-to-l from-blue-600 to-purple-600 w-fit">נגישות ותצוגה</h2><button onClick={() => { handleTextSizeChange(100); if (highContrast) handleContrastToggle(); if (reducedMotion) handleMotionToggle(); }} className="text-sm text-gray-500 hover:text-red-500 underline transition-colors">אפס לברירת מחדל</button></div>
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900"><div className="flex items-center justify-between mb-6"><div className="flex items-center gap-4"><div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl text-blue-600 dark:text-blue-300"><Type size={24} /></div><div><h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">גודל טקסט</h3><p className="text-sm text-gray-500 dark:text-gray-400">התאם את גודל הגופן לקריאה נוחה</p></div></div><span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{textSize}%</span></div><div className="flex items-center gap-6 px-2"><span className="text-sm text-gray-400 font-medium">A</span><div className="relative flex-1 h-12 flex items-center"><input type="range" min="25" max="500" step="5" value={textSize} onChange={(e) => handleTextSizeChange(Number(e.target.value))} className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500" /></div><span className="text-2xl text-gray-900 dark:text-gray-100 font-bold">A</span></div></div>
                    <div className="grid grid-cols-1 md:grid-cols-2"><div className="p-6 border-b md:border-b-0 md:border-l border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex items-center justify-between group"><div className="flex items-center gap-4"><div className={`p-3 rounded-xl transition-colors ${highContrast ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}><Eye size={22} /></div><div><div className="font-bold text-gray-900 dark:text-gray-100">ניגודיות גבוהה</div><div className="text-xs text-gray-500 dark:text-gray-400">חידוד צבעים וגבולות</div></div></div><button onClick={handleContrastToggle} className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner ${highContrast ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-600'}`}><span className={`block w-6 h-6 bg-white rounded-full absolute top-1 shadow-md transition-all duration-300 ${highContrast ? 'left-1' : 'right-1'}`} /></button></div><div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex items-center justify-between group"><div className="flex items-center gap-4"><div className={`p-3 rounded-xl transition-colors ${reducedMotion ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}><MousePointer size={22} /></div><div><div className="font-bold text-gray-900 dark:text-gray-100">הפחתת תנועה</div><div className="text-xs text-gray-500 dark:text-gray-400">ביטול אנימציות</div></div></div><button onClick={handleMotionToggle} className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner ${reducedMotion ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-600'}`}><span className={`block w-6 h-6 bg-white rounded-full absolute top-1 shadow-md transition-all duration-300 ${reducedMotion ? 'left-1' : 'right-1'}`} /></button></div></div>
                </div>
            </div>
        );

      case 'history':
        const activeChats = chats.filter(c => !c.deletedAt);
        return (
            <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto h-full flex flex-col">
                 <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 google-sans bg-clip-text text-transparent bg-gradient-to-l from-blue-600 to-indigo-600 w-fit">היסטוריית שיחות</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">ניהול כל השיחות הפעילות שלך.</p>
                </div>
                <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-2">
                    {activeChats.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 min-h-[300px]">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center"><History size={32} className="opacity-50" /></div>
                            <p>אין היסטוריית שיחות</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {activeChats.map(chat => (
                                <div key={chat.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group cursor-pointer" onClick={() => onOpenChat?.(chat.id)}>
                                    <div className="min-w-0 flex-1 ml-4">
                                        <div className="flex items-center gap-2 mb-1">
                                             {chat.isPinned && <Pin size={12} className="text-blue-500 fill-current transform rotate-45" />}
                                             <h4 className="font-bold text-gray-800 dark:text-gray-200 truncate">{chat.title}</h4>
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                            <span>{new Date(chat.date).toLocaleDateString('he-IL')}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className="truncate max-w-[200px]">{chat.messages[chat.messages.length - 1]?.text || '...'}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onPinChat?.(chat.id); }}
                                            className={`p-2 rounded-full transition-colors shadow-sm ${chat.isPinned ? 'text-blue-600 bg-blue-50' : 'hover:bg-white text-gray-500'}`}
                                            title="נעץ שיחה"
                                        >
                                            <Pin size={18} className={chat.isPinned ? "fill-current" : ""} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDeleteChat?.(chat.id); }}
                                            className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-full text-red-600 transition-colors shadow-sm" 
                                            title="מחק לסל מיחזור"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );

      case 'trash':
        const trashedChats = chats.filter(c => c.deletedAt);
        return (
            <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto h-full flex flex-col">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 google-sans bg-clip-text text-transparent bg-gradient-to-l from-red-600 to-orange-600 w-fit">סל מיחזור</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">פריטים שנמחקו יישמרו כאן למשך 30 יום לפני מחיקה לצמיתות.</p>
                    </div>
                    {trashedChats.length > 0 && (
                        <button 
                            onClick={handleEmptyTrashSafe}
                            disabled={isEmptyingTrash}
                            className={`flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors text-sm font-bold ${isEmptyingTrash ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isEmptyingTrash ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            {isEmptyingTrash ? 'מרוקן...' : 'רוקן סל מיחזור'}
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-2">
                    {trashedChats.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 min-h-[300px]">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center"><Trash2 size={32} className="opacity-50" /></div>
                            <p>סל המיחזור ריק</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {trashedChats.map(chat => (
                                <div key={chat.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                                    <div className="min-w-0 flex-1 ml-4">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-200 truncate">{chat.title}</h4>
                                        <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                            <span>נמחק ב: {new Date(chat.deletedAt!).toLocaleDateString('he-IL')}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>ימחק אוטומטית בעוד {30 - Math.floor((Date.now() - new Date(chat.deletedAt!).getTime()) / (1000 * 60 * 60 * 24))} ימים</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => onRestoreChat?.(chat.id)}
                                            className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-full text-blue-600 transition-colors shadow-sm" 
                                            title="שחזר שיחה"
                                        >
                                            <RotateCcw size={18} />
                                        </button>
                                        <button 
                                            onClick={() => { if(window.confirm("למחוק לצמיתות?")) onPermanentDelete?.(chat.id); }}
                                            className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-full text-red-600 transition-colors shadow-sm" 
                                            title="מחק לצמיתות"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full w-full bg-[#f8f9fa] dark:bg-[#121212] font-sans overflow-hidden" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <aside className="w-72 bg-white dark:bg-[#1e1e1e] flex flex-col h-full shrink-0 border-l dark:border-r border-gray-200 dark:border-gray-700 z-10 transition-colors shadow-sm">
            <div className="p-6 mb-2">
                 <button onClick={onBack} className="flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mb-6 group">
                     <div className="p-2 rounded-full group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
                        {language === 'he' ? <ArrowRight size={20} /> : <ArrowRight size={20} className="rotate-180" />}
                     </div>
                     <span className="font-medium">חזרה לצ'אט</span>
                 </button>
                 <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 google-sans px-2">הגדרות</h1>
            </div>
            
            <nav className="flex-1 overflow-y-auto px-4 space-y-3">
                <SettingsButton active={activeTab === 'accessibility'} onClick={() => setActiveTab('accessibility')} icon={Accessibility} label="נגישות" color="amber" />
                <SettingsButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="היסטוריית שיחות" color="indigo" />
                <SettingsButton active={activeTab === 'trash'} onClick={() => setActiveTab('trash')} icon={Trash2} label="סל מיחזור" color="red" />
            </nav>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700">
                <button onClick={onLogout} className="w-full text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-3 rounded-xl transition-colors flex items-center gap-3">
                    <Trash2 size={16} />
                    <span>התנתק מהחשבון</span>
                </button>
            </div>
        </aside>

        <main className="flex-1 overflow-y-auto relative bg-[#f8f9fa] dark:bg-[#121212]">
             <div className="p-8 md:p-12 w-full max-w-6xl mx-auto pb-20 h-full">
                 {/* Top Search Bar */}
                 {activeTab !== 'trash' && activeTab !== 'history' && (
                     <div className="max-w-2xl mx-auto mb-12 relative hidden md:block group">
                         <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                         <input type="text" placeholder="חפש הגדרה..." className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-full py-4 px-12 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900 transition-all text-base relative z-10 text-gray-900 dark:text-gray-100" />
                         <Search className={`absolute ${language === 'he' ? 'right-5' : 'left-5'} top-4 text-gray-400 z-20`} size={20} />
                     </div>
                 )}
                 {renderContent()}
             </div>
        </main>
    </div>
  );
};

const SettingsButton = ({ active, onClick, label, icon: Icon, color = "blue" }: any) => {
    const inactiveIconBg = "bg-gray-100 dark:bg-gray-800";
    const inactiveIconColor = "text-gray-500 dark:text-gray-400";
    const inactiveText = "text-gray-600 dark:text-gray-400";
    const hoverClasses = "hover:bg-gray-50 dark:hover:bg-gray-800";
    const activeClasses = `bg-gradient-to-l from-${color}-50 to-transparent dark:from-${color}-900/20 border-r-4 border-${color}-500`;
    const activeIconBg = `bg-${color}-100 dark:bg-${color}-900/50`;
    const activeIconColor = `text-${color}-600 dark:text-${color}-300`;
    const activeText = `text-${color}-700 dark:text-${color}-200 font-bold`;

    return (
        <button onClick={onClick} className={`w-full text-right px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 group ${active ? activeClasses : hoverClasses}`}>
            <div className={`p-2 rounded-full transition-colors ${active ? activeIconBg : inactiveIconBg} group-hover:scale-110 duration-200`}><Icon size={20} className={active ? activeIconColor : inactiveIconColor} /></div>
            <span className={active ? activeText : inactiveText}>{label}</span>
        </button>
    );
};

export default SettingsPage;
