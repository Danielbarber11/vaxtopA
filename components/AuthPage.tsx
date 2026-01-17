
import React, { useState, useRef, useEffect } from 'react';
import { AuthMode, ChatMessage } from '../types';
import { storageService } from '../services/storageService';
import { chatWithGemini } from '../services/geminiService';
import { Eye, EyeOff, AlertTriangle, ChevronDown, Check, ArrowRight, X, Send, RefreshCw, Bot, User as UserIcon, MessageCircle, Accessibility, HelpCircle, FileText, Lock, Globe } from 'lucide-react';

interface AuthPageProps {
  mode: AuthMode;
  onSuccess: (email: string, name: string) => void;
  onSwitchMode: (mode: AuthMode) => void;
}

const LANGUAGES = [
  { code: 'he', label: 'עברית (ישראל)' },
  { code: 'en', label: 'English (United States)' }
];

const TRANSLATIONS = {
  he: {
    signin_title: 'כניסה',
    signup_title: 'יצירת חשבון Aivan',
    complete_profile_title: 'השלמת פרטי חשבון',
    continue_to: 'להמשך אל Aivan',
    email_label: 'אימייל או טלפון',
    password_label: 'הזן את הסיסמה שלך',
    create_password_label: 'צור סיסמה',
    first_name_label: 'שם פרטי',
    last_name_label: 'שם משפחה',
    next: 'הבא',
    create_account: 'צור חשבון',
    continue_here: 'המשך כאן',
    working: 'עובד...',
    cancel: 'ביטול',
    agree_create: 'אני מאשר ויוצר חשבון',
    error_email: 'נא להזין כתובת אימייל תקינה',
    error_password_short: 'הסיסמה חייבת להכיל לפחות 4 תווים',
    error_names: 'נא להזין שם ושם משפחה',
    footer_help: 'עזרה',
    footer_privacy: 'מדיניות פרטיות',
    footer_terms: 'תנאי השימוש',
    footer_accessibility: 'הצהרת נגישות',
    footer_access_settings: 'הגדרות נגישות',
    footer_lang: 'שפה',
    welcome_back: 'ברוכים הבאים',
    create_strong_pass: 'יצירת סיסמה חזקה',
    create_account_title: 'צור את חשבון Aivan שלך',
    privacy_terms_title: 'פרטיות ותנאים',
    terms_text_1: 'אנא אשר כי בעת יצירת החשבון, קראת את',
    terms_link: 'תנאי השימוש',
    privacy_link: 'מדיניות הפרטיות',
    terms_text_2: ', אתה מודע להם ומאשר אותם באופן מלא.',
    view_full_terms: 'לצפייה בעמוד התנאים המלא',
    close_and_return: 'סגור וחזור',
    help_input_placeholder: 'כיצד אוכל לעזור לך?',
    help_reset: 'אפס שיחה',
    help_suggestions_title: 'שאלות נפוצות:',
    suggestion_reset_pass: 'איך מאפסים סיסמה?',
    suggestion_secure: 'האם המידע שלי מאובטח?',
    suggestion_contact: 'איך יוצרים קשר עם תמיכה?',
    legal_liability_title: 'הסרת אחריות וסיכונים',
    legal_liability_text: 'החברה לא תהיה אחראית לכל נזק פיזי, נפשי, כספי או אחר שייגרם למשתמש או לצד שלישי כלשהו בעת השימוש באפליקציה. אישור תנאים אלו מהווה ויתור מוחלט ובלתי חוזר על כל תביעה עתידית בבית משפט כנגד החברה או מפעיליה.',
    legal_model_title: 'מודל הבינה המלאכותית',
    legal_model_text: 'השירות מבוסס על מודל Gemini מבית Google. אנו לא אחראים על טעויות, הזיות (Hallucinations) או שגיאות בתוכן המופק על ידי המודל. הבוט עלול לטעות ולספק מידע שגוי. האחריות על כל פעולה שתבצע או החלטה שתקבל על בסיס תשובות הבוט היא עליך בלבד.',
    switch_to_login: 'כניסה',
    switch_to_signup: 'יצירת חשבון'
  },
  en: {
    signin_title: 'Sign in',
    signup_title: 'Create your Aivan Account',
    complete_profile_title: 'Complete Profile',
    continue_to: 'to continue to Aivan',
    email_label: 'Email or phone',
    password_label: 'Enter your password',
    create_password_label: 'Create password',
    first_name_label: 'First name',
    last_name_label: 'Last name',
    next: 'Next',
    create_account: 'Create account',
    continue_here: 'Continue here',
    working: 'Working...',
    cancel: 'Cancel',
    agree_create: 'I agree & Create account',
    error_email: 'Please enter a valid email address',
    error_password_short: 'Password must be at least 4 characters',
    error_names: 'Please enter first and last name',
    footer_help: 'Help',
    footer_privacy: 'Privacy Policy',
    footer_terms: 'Terms of Use',
    footer_accessibility: 'Accessibility Statement',
    footer_access_settings: 'Accessibility Settings',
    footer_lang: 'Language',
    welcome_back: 'Welcome',
    create_strong_pass: 'Create a strong password',
    create_account_title: 'Create your Aivan Account',
    privacy_terms_title: 'Privacy and Terms',
    terms_text_1: 'Please confirm that by creating an account, you have read the',
    terms_link: 'Terms of Use',
    privacy_link: 'Privacy Policy',
    terms_text_2: ', you are aware of them and fully approve them.',
    view_full_terms: 'View full terms',
    close_and_return: 'Close and Return',
    help_input_placeholder: 'How can I help you?',
    help_reset: 'Reset Chat',
    help_suggestions_title: 'Common Questions:',
    suggestion_reset_pass: 'How do I reset password?',
    suggestion_secure: 'Is my data secure?',
    suggestion_contact: 'How to contact support?',
    legal_liability_title: 'Liability Disclaimer',
    legal_liability_text: 'The Company shall not be liable for any physical, mental, financial, or other damage caused to the user or any third party while using the application. Approval of these terms constitutes an absolute and irrevocable waiver of any future lawsuit in court against the Company.',
    legal_model_title: 'AI Model Disclaimer',
    legal_model_text: 'The service is based on Google\'s Gemini model. We are not responsible for errors, hallucinations, or inaccuracies in the content produced by the model. The bot may make mistakes. The responsibility for any action taken based on the bot\'s answers lies solely with you.',
    switch_to_login: 'Sign In',
    switch_to_signup: 'Create Account'
  }
};

type AuthStep = 'email' | 'password' | 'terms' | 'names';
type LangCode = 'he' | 'en';
type InfoPageType = 'help' | 'privacy' | 'terms' | 'accessibility' | null;

const AuthPage: React.FC<AuthPageProps> = ({ mode, onSuccess, onSwitchMode }) => {
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Removed showCreateAccountButtons logic in favor of always visible switch
  const [currentLang, setCurrentLang] = useState<LangCode>('he');
  const [infoPage, setInfoPage] = useState<InfoPageType>(null);
  const [helpMessages, setHelpMessages] = useState<ChatMessage[]>([]);
  const [helpInput, setHelpInput] = useState('');
  const [isHelpTyping, setIsHelpTyping] = useState(false);
  const [isCompletingIncompleteProfile, setIsCompletingIncompleteProfile] = useState(false);
  const helpEndRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[currentLang];
  const isRtl = currentLang === 'he';

  useEffect(() => {
    const session = storageService.getSession();
    if (session && mode === 'signup' && step === 'email') {
        setEmail(session.email);
        setStep('terms');
        setIsCompletingIncompleteProfile(true);
    }
  }, []);

  useEffect(() => {
    if (infoPage === 'help') {
        helpEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [helpMessages, infoPage, isHelpTyping]);

  const toggleLanguage = () => {
      const newLang = currentLang === 'he' ? 'en' : 'he';
      setCurrentLang(newLang);
      document.documentElement.lang = newLang;
      document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
  };

  const handleAccessibilitySettings = () => {
      const currentContrast = document.body.style.filter === 'contrast(1.25) saturate(1.2)';
      const newContrast = !currentContrast;
      document.body.style.filter = newContrast ? 'contrast(1.25) saturate(1.2)' : 'none';
      localStorage.setItem('AIVAN_CONTRAST', String(newContrast));
      alert(isRtl ? "הגדרות ניגודיות שונו" : "Contrast settings toggled");
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 'email') {
      if (!email.includes('@')) {
        setError(t.error_email);
        return;
      }
      setLoading(true);
      const exists = await storageService.userExists(email);
      if (mode === 'signup' && exists) {
          const isComplete = await storageService.isProfileComplete(email);
          if (!isComplete) {
              setLoading(false);
              setStep('password');
              setIsCompletingIncompleteProfile(true);
              return;
          }
          setLoading(false);
          onSwitchMode('signin');
          setStep('password');
          setError(isRtl ? 'חשבון זה כבר קיים. הועברת להתחברות.' : 'Account exists. Switched to login.');
          return;
      }
      setLoading(false);
      setStep('password');
      return;
    } 

    if (step === 'password') {
      if (password.length < 4 && !isCompletingIncompleteProfile) {
         setError(t.error_password_short);
         return;
      }
      if (mode === 'signin') {
        setLoading(true);
        const result = await storageService.authenticate('signin', email, password);
        setLoading(false);
        if (result.success) {
          onSuccess(email, result.name || ''); 
        } else {
          if (result.message === 'PROFILE_INCOMPLETE') {
              setIsCompletingIncompleteProfile(true);
              setStep('terms');
          } else {
              setError(result.message || 'Error');
          }
        }
      } else {
        setStep('terms');
      }
      return;
    }

    if (step === 'terms') {
       setStep('names');
       return;
    }

    if (step === 'names') {
       if (!firstName.trim() || !lastName.trim()) {
         setError(t.error_names);
         return;
       }
       setLoading(true);
       const fullName = `${firstName} ${lastName}`;
       const result = await storageService.authenticate('signup', email, password, fullName);
       setLoading(false);
       if (result.success) {
         onSuccess(email, result.name || fullName);
       } else {
         setError(result.message || 'Registration failed');
       }
    }
  };

  const handleResetToEmail = () => {
    setStep('email');
    setError('');
    setPassword('');
    setIsCompletingIncompleteProfile(false);
  };

  const handleSwitchMode = () => {
      const newMode = mode === 'signin' ? 'signup' : 'signin';
      onSwitchMode(newMode);
      setStep('email');
      setError('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setIsCompletingIncompleteProfile(false);
  };

  const handleHelpSend = async (overrideText?: string) => {
      const textToSend = overrideText || helpInput;
      if (!textToSend.trim()) return;
      const userMsg: ChatMessage = { role: 'user', text: textToSend, timestamp: new Date().toISOString() };
      setHelpMessages(prev => [...prev, userMsg]);
      setHelpInput('');
      setIsHelpTyping(true);
      const response = await chatWithGemini(helpMessages, userMsg.text); 
      const botMsg: ChatMessage = { role: 'model', text: response, timestamp: new Date().toISOString() };
      setHelpMessages(prev => [...prev, botMsg]);
      setIsHelpTyping(false);
  };

  const resetHelpChat = () => {
      setHelpMessages([]);
      setHelpInput('');
  };

  const renderInfoPage = () => {
    if (!infoPage) return null;
    let title = '';
    let content = <></>;
    switch (infoPage) {
      case 'help':
        title = isRtl ? 'מרכז העזרה (בוט)' : 'Help Center (Bot)';
        content = (
           <div className="flex flex-col h-full w-full mx-auto bg-gray-50 overflow-hidden relative rounded-xl border border-gray-100 shadow-sm">
              <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10 shrink-0">
                  <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Bot size={20} /></div>
                      <div className="flex flex-col"><span className="font-bold text-gray-800">Aivan Support</span><span className="text-xs text-green-600 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Online</span></div>
                  </div>
                  <button onClick={resetHelpChat} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors border border-gray-200 hover:border-red-200" title={t.help_reset}><RefreshCw size={14} />{t.help_reset}</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                  {helpMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fadeIn">
                          <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mb-2"><MessageCircle size={40} className="text-blue-500" /></div>
                          <div><h3 className="text-xl font-bold text-gray-800 mb-2">שלום, איך אפשר לעזור?</h3><p className="text-gray-500 font-medium">{t.help_suggestions_title}</p></div>
                          <div className="flex flex-wrap justify-center gap-3 max-w-lg">
                              <button onClick={() => handleHelpSend(t.suggestion_reset_pass)} className="bg-white border border-gray-200 px-5 py-3 rounded-full text-sm hover:border-blue-400 hover:text-blue-600 hover:shadow-md transition-all shadow-sm">{t.suggestion_reset_pass}</button>
                              <button onClick={() => handleHelpSend(t.suggestion_secure)} className="bg-white border border-gray-200 px-5 py-3 rounded-full text-sm hover:border-blue-400 hover:text-blue-600 hover:shadow-md transition-all shadow-sm">{t.suggestion_secure}</button>
                              <button onClick={() => handleHelpSend(t.suggestion_contact)} className="bg-white border border-gray-200 px-5 py-3 rounded-full text-sm hover:border-blue-400 hover:text-blue-600 hover:shadow-md transition-all shadow-sm">{t.suggestion_contact}</button>
                          </div>
                      </div>
                  ) : (
                      <>
                        {helpMessages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fadeIn`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}</div>
                                <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>{msg.text}</div>
                            </div>
                        ))}
                        {isHelpTyping && (
                            <div className="flex gap-3 animate-fadeIn">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm"><Bot size={16} /></div>
                                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div></div>
                            </div>
                        )}
                      </>
                  )}
                  <div ref={helpEndRef} />
              </div>
              <div className="p-4 sm:p-6 bg-white border-t border-gray-100 shrink-0">
                  <div className="flex items-center gap-3">
                      <div className="flex-1 rounded-full p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-sm">
                          <input value={helpInput} onChange={(e) => setHelpInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleHelpSend()} placeholder={t.help_input_placeholder} className="w-full h-full bg-white rounded-full px-5 py-3 outline-none text-gray-800 placeholder-gray-400 text-sm" />
                      </div>
                      <button onClick={() => handleHelpSend()} disabled={!helpInput.trim() || isHelpTyping} className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all" aria-label={isRtl ? "שלח הודעה" : "Send message"}><div className="w-full h-full bg-transparent group-hover:bg-white/10 rounded-full flex items-center justify-center transition-colors"><Send size={20} className="text-white relative left-[-1px]" /></div></button>
                  </div>
              </div>
           </div>
        );
        break;
      case 'privacy':
        title = isRtl ? 'מדיניות פרטיות' : 'Privacy Policy';
        content = (
          <div className="space-y-6 text-right">
             <p className="text-xl">פרטיותכם היא ערך עליון עבורנו ב-Aivan.</p>
             <div className="bg-red-50 p-4 rounded-lg border border-red-100 mt-4"><h4 className="font-bold text-red-800 mb-1">{t.legal_liability_title}</h4><p className="text-red-700 text-sm">{t.legal_liability_text}</p></div>
             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4"><h4 className="font-bold text-blue-800 mb-1">{t.legal_model_title}</h4><p className="text-blue-700 text-sm">{t.legal_model_text}</p></div>
          </div>
        );
        break;
      case 'terms':
        title = isRtl ? 'תנאי שימוש' : 'Terms of Service';
        content = (
          <div className="space-y-6 text-right">
             <div className="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm"><h3 className="font-bold text-red-900 mb-2">{t.legal_liability_title}</h3><p className="text-red-800 leading-relaxed text-sm">{t.legal_liability_text}</p></div>
          </div>
        );
        break;
      case 'accessibility':
        title = isRtl ? 'הצהרת נגישות' : 'Accessibility';
        content = <div className="space-y-6 text-right"><p>אנו ב-Aivan רואים חשיבות עליונה במתן שירות שוויוני ונגיש לכלל המשתמשים, לרבות אנשים עם מוגבלויות.</p></div>;
        break;
    }
    return (
      <div className="fixed inset-0 bg-white z-[60] overflow-y-auto animate-fadeIn flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center gap-4 z-10 shadow-sm shrink-0">
             <button onClick={() => setInfoPage(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
                {isRtl ? <ArrowRight size={24} className="text-gray-600 group-hover:text-gray-900" /> : <ArrowRight size={24} className="text-gray-600 group-hover:text-gray-900 rotate-180" />}
             </button>
             <h2 className="text-2xl font-medium text-gray-800 google-sans">{title}</h2>
        </div>
        <div className={`w-full max-w-4xl mx-auto ${infoPage === 'help' ? 'flex flex-col h-[calc(100vh-80px)] p-4 sm:p-6' : 'flex-1 p-8 sm:p-12 pb-20'}`}>
            {content}
            {infoPage !== 'help' && (
              <div className="mt-12 flex justify-center">
                 <button onClick={() => setInfoPage(null)} className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-sm font-medium">{t.close_and_return}</button>
              </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-white sm:bg-gray-100 relative py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {renderInfoPage()}
      
      {/* Auth Card */}
      <div className="w-full max-w-[450px] bg-white p-10 sm:rounded-2xl sm:shadow-md sm:border sm:border-gray-200 flex flex-col items-center text-center transition-all relative z-0 h-auto sm:min-h-[560px]">
        <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 flex-shrink-0">
            <span className="text-6xl font-bold bg-gradient-to-tr from-blue-600 to-pink-500 bg-clip-text text-transparent google-sans">A</span>
        </div>
        <div className="space-y-2 w-full mb-8 flex-shrink-0">
          <h2 className="text-2xl text-gray-900 font-normal google-sans">
            {isCompletingIncompleteProfile ? t.complete_profile_title : (step === 'email' ? (mode === 'signin' ? t.signin_title : t.signup_title) : step === 'terms' ? t.privacy_terms_title : step === 'names' ? t.create_account_title : (mode === 'signin' ? t.welcome_back : t.create_strong_pass))}
          </h2>
          {(step !== 'email' && step !== 'terms' && !isCompletingIncompleteProfile) && (
            <div className="flex items-center justify-center gap-2 border border-gray-200 rounded-full py-1 px-3 w-fit mx-auto cursor-pointer hover:bg-gray-50 transition-colors mt-2 bg-white" onClick={handleResetToEmail}>
                <div className="w-5 h-5 bg-purple-600 rounded-full text-white text-xs flex items-center justify-center font-bold">{email.charAt(0).toUpperCase()}</div>
                <span className="text-sm font-medium text-gray-700">{email}</span>
            </div>
          )}
          {isCompletingIncompleteProfile && (
              <div className="flex items-center justify-center gap-2 border border-gray-100 rounded-full py-1 px-3 w-fit mx-auto mt-2 bg-gray-50">
                  <span className="text-sm font-medium text-gray-500">{email}</span>
              </div>
          )}
        </div>
        <div className="w-full min-h-[40px] flex-shrink-0 mb-2">
            {error && (
                <div className="w-full bg-red-50 border border-red-100 rounded-lg p-3 flex flex-col items-start gap-1 text-start">
                    <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-700 flex-shrink-0" />
                    <span className="text-red-700 text-sm font-medium whitespace-pre-line leading-tight">{error}</span>
                    </div>
                </div>
            )}
        </div>
        
        {step === 'terms' ? (
          <div className="w-full text-start h-full flex flex-col">
            <div className="mb-4 text-gray-800 text-sm leading-relaxed border-b border-gray-100 pb-4 flex-grow overflow-y-auto">
                {t.terms_text_1} <button className="text-blue-600 font-bold hover:underline inline mx-1" onClick={() => setInfoPage('terms')}>{t.terms_link}</button> 
                {isRtl ? 'ואת' : 'and'} <button className="text-blue-600 font-bold hover:underline inline mx-1" onClick={() => setInfoPage('privacy')}>{t.privacy_link}</button>
                {t.terms_text_2}
            </div>
            <div className="flex justify-end gap-4 mt-auto pt-4 flex-shrink-0">
                <button onClick={() => setStep('password')} className="text-blue-600 font-medium text-sm hover:bg-blue-50 px-4 py-2 rounded transition-colors">{t.cancel}</button>
                <button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-full transition-colors shadow-sm">{t.agree_create}</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleNext} className="w-full flex-grow flex flex-col">
            <div className="space-y-4 text-start flex-grow">
              {step === 'email' && (
                <div className="relative">
                  <input type="text" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="peer w-full h-14 rounded-full border border-gray-300 px-6 pt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-transparent text-gray-900 bg-white" placeholder={t.email_label} autoFocus />
                  <label htmlFor="email" className={`absolute ${isRtl ? 'right-6' : 'left-6'} px-1 transition-all pointer-events-none bg-white ${email ? '-top-2.5 text-xs text-blue-600' : 'top-3.5 text-gray-500'}`}>{t.email_label}</label>
                </div>
              )}
              {step === 'password' && (
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="peer w-full h-14 rounded-full border border-gray-300 px-6 pt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-transparent text-gray-900 bg-white" placeholder={mode === 'signin' ? t.password_label : t.create_password_label} autoFocus />
                  <label htmlFor="password" className={`absolute ${isRtl ? 'right-6' : 'left-6'} px-1 transition-all pointer-events-none bg-white ${password ? '-top-2.5 text-xs text-blue-600' : 'top-3.5 text-gray-500'}`}>{mode === 'signin' ? t.password_label : t.create_password_label}</label>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-4 text-gray-600`}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
              )}
              {step === 'names' && (
                <div className="flex gap-4">
                  <div className="relative w-1/2"><input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="peer w-full h-14 rounded-full border border-gray-300 px-6 pt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-transparent text-gray-900 bg-white" placeholder={t.first_name_label} autoFocus /><label htmlFor="firstName" className={`absolute ${isRtl ? 'right-6' : 'left-6'} px-1 transition-all pointer-events-none bg-white ${firstName ? '-top-2.5 text-xs text-blue-600' : 'top-3.5 text-gray-500'}`}>{t.first_name_label}</label></div>
                  <div className="relative w-1/2"><input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="peer w-full h-14 rounded-full border border-gray-300 px-6 pt-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-transparent text-gray-900 bg-white" placeholder={t.last_name_label} /><label htmlFor="lastName" className={`absolute ${isRtl ? 'right-6' : 'left-6'} px-1 transition-all pointer-events-none bg-white ${lastName ? '-top-2.5 text-xs text-blue-600' : 'top-3.5 text-gray-500'}`}>{t.last_name_label}</label></div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center pt-8 mt-auto flex-shrink-0">
              {/* Mode Switch Button */}
              <div>
                  {!isCompletingIncompleteProfile && (
                      <button type="button" onClick={handleSwitchMode} className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded transition-colors text-sm">
                          {mode === 'signup' ? t.switch_to_login : t.switch_to_signup}
                      </button>
                  )}
              </div>
              <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2 rounded-full transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? t.working : t.next}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer Links */}
      <footer className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500 px-4">
          <button onClick={handleAccessibilitySettings} className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <Accessibility size={14} />
              {t.footer_access_settings}
          </button>
          <button onClick={() => setInfoPage('accessibility')} className="hover:text-blue-600 transition-colors flex items-center gap-1">
              {t.footer_accessibility}
          </button>
          <button onClick={() => setInfoPage('help')} className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <HelpCircle size={14} />
              {t.footer_help}
          </button>
          <button onClick={() => setInfoPage('terms')} className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <FileText size={14} />
              {t.footer_terms}
          </button>
          <button onClick={toggleLanguage} className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <Globe size={14} />
              {t.footer_lang}
          </button>
          <button onClick={() => setInfoPage('privacy')} className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <Lock size={14} />
              {t.footer_privacy}
          </button>
      </footer>
    </div>
  );
};

export default AuthPage;
