import React, { useState } from 'react';
import { X, User, Moon, Globe, Shield, Accessibility, Type, Eye, MousePointer, Volume2, Bell, Smartphone, Monitor } from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onLogout: () => void;
}

type SettingsTab = 'general' | 'account' | 'accessibility' | 'privacy';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [textSize, setTextSize] = useState('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
               <h3 className="text-lg font-medium text-gray-800 mb-4">כללי</h3>
               
               <div className="space-y-4">
                   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                       <div className="flex items-center gap-3">
                           <Globe className="text-gray-500" size={20} />
                           <div>
                               <p className="font-medium text-gray-700">שפה</p>
                               <p className="text-xs text-gray-500">עברית (ישראל)</p>
                           </div>
                       </div>
                       <button className="text-blue-600 text-sm font-medium hover:bg-blue-50 px-3 py-1 rounded-md">שינוי</button>
                   </div>

                   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                       <div className="flex items-center gap-3">
                           <Moon className="text-gray-500" size={20} />
                           <div>
                               <p className="font-medium text-gray-700">מראה</p>
                               <p className="text-xs text-gray-500">בהיר (ברירת מחדל)</p>
                           </div>
                       </div>
                       <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                          <input type="checkbox" name="toggle" id="theme-toggle" className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer left-1 top-1"/>
                          <label htmlFor="theme-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                       </div>
                   </div>
               </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-medium text-gray-800 mb-4">התראות</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <Bell className="text-gray-500" size={20} />
                        <div>
                            <p className="font-medium text-gray-700">התראות שולחן עבודה</p>
                            <p className="text-xs text-gray-500">קבל התראות על תשובות חדשות</p>
                        </div>
                    </div>
                    <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                         <input type="checkbox" checked readOnly className="absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer left-5 top-1"/>
                         <label className="block overflow-hidden h-6 rounded-full bg-blue-500 cursor-pointer"></label>
                    </div>
                </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6 animate-fadeIn">
             <h3 className="text-lg font-medium text-gray-800 mb-4">חשבון Aivan</h3>
             
             <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h4 className="text-xl font-bold text-gray-900">{user.name}</h4>
                    <p className="text-gray-500">{user.email}</p>
                </div>
             </div>

             <div className="space-y-2">
                 <button className="w-full text-right p-4 hover:bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center group">
                     <div>
                         <p className="font-medium text-gray-700">ניהול מידע ופרטיות</p>
                         <p className="text-xs text-gray-500">שליטה בהיסטוריה ובפעילות שלך</p>
                     </div>
                     <span className="text-gray-400 group-hover:text-blue-600 transform group-hover:-translate-x-1 transition-all">←</span>
                 </button>
                 
                 <button className="w-full text-right p-4 hover:bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center group">
                     <div>
                         <p className="font-medium text-gray-700">אבטחה</p>
                         <p className="text-xs text-gray-500">הגדרות סיסמה ואימות דו-שלבי</p>
                     </div>
                     <span className="text-gray-400 group-hover:text-blue-600 transform group-hover:-translate-x-1 transition-all">←</span>
                 </button>
             </div>

             <div className="pt-6 border-t border-gray-100">
                 <button onClick={onLogout} className="text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-6 py-2 rounded-full font-medium transition-colors">
                     התנתק מהחשבון
                 </button>
             </div>
          </div>
        );

      case 'accessibility':
        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                    <h3 className="text-blue-900 font-bold text-lg flex items-center gap-2 mb-2">
                        <Accessibility size={20} />
                        נגישות ותצוגה
                    </h3>
                    <p className="text-blue-800 text-sm">התאם את Aivan לצרכים שלך לחוויה נוחה יותר.</p>
                </div>

                <div className="space-y-6">
                    {/* Text Size */}
                    <div className="pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Type className="text-gray-500" size={20} />
                            <span className="font-medium text-gray-800">גודל טקסט</span>
                        </div>
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                            {['small', 'medium', 'large', 'xl'].map((size) => (
                                <button 
                                    key={size}
                                    onClick={() => setTextSize(size)}
                                    className={`flex-1 py-2 rounded-md text-sm transition-all ${textSize === size ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {size === 'small' ? 'קטן' : size === 'medium' ? 'רגיל' : size === 'large' ? 'גדול' : 'ענק'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contrast */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <Eye className="text-gray-500" size={20} />
                            <div>
                                <p className="font-medium text-gray-700">ניגודיות גבוהה</p>
                                <p className="text-xs text-gray-500">הגברת הניגודיות לקריאה נוחה יותר</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setHighContrast(!highContrast)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${highContrast ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${highContrast ? 'left-1' : 'right-1'}`}></div>
                        </button>
                    </div>

                    {/* Screen Reader */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <Volume2 className="text-gray-500" size={20} />
                            <div>
                                <p className="font-medium text-gray-700">תמיכה בקורא מסך</p>
                                <p className="text-xs text-gray-500">אופטימיזציה ל-NVDA ו-Jaws</p>
                            </div>
                        </div>
                        <div className="relative inline-block w-10 h-6 align-middle select-none">
                            <input type="checkbox" checked readOnly className="absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer left-5 top-1"/>
                            <label className="block overflow-hidden h-6 rounded-full bg-blue-500 cursor-pointer"></label>
                        </div>
                    </div>

                    {/* Reduced Motion */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MousePointer className="text-gray-500" size={20} />
                            <div>
                                <p className="font-medium text-gray-700">הפחתת תנועה</p>
                                <p className="text-xs text-gray-500">צמצום אנימציות ומעברים</p>
                            </div>
                        </div>
                         <button 
                            onClick={() => setReducedMotion(!reducedMotion)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${reducedMotion ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${reducedMotion ? 'left-1' : 'right-1'}`}></div>
                        </button>
                    </div>
                </div>
            </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center animate-fadeIn" onClick={onClose} dir="rtl">
        <div className="bg-white w-full max-w-4xl h-[80vh] rounded-3xl shadow-2xl flex overflow-hidden max-h-[800px]" onClick={(e) => e.stopPropagation()}>
            
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-l border-gray-200 flex flex-col p-4 shrink-0">
                <h2 className="text-xl font-bold text-gray-800 mb-8 px-2 mt-2">הגדרות</h2>
                
                <nav className="space-y-1">
                    <button 
                        onClick={() => setActiveTab('general')}
                        className={`w-full text-right px-4 py-3 rounded-r-full mr-[-16px] pr-8 text-sm font-medium transition-colors flex items-center gap-3
                        ${activeTab === 'general' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <SettingsIcon active={activeTab === 'general'} />
                        כללי
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('account')}
                        className={`w-full text-right px-4 py-3 rounded-r-full mr-[-16px] pr-8 text-sm font-medium transition-colors flex items-center gap-3
                        ${activeTab === 'account' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <User size={18} />
                        חשבון
                    </button>

                    <button 
                        onClick={() => setActiveTab('accessibility')}
                        className={`w-full text-right px-4 py-3 rounded-r-full mr-[-16px] pr-8 text-sm font-medium transition-colors flex items-center gap-3
                        ${activeTab === 'accessibility' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Accessibility size={18} />
                        נגישות
                    </button>

                    <button 
                        onClick={() => setActiveTab('privacy')}
                        className={`w-full text-right px-4 py-3 rounded-r-full mr-[-16px] pr-8 text-sm font-medium transition-colors flex items-center gap-3
                        ${activeTab === 'privacy' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Shield size={18} />
                        פרטיות
                    </button>
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-200 px-2">
                    <p className="text-xs text-gray-400 text-center">Aivan v2.5.0</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full bg-white relative">
                 <div className="absolute top-4 left-4 z-10">
                     <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                         <X size={24} />
                     </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-8 md:p-12">
                     <div className="max-w-2xl mx-auto">
                        {renderContent()}
                     </div>
                 </div>
            </div>

        </div>
    </div>
  );
};

// Helper icon component
const SettingsIcon = ({ active }: { active: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-blue-600" : "text-gray-500"}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

export default SettingsModal;
