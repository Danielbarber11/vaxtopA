
import React, { useState, useEffect } from 'react';
import { ViewState, AuthMode, User } from './types';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import GmailLayout from './components/GmailLayout';
import { storageService } from './services/storageService';
import { Smartphone, Monitor } from 'lucide-react';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('landing');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Global Settings Loader
  useEffect(() => {
    // 1. Theme
    const savedTheme = localStorage.getItem('AIVAN_THEME');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Language / Direction
    const savedLang = localStorage.getItem('AIVAN_LANG');
    if (savedLang === 'en') {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = 'en';
    } else {
        document.documentElement.dir = 'rtl'; // default
        document.documentElement.lang = 'he';
    }

    // 3. Accessibility - Text Size
    const savedSize = localStorage.getItem('AIVAN_TEXT_SIZE');
    if (savedSize) document.documentElement.style.fontSize = `${savedSize}%`;

    // 4. Accessibility - Contrast
    const savedContrast = localStorage.getItem('AIVAN_CONTRAST') === 'true';
    document.body.style.filter = savedContrast ? 'contrast(1.25) saturate(1.2)' : 'none';

    // 5. Accessibility - Motion
    const savedMotion = localStorage.getItem('AIVAN_REDUCED_MOTION') === 'true';
    const styleId = 'aivan-reduced-motion-style';
    if (savedMotion && !document.getElementById(styleId)) {
        const styleTag = document.createElement('style');
        styleTag.id = styleId;
        styleTag.innerHTML = `*, *::before, *::after { transition-duration: 0.01s !important; animation-duration: 0.01s !important; scroll-behavior: auto !important; }`;
        document.head.appendChild(styleTag);
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const initSession = async () => {
      const session = storageService.getSession();
      if (session) {
        // בדיקה האם הפרופיל באמת קיים ומלא ב-Firebase
        const isComplete = await storageService.isProfileComplete(session.email);
        if (isComplete) {
          setCurrentUser({ email: session.email, name: session.name });
          setViewState('app');
        } else {
          // אם הסשן קיים אך השם חסר - נשלח אותו להשלמת פרטים
          setAuthMode('signup'); // נשתמש בטופס הרישום להשלמה
          setViewState('auth');
        }
      }
      setIsCheckingSession(false);
    };

    initSession();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAuthSuccess = (email: string, name: string) => {
    setCurrentUser({
      email,
      name: name || email.split('@')[0]
    });
    setViewState('app');
  };

  const handleLogout = () => {
    storageService.clearSession();
    setCurrentUser(null);
    setViewState('landing');
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center" dir="rtl">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
          <Smartphone size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">לא זמין במכשירך</h1>
        <p className="text-gray-600 max-w-sm mb-8">
          Aivan בגרסת המחשב עדיין לא מותאם למובייל ולטאבלטים.
          <br/>
          אנא התחבר דרך מחשב שולחני או לפטופ לחוויה מלאה.
        </p>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
           <Monitor size={16} />
           <span>זמין בדפדפן במחשב</span>
        </div>
      </div>
    );
  }

  if (isCheckingSession) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <span className="text-4xl font-bold bg-gradient-to-tr from-blue-600 to-pink-500 bg-clip-text text-transparent google-sans animate-pulse">A</span>
    </div>;
  }

  switch (viewState) {
    case 'landing':
      return (
        <LandingPage 
          onSignIn={() => { setAuthMode('signin'); setViewState('auth'); }}
          onSignUp={() => { setAuthMode('signup'); setViewState('auth'); }}
        />
      );
    case 'auth':
      return (
        <AuthPage 
          mode={authMode} 
          onSwitchMode={setAuthMode}
          onSuccess={handleAuthSuccess}
        />
      );
    case 'app':
      return currentUser ? (
        <GmailLayout user={currentUser} onLogout={handleLogout} />
      ) : (
        <LandingPage 
          onSignIn={() => setViewState('auth')} 
          onSignUp={() => setViewState('auth')}
        />
      );
    default:
      return null;
  }
};

export default App;
