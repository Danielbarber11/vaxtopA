
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, X, Send, User, Bot, Check, Globe, Shield, Eye, Info, ChevronDown, Cookie, Accessibility } from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

const DEMO_SCENARIOS = {
  write: {
    title: 'עזור לי לכתוב',
    description: 'Aivan יכול לעזור לך לנסח הודעות, מסמכים ורעיונות במהירות ובמקצועיות.',
    prompt: 'כתוב מכתב תודה ללקוח על פגישה מוצלחת...',
    response: 'הי דני, תודה רבה על הפגישה היום. נהניתי מאוד לשמוע על הפרויקט ואני מצפה לעבודה המשותפת...'
  },
  travel: {
    title: 'תכנן טיול',
    description: 'מתכננים חופשה? Aivan יבנה עבורכם מסלול טיול מותאם אישית תוך שניות.',
    prompt: 'תכנן לי טיול של 3 ימים בצפון איטליה',
    response: 'בשמחה! הנה הצעה לטיול:\nיום 1: מילאנו - הדואומו וגלריה ויטוריו.\nיום 2: אגם קומו - שייט וביקור בבלג\'יו.\nיום 3: ורונה - הארנה ובית יוליה.'
  },
  learn: {
    title: 'למד משהו חדש',
    description: 'רוצים להעמיק בנושא חדש? Aivan יסביר לכם מושגים מורכבים בשפה פשוטה.',
    prompt: 'הסבר לי בפשטות איך עובד בינה מלאכותית',
    response: 'בינה מלאכותית (AI) היא כמו מחשב שלומד מדוגמאות. במקום שניתן לו הוראות מדויקות, אנחנו מראים לו הרבה נתונים, והוא לומד לזהות דפוסים ולבצע משימות לבד.'
  }
};

type LegalDocType = 'privacy' | 'terms' | 'about' | 'accessibility' | null;

const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onSignUp }) => {
  const [activeDemo, setActiveDemo] = useState<'write' | 'travel' | 'learn'>('write');
  const demoRef = useRef<HTMLDivElement>(null);
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [demoStep, setDemoStep] = useState(0); 
  const [typedText, setTypedText] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  
  useEffect(() => {
    if (legalDoc) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [legalDoc]);

  useEffect(() => {
    const consent = localStorage.getItem('AIVAN_COOKIE_CONSENT');
    if (!consent) {
        setTimeout(() => setShowCookieConsent(true), 1500);
    }
  }, []);

  const acceptCookies = () => {
      localStorage.setItem('AIVAN_COOKIE_CONSENT', 'true');
      setShowCookieConsent(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
            setResetTrigger(prev => prev + 1);
        }
      },
      { threshold: 0.4 }
    );

    if (demoRef.current) {
      observer.observe(demoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    let typeInterval: ReturnType<typeof setInterval>;
    const scenario = DEMO_SCENARIOS[activeDemo];
    setIsTransitioning(false);
    setDemoStep(0);
    setTypedText('');
    timeouts.push(setTimeout(() => {
      setDemoStep(1);
      let i = 0;
      typeInterval = setInterval(() => {
        setTypedText(scenario.prompt.substring(0, i + 1));
        i++;
        if (i >= scenario.prompt.length) {
          clearInterval(typeInterval);
          timeouts.push(setTimeout(() => setDemoStep(2), 500));
        }
      }, 40);
    }, 500));
    return () => {
      timeouts.forEach(clearTimeout);
      if (typeInterval) clearInterval(typeInterval);
    };
  }, [activeDemo, resetTrigger]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (demoStep === 2) {
      t = setTimeout(() => {
        setDemoStep(3);
        setTimeout(() => {
           setDemoStep(4);
           setTimeout(() => {
             setDemoStep(5);
           }, 2000);
        }, 300); 
      }, 800);
    }
    if (demoStep === 5) {
      t = setTimeout(() => {
        setIsTransitioning(true);
        setTimeout(() => {
            const nextDemo = activeDemo === 'write' ? 'travel' : activeDemo === 'travel' ? 'learn' : 'write';
            setActiveDemo(nextDemo); 
        }, 300);
      }, 3000);
    }
    return () => clearTimeout(t);
  }, [demoStep, activeDemo]);

  const handleDemoSwitch = (demo: 'write' | 'travel' | 'learn') => {
    if (demo === activeDemo) {
        setResetTrigger(prev => prev + 1);
    } else {
        setIsTransitioning(true);
        setTimeout(() => {
            setActiveDemo(demo);
        }, 300);
    }
  };

  const handleCardClick = (demo: 'write' | 'travel' | 'learn') => {
      handleDemoSwitch(demo);
      setTimeout(() => {
        demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
  };

  const handleHoverStart = (demo: 'write' | 'travel' | 'learn') => {
    if (activeDemo === demo) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      handleDemoSwitch(demo);
    }, 2000);
  };

  const handleHoverEnd = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const ALogoIcon = () => (
    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
        <span className="text-xl font-bold bg-gradient-to-tr from-blue-600 to-pink-500 bg-clip-text text-transparent google-sans select-none">A</span>
    </div>
  );

  const renderLegalContent = () => {
    if (!legalDoc) return null;
    let title = '';
    let content = <></>;

    switch (legalDoc) {
      case 'accessibility':
        title = 'הצהרת נגישות';
        content = (
          <div className="space-y-6 text-right">
             <p className="text-xl leading-relaxed">אנו ב-Aivan רואים חשיבות עליונה במתן שירות שוויוני ונגיש לכלל המשתמשים, לרבות אנשים עם מוגבלויות.</p>
             <div>
                <h4 className="font-bold text-lg mb-2 text-gray-900">התאמות הנגישות באתר</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>האתר מותאם לקוראי מסך ולניווט באמצעות מקלדת.</li>
                  <li>קיימת אפשרות להגדלת טקסט ושינוי ניגודיות בתפריט ההגדרות.</li>
                  <li>התכנים באתר כתובים בשפה ברורה ופשוטה.</li>
                  <li>האתר עומד בדרישות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג 2013.</li>
                  <li>האתר תואם את המלצות התקן הישראלי (ת"י 5568) לנגישות תכנים באינטרנט ברמת AA.</li>
                </ul>
             </div>
             <div>
                <h4 className="font-bold text-lg mb-2 text-gray-900">יצירת קשר</h4>
                <p>אם נתקלתם בקושי לגלוש באתר או שיש לכם הערה בנושא נגישות, אנא צרו עמנו קשר בכתובת support@aivan.ai ונטפל בפנייה בהקדם.</p>
             </div>
          </div>
        );
        break;
      case 'privacy':
        title = 'מדיניות פרטיות';
        content = (
          <div className="space-y-6 text-right">
             <p className="text-xl leading-relaxed">פרטיותכם חשובה לנו. מדיניות זו מסבירה כיצד אנו אוספים ומשתמשים במידע שלכם.</p>
             <div>
                <h4 className="font-bold text-lg mb-2 text-gray-900">איסוף מידע</h4>
                <p className="text-gray-700">אנו אוספים מידע שאתם מספקים לנו באופן פעיל (כגון שם ואימייל) ומידע טכני הנאסף אוטומטית בעת השימוש באתר (Local Storage).</p>
             </div>
             <div>
                <h4 className="font-bold text-lg mb-2 text-gray-900">שימוש במידע</h4>
                <p className="text-gray-700">המידע משמש לאספקת השירות, שיפור חווית המשתמש, ואבטחת החשבון. איננו מוכרים את המידע שלכם לצדדים שלישיים, ואיננו עושים בו שימוש למטרות פרסום ללא הסכמתכם.</p>
             </div>
          </div>
        );
        break;
      case 'terms':
        title = 'תנאי שימוש';
        content = (
          <div className="space-y-6 text-right">
             <p className="text-xl leading-relaxed">השימוש ב-Aivan כפוף לתנאים אלו. אנא קראו אותם בעיון לפני השימוש בשירות.</p>
             <div>
                <h4 className="font-bold text-lg mb-2 text-gray-900">שימוש מותר</h4>
                <p className="text-gray-700">השירות נועד לשימוש אישי ועסקי הוגן. אין לבצע שימוש לרעה, להפיץ ספאם, לנסות לפרוץ למערכת או לבצע כל פעולה העלולה לפגוע בתקינות השירות או במשתמשים אחרים.</p>
             </div>
             <div>
                <h4 className="font-bold text-lg mb-2 text-gray-900">אחריות</h4>
                <p className="text-gray-700">השירות מסופק "כפי שהוא" (As Is). Aivan עושה מאמצים רבים להבטיח את דיוק התשובות, אך אינה אחראית לדיוק המוחלט של התוכן המופק על ידי הבינה המלאכותית.</p>
             </div>
          </div>
        );
        break;
       case 'about':
        title = 'אודות Aivan';
        content = (
          <div className="space-y-6 text-right">
             <p className="text-xl leading-relaxed text-gray-800">Aivan הוא עוזר אישי חכם המשלב את כוחה של הבינה המלאכותית כדי לשנות את הדרך בה אתם מתכננים, יוצרים ולומדים.</p>
             <p className="text-lg text-gray-700">המשימה שלנו היא להפוך את המידע הדיגיטלי לנגיש, מהיר, חכם ואנושי יותר עבור כולם. אנו מאמינים שטכנולוגיה צריכה לשרת את האדם ולפנות לו זמן לדברים החשובים באמת.</p>
             <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mt-8">
                <h4 className="font-bold text-blue-900 mb-2">החזון שלנו</h4>
                <p className="text-blue-800">עולם שבו תכנון וניהול מידע הם לא מטלה, אלא חוויה חכמה שמותאמת אישית לכם.</p>
             </div>
          </div>
        );
        break;
    }

    return (
      <div className="fixed inset-0 bg-white z-[100] overflow-y-auto flex flex-col animate-fadeIn">
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center gap-4 z-10 shadow-sm">
             <button onClick={() => setLegalDoc(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
                <ArrowRight size={24} className="text-gray-600 group-hover:text-gray-900" />
             </button>
             <h2 className="text-2xl font-medium text-gray-800 google-sans">{title}</h2>
        </div>
        <div className="flex-1 w-full max-w-4xl mx-auto p-8 sm:p-12">
            {content}
        </div>
        <div className="border-t border-gray-100 p-8 text-center text-gray-400 text-sm mt-auto bg-gray-50">
           © 2026 Aivan AI. כל הזכויות שמורות.
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#1f1f1f] font-sans flex flex-col overflow-x-hidden" dir="rtl">
      {renderLegalContent()}

      {/* Header with Auth Buttons restored */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
           <div className="flex items-center gap-2 select-none cursor-default">
               <span className="text-2xl font-bold bg-gradient-to-tr from-blue-600 to-pink-500 bg-clip-text text-transparent google-sans">Aivan</span>
           </div>
           <div className="flex items-center gap-3">
               <button onClick={onSignIn} className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 transition-colors">התחברות</button>
               <button onClick={onSignUp} className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-colors shadow-sm">הרשמה</button>
           </div>
      </nav>

      {/* Main Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center pt-28 px-4 relative pb-20 w-full max-w-full overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200 rounded-full blur-[120px] opacity-20 -z-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200 rounded-full blur-[120px] opacity-20 -z-10"></div>

        <div className="mb-6 relative group cursor-default">
           <span className="text-8xl font-bold bg-gradient-to-tr from-blue-600 to-pink-500 bg-clip-text text-transparent google-sans select-none block">A</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-medium text-center tracking-tight mb-4 google-sans bg-clip-text text-transparent bg-gradient-to-r from-[#4285f4] via-[#9b72cb] to-[#d96570] pb-2">
          שלום, אני Aivan
        </h1>
        
        <p className="text-xl md:text-2xl text-[#444746] text-center max-w-2xl mb-12 leading-relaxed">
          דגם הבינה המלאכותית המתקדם והיכול ביותר שלנו עד כה.
          <br/>
          מוכן לעזור לך ליצור, לתכנן ולבצע כל משימה.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mb-8">
           <button onClick={onSignUp} className="flex-1 flex items-center justify-between bg-white border border-[#e3e3e3] hover:bg-[#f8fafd] hover:shadow-md hover:border-[#d3d3d3] text-right p-4 rounded-2xl transition-all group">
             <div>
               <span className="block font-medium text-lg text-[#1f1f1f]">צור חשבון</span>
               <span className="text-sm text-[#5e5e5e]">התחל שיחה חדשה</span>
             </div>
             <div className="bg-[#f0f4f9] rounded-full p-2 group-hover:bg-white transition-colors">
               <ArrowLeft className="w-5 h-5 text-[#1f1f1f]" />
             </div>
           </button>
           <button onClick={onSignIn} className="flex-1 flex items-center justify-between bg-white border border-[#e3e3e3] hover:bg-[#f8fafd] hover:shadow-md hover:border-[#d3d3d3] text-right p-4 rounded-2xl transition-all group">
             <div>
               <span className="block font-medium text-lg text-[#1f1f1f]">התחבר</span>
               <span className="text-sm text-[#5e5e5e]">המשך מהיכן שהפסקת</span>
             </div>
             <div className="bg-[#f0f4f9] rounded-full p-2 group-hover:bg-white transition-colors">
               <ArrowLeft className="w-5 h-5 text-[#1f1f1f]" />
             </div>
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-6">
           <div onMouseEnter={() => handleHoverStart('write')} onMouseLeave={handleHoverEnd} onClick={() => handleCardClick('write')} className={`p-6 rounded-3xl h-40 flex flex-col justify-between transition-all cursor-pointer border border-transparent bg-[#f0f4f9] hover:bg-[#e7f0fe] hover:shadow-sm ${activeDemo === 'write' ? 'ring-2 ring-blue-100 bg-[#e7f0fe]' : ''}`}>
              <span className="text-lg font-medium">עזור לי לכתוב</span>
              <div className="flex justify-between items-end">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"><span className="text-xl">✍️</span></div>
                {activeDemo === 'write' && <ChevronDown size={20} className="text-blue-500" />}
              </div>
           </div>
           <div onMouseEnter={() => handleHoverStart('travel')} onMouseLeave={handleHoverEnd} onClick={() => handleCardClick('travel')} className={`p-6 rounded-3xl h-40 flex flex-col justify-between transition-all cursor-pointer border border-transparent bg-[#f0f4f9] hover:bg-[#e7f0fe] hover:shadow-sm ${activeDemo === 'travel' ? 'ring-2 ring-blue-100 bg-[#e7f0fe]' : ''}`}>
              <span className="text-lg font-medium">תכנן טיול</span>
              <div className="flex justify-between items-end">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"><span className="text-xl">✈️</span></div>
                {activeDemo === 'travel' && <ChevronDown size={20} className="text-blue-500" />}
              </div>
           </div>
           <div onMouseEnter={() => handleHoverStart('learn')} onMouseLeave={handleHoverEnd} onClick={() => handleCardClick('learn')} className={`p-6 rounded-3xl h-40 flex flex-col justify-between transition-all cursor-pointer border border-transparent bg-[#f0f4f9] hover:bg-[#e7f0fe] hover:shadow-sm ${activeDemo === 'learn' ? 'ring-2 ring-blue-100 bg-[#e7f0fe]' : ''}`}>
              <span className="text-lg font-medium">למד משהו חדש</span>
              <div className="flex justify-between items-end">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"><span className="text-xl">💡</span></div>
                {activeDemo === 'learn' && <ChevronDown size={20} className="text-blue-500" />}
              </div>
           </div>
        </div>

        <div ref={demoRef} className="w-full max-w-5xl mt-32 mb-10 transition-all duration-700">
          <div className="flex flex-col md:flex-row h-[450px]">
              <div className={`p-8 md:w-1/3 flex flex-col justify-center relative transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                  <h3 className="text-3xl font-bold text-gray-800 mb-6">{DEMO_SCENARIOS[activeDemo].title}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{DEMO_SCENARIOS[activeDemo].description}</p>
              </div>
              <div className="p-6 md:w-2/3 relative flex flex-col">
                  <div className="flex-1 rounded-3xl p-6 flex flex-col relative overflow-hidden bg-white/60 backdrop-blur-sm border border-white shadow-xl ring-1 ring-gray-100/50">
                      <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                          <div className="flex gap-4 items-start">
                              <ALogoIcon />
                              <div className="bg-white p-4 rounded-2xl rounded-tr-none shadow-sm text-gray-700 leading-relaxed border border-gray-100">שלום! איך אני יכול לעזור לך היום?</div>
                          </div>
                          <div className={`space-y-6 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                              {(demoStep >= 4) && (
                                  <div className="flex gap-4 items-start flex-row-reverse animate-fadeIn">
                                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm"><User size={20} /></div>
                                      <div className="bg-[#e7f0fe] p-4 rounded-2xl rounded-tl-none text-gray-800 leading-relaxed">{DEMO_SCENARIOS[activeDemo].prompt}</div>
                                  </div>
                              )}
                              {(demoStep === 4) && (
                                <div className="flex gap-4 items-start animate-fadeIn">
                                      <ALogoIcon />
                                      <div className="bg-white p-4 rounded-2xl rounded-tr-none shadow-sm border border-gray-100">
                                        <div className="flex gap-1">
                                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                        </div>
                                      </div>
                                  </div>
                              )}
                              {(demoStep === 5) && (
                                  <div className="flex gap-4 items-start animate-fadeIn">
                                      <ALogoIcon />
                                      <div className="bg-white p-4 rounded-2xl rounded-tr-none shadow-sm text-gray-700 whitespace-pre-line leading-relaxed border border-gray-100">{DEMO_SCENARIOS[activeDemo].response}</div>
                                  </div>
                              )}
                          </div>
                      </div>
                      <div className="mt-6 relative">
                          <div className="bg-white border border-gray-200 rounded-full px-5 py-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                              <input disabled value={typedText} className={`flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`} placeholder="הקלד הודעה..." />
                              <div className={`p-2 rounded-full transition-colors relative ${demoStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                  {demoStep === 3 && <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>}
                                  <Send size={18} className="relative z-10" />
                              </div>
                          </div>
                          <div className="absolute w-6 h-6 rounded-full bg-blue-600/80 border-2 border-white shadow-md pointer-events-none transition-all duration-700 ease-out z-50 transform -translate-x-1/2 -translate-y-1/2" style={{ top: '50%', left: demoStep <= 1 ? '85%' : '38px', opacity: (demoStep >= 1 && demoStep <= 3) ? 1 : 0 }}></div>
                      </div>
                  </div>
                  <div className="text-center mt-4"><span className="text-xs text-gray-400/80 font-medium">ההדגמה להמחשה בלבד</span></div>
              </div>
          </div>
        </div>
      </main>
      
      {showCookieConsent && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-6 z-[200] animate-fadeIn">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0"><Cookie size={24} /></div>
                  <div className="text-right">
                     <h4 className="font-bold text-gray-900 mb-1">הגדרות פרטיות וקבצים</h4>
                     <p className="text-sm text-gray-600 leading-relaxed">אתר זה משתמש בטכנולוגיית אחסון מקומי (Local Storage) כדי לשמור את העדפות ההתחברות והיסטוריית השיחות שלך על המכשיר. המידע אינו משותף עם צדדים שלישיים לצרכי פרסום. השימוש באתר מהווה הסכמה לכך.</p>
                  </div>
               </div>
               <div className="flex gap-3 shrink-0">
                   <button onClick={() => setLegalDoc('privacy')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">קרא עוד</button>
                   <button onClick={acceptCookies} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">אני מסכים</button>
               </div>
            </div>
          </div>
      )}
      
      <footer className="w-full py-6 text-center text-xs text-[#5e5e5e] bg-white mt-auto border-t border-gray-100">
        {/* Links Row - Moved to Footer as requested */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-4 text-sm font-medium text-gray-500">
             <button onClick={() => setLegalDoc('accessibility')} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                 <Accessibility size={16} />
                 הצהרת נגישות
             </button>
             <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
             <button onClick={() => setLegalDoc('terms')} className="hover:text-blue-600 transition-colors">תנאי שימוש</button>
             <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
             <button onClick={() => setLegalDoc('privacy')} className="hover:text-blue-600 transition-colors">מדיניות פרטיות</button>
             <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
             <button onClick={() => setLegalDoc('about')} className="hover:text-blue-600 transition-colors">אודות</button>
        </div>

        <div className="flex flex-col items-center gap-2">
            <p>Aivan עלול להציג מידע לא מדויק, כולל לגבי אנשים, אז כדאי לבדוק את התשובות שלו.</p>
            <p className="text-gray-400">© 2026 Aivan AI. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
