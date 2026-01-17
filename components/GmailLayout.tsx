
import React, { useState, useEffect, useRef } from 'react';
// Added RotateCcw to imports to fix missing name error
import { Menu, Search, Settings, HelpCircle, Grip, X, Star, AlertCircle, Send, Paperclip, MoreVertical, Trash2, Archive, ArrowLeft, ChevronLeft, ChevronRight, Pen, Inbox, Clock, File, Plus, Image as ImageIcon, Mic, RotateCcw } from 'lucide-react';
import { User, ChatSession, ChatMessage } from '../types';
import { chatWithGemini, Attachment } from '../services/geminiService';
import { storageService } from '../services/storageService';
import SettingsPage from './SettingsPage';

interface GmailLayoutProps {
  user: User;
  onLogout: () => void;
}

const GmailLayout: React.FC<GmailLayoutProps> = ({ user, onLogout }) => {
  // --- State ---
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Chat / Input State
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  useEffect(() => {
    // Subscribe to Firebase chats
    const unsubscribe = storageService.subscribeToChats(user.email, (updatedChats) => {
      setChats(updatedChats);
    });
    return () => unsubscribe();
  }, [user.email]);

  useEffect(() => {
    if (currentChatId) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [currentChatId, chats, isTyping]);

  // --- Handlers ---

  const handleCreateNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: 'שיחה חדשה',
      date: new Date().toLocaleDateString('he-IL'),
      messages: []
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    storageService.saveChat(user.email, newChat);
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (confirm('האם להעביר את השיחה לאשפה?')) {
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
            await storageService.moveToTrash(user.email, chatId, chat);
            if (currentChatId === chatId) setCurrentChatId(null);
        }
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && pendingAttachments.length === 0) || isTyping) return;
    
    setErrorMsg(null);
    const textToSend = input;
    const attachmentsToSend = [...pendingAttachments];
    
    // Clear input UI immediately
    setInput('');
    setPendingAttachments([]);
    setIsTyping(true);

    let targetChatId = currentChatId;
    let updatedChats = [...chats];
    let chatIndex = -1;

    // Create chat if doesn't exist
    if (!targetChatId) {
      const newChat: ChatSession = {
        id: Date.now().toString(),
        title: textToSend.substring(0, 30) || 'הודעה חדשה',
        date: new Date().toLocaleDateString('he-IL'),
        messages: []
      };
      updatedChats = [newChat, ...updatedChats];
      targetChatId = newChat.id;
      chatIndex = 0;
      setCurrentChatId(targetChatId);
    } else {
      chatIndex = updatedChats.findIndex(c => c.id === targetChatId);
    }

    if (chatIndex === -1) return;

    // Add User Message
    const userMsg: ChatMessage = {
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };
    updatedChats[chatIndex].messages.push(userMsg);
    
    // Update Title if it's the first message
    if (updatedChats[chatIndex].messages.length === 1) {
        updatedChats[chatIndex].title = textToSend.substring(0, 30);
    }

    setChats(updatedChats);

    try {
        // API Call
        const responseText = await chatWithGemini(
            updatedChats[chatIndex].messages.slice(0, -1),
            userMsg.text,
            attachmentsToSend
        );

        // Add Model Message
        const botMsg: ChatMessage = {
            role: 'model',
            text: responseText,
            timestamp: new Date().toISOString()
        };

        const finalChats = [...chats];
        const finalIndex = finalChats.findIndex(c => c.id === targetChatId);
        if (finalIndex !== -1) {
            finalChats[finalIndex].messages.push(botMsg);
            setChats(finalChats);
            storageService.saveChat(user.email, finalChats[finalIndex]);
        }
    } catch (err) {
        console.error("Connection Error:", err);
        setErrorMsg("שגיאת חיבור ל-Gemini. אנא בדוק את החיבור שלך ונסה שוב.");
        setIsTyping(false);
    } finally {
        setIsTyping(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                setPendingAttachments(prev => [...prev, {
                    type: file.type.startsWith('image') ? 'image' : 'file',
                    mimeType: file.type,
                    data: ev.target.result as string,
                    name: file.name
                }]);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  // --- Render Helpers ---

  const activeChats = chats.filter(c => !c.deletedAt).filter(c => 
     c.title.includes(searchQuery) || c.messages.some(m => m.text.includes(searchQuery))
  );

  const currentChat = chats.find(c => c.id === currentChatId);

  return (
    <div className="flex flex-col h-screen bg-[#F6F8FC] text-[#202124] font-sans overflow-hidden" dir="rtl">
      
      {/* --- GMAIL HEADER --- */}
      <header className="flex items-center justify-between px-4 py-2 bg-[#F6F8FC] shrink-0">
        <div className="flex items-center gap-3 w-60">
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 hover:bg-[#E1E5EA] rounded-full transition-colors">
             <Menu size={24} className="text-[#444746]" />
           </button>
           <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentChatId(null)}>
             <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r5.png" alt="Gmail" className="h-10 object-contain" />
           </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-3xl mx-4">
           <div className="relative group">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                 <Search size={20} className="text-[#444746]" />
              </div>
              <input 
                type="text" 
                placeholder="חיפוש בדואר" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#EAF1FB] text-[#1f1f1f] placeholder-[#444746] px-12 py-3 rounded-full border border-transparent focus:bg-white focus:shadow-md focus:border-transparent transition-all outline-none" 
              />
              <div className="absolute inset-y-0 left-3 flex items-center">
                 <button className="p-2 hover:bg-[#D3E3FD] rounded-full transition-colors"><Settings size={20} className="text-[#444746]" /></button>
              </div>
           </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 pl-2">
            <button className="p-2 hover:bg-[#E1E5EA] rounded-full text-[#444746]"><HelpCircle size={24} /></button>
            <button className="p-2 hover:bg-[#E1E5EA] rounded-full text-[#444746]"><Grip size={24} /></button>
            <div className="ml-2 relative group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-medium text-lg border-2 border-white shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                {/* Logout Dropdown (Simple) */}
                <div className="absolute top-10 left-0 bg-white shadow-lg rounded-lg py-2 w-48 hidden group-hover:block z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-bold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button onClick={onLogout} className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-50">התנתק</button>
                </div>
            </div>
        </div>
      </header>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* --- SIDEBAR --- */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-[#F6F8FC] flex flex-col transition-all duration-300`}>
           <div className="px-4 py-4">
               <button 
                 onClick={handleCreateNewChat}
                 className={`flex items-center gap-3 bg-[#C2E7FF] hover:shadow-md transition-shadow text-[#001D35] px-4 py-4 rounded-2xl ${isSidebarOpen ? 'w-40' : 'w-14 justify-center px-0'}`}
               >
                   <Pen size={24} />
                   {isSidebarOpen && <span className="font-medium">אימייל חדש</span>}
               </button>
           </div>
           
           <nav className="flex-1 overflow-y-auto px-2 space-y-1">
               <SidebarItem icon={Inbox} label="דואר נכנס" count={activeChats.length} active={!currentChatId} onClick={() => setCurrentChatId(null)} collapsed={!isSidebarOpen} />
               <SidebarItem icon={Star} label="מסומן בכוכב" collapsed={!isSidebarOpen} />
               <SidebarItem icon={Clock} label="בטיפול" collapsed={!isSidebarOpen} />
               <SidebarItem icon={Send} label="נשלח" collapsed={!isSidebarOpen} />
               <SidebarItem icon={File} label="טיוטות" collapsed={!isSidebarOpen} />
           </nav>
        </aside>

        {/* --- CONTENT AREA --- */}
        <main className="flex-1 bg-white rounded-tr-2xl m-2 mr-0 shadow-sm overflow-hidden border border-[#E7EAED] relative flex flex-col">
            
            {/* ERROR BANNER */}
            {errorMsg && (
                <div className="bg-red-50 text-red-700 px-4 py-2 text-sm flex items-center justify-between border-b border-red-100">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={16} />
                        <span>{errorMsg}</span>
                    </div>
                    <button onClick={() => setErrorMsg(null)}><X size={16} /></button>
                </div>
            )}

            {/* --- LIST VIEW (INBOX) --- */}
            {!currentChatId ? (
                <div className="flex flex-col h-full">
                    {/* Toolbar */}
                    <div className="h-12 flex items-center px-4 border-b border-[#E7EAED] gap-4 text-[#444746]">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                        <button className="hover:bg-gray-100 p-1 rounded"><RotateCcw size={18} /></button>
                        <button className="hover:bg-gray-100 p-1 rounded"><MoreVertical size={18} /></button>
                    </div>
                    
                    {/* Emails List */}
                    <div className="flex-1 overflow-y-auto">
                        {activeChats.length === 0 ? (
                             <div className="flex flex-col items-center justify-center h-full text-[#444746]">
                                 <div className="bg-gray-100 p-6 rounded-full mb-4"><Inbox size={48} className="opacity-20" /></div>
                                 <p className="text-lg">הכרטיסייה 'דואר נכנס' ריקה</p>
                             </div>
                        ) : (
                            activeChats.map(chat => {
                                const lastMsg = chat.messages[chat.messages.length - 1];
                                return (
                                    <div 
                                      key={chat.id} 
                                      onClick={() => setCurrentChatId(chat.id)}
                                      className="flex items-center px-4 py-2.5 border-b border-[#E7EAED] hover:shadow-md hover:z-10 bg-white cursor-pointer group transition-all"
                                    >
                                        <div className="flex items-center gap-3 w-12 shrink-0">
                                            <input type="checkbox" className="w-4 h-4 border-gray-300 rounded" onClick={(e) => e.stopPropagation()} />
                                            <Star size={18} className="text-gray-300 hover:text-yellow-400" onClick={(e) => e.stopPropagation()} />
                                        </div>
                                        <div className="w-48 font-semibold text-[#1f1f1f] truncate pl-4">
                                            {lastMsg?.role === 'model' ? 'Aivan AI' : 'אני'}
                                        </div>
                                        <div className="flex-1 flex items-center min-w-0">
                                            <span className="font-semibold text-[#1f1f1f] truncate">{chat.title}</span>
                                            <span className="mx-1 text-gray-400">-</span>
                                            <span className="text-[#444746] truncate text-sm">{lastMsg?.text.substring(0, 80) || '...'}</span>
                                        </div>
                                        <div className="w-24 text-right text-xs font-bold text-[#444746] group-hover:hidden">
                                            {chat.date}
                                        </div>
                                        <div className="hidden group-hover:flex items-center gap-2 justify-end w-24">
                                            <button onClick={(e) => handleDeleteChat(e, chat.id)} className="p-2 hover:bg-gray-100 rounded-full text-[#444746]"><Trash2 size={16} /></button>
                                            <button className="p-2 hover:bg-gray-100 rounded-full text-[#444746]"><Archive size={16} /></button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            ) : (
                /* --- CHAT VIEW (READING PANE) --- */
                <div className="flex flex-col h-full bg-white">
                    {/* Toolbar */}
                    <div className="h-12 flex items-center justify-between px-4 border-b border-[#E7EAED] text-[#444746]">
                         <div className="flex items-center gap-2">
                             <button onClick={() => setCurrentChatId(null)} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={18} /></button>
                             <button className="p-2 hover:bg-gray-100 rounded-full"><Archive size={18} /></button>
                             <button className="p-2 hover:bg-gray-100 rounded-full"><AlertCircle size={18} /></button>
                             <button onClick={(e) => handleDeleteChat(e, currentChatId)} className="p-2 hover:bg-gray-100 rounded-full"><Trash2 size={18} /></button>
                         </div>
                         <div className="flex items-center gap-2">
                             <span className="text-xs text-gray-500">1 מתוך {activeChats.length}</span>
                             <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16} /></button>
                             <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16} /></button>
                         </div>
                    </div>

                    {/* Thread Header */}
                    <div className="px-6 py-6 pb-2">
                         <div className="flex items-start justify-between mb-4">
                             <h2 className="text-2xl font-normal text-[#1f1f1f]">{currentChat?.title}</h2>
                             <div className="flex items-center gap-2">
                                 <div className="px-2 py-0.5 bg-[#E7EAED] rounded text-xs text-[#444746]">דואר נכנס</div>
                             </div>
                         </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-6">
                        {currentChat?.messages.map((msg, idx) => (
                            <div key={idx} className="flex gap-4 group">
                                <div className="shrink-0 mt-1">
                                    {msg.role === 'model' ? (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-red-500 flex items-center justify-center text-white font-bold shadow-sm">A</div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">{user.name.charAt(0)}</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[#1f1f1f] text-sm">{msg.role === 'model' ? 'Aivan AI' : user.name}</span>
                                            <span className="text-xs text-gray-500 text-left ltr">&lt;{msg.role === 'model' ? 'aivan@google.com' : user.email}&gt;</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>{new Date(msg.timestamp).toLocaleString('he-IL')}</span>
                                            <div className="hidden group-hover:flex items-center gap-2 text-gray-600">
                                                <button className="p-1 hover:bg-gray-100 rounded"><Star size={16} /></button>
                                                <button className="p-1 hover:bg-gray-100 rounded"><MoreVertical size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-[#1f1f1f] whitespace-pre-wrap leading-relaxed">
                                        {formatText(msg.text)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div></div>
                                <div className="text-sm text-gray-500 mt-2">Aivan מקליד...</div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reply Area (Bottom) */}
                    <div className="px-6 pb-6 pt-2">
                         <div className="flex gap-4 items-start">
                             <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shrink-0">{user.name.charAt(0)}</div>
                             <div className="flex-1 border border-gray-300 rounded-lg shadow-sm bg-white overflow-hidden focus-within:shadow-md transition-shadow">
                                 {pendingAttachments.length > 0 && (
                                     <div className="p-2 bg-gray-50 border-b border-gray-100 flex gap-2 overflow-x-auto">
                                         {pendingAttachments.map((att, i) => (
                                             <div key={i} className="relative group">
                                                 <img src={att.data} className="h-12 w-12 object-cover rounded border" alt="" />
                                                 <button onClick={() => setPendingAttachments(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={10} /></button>
                                             </div>
                                         ))}
                                     </div>
                                 )}
                                 <textarea 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="תגובה..."
                                    className="w-full p-4 min-h-[80px] outline-none text-sm resize-none"
                                 />
                                 <div className="flex items-center justify-between px-2 py-2 bg-[#F6F8FC] border-t border-[#E7EAED]">
                                     <div className="flex items-center gap-1">
                                         <button className="p-2 hover:bg-[#E1E5EA] rounded text-[#444746] font-bold">A</button>
                                         <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-[#E1E5EA] rounded text-[#444746]"><Paperclip size={18} /></button>
                                         <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                                         <button className="p-2 hover:bg-[#E1E5EA] rounded text-[#444746]"><ImageIcon size={18} /></button>
                                     </div>
                                     <button 
                                        onClick={handleSend}
                                        disabled={!input.trim() && pendingAttachments.length === 0}
                                        className={`px-6 py-2 rounded-full text-white text-sm font-medium transition-colors ${(!input.trim() && pendingAttachments.length === 0) ? 'bg-gray-300' : 'bg-[#0B57D0] hover:bg-[#0947AD]'}`}
                                     >
                                         שלח
                                     </button>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

// Helper components
const SidebarItem = ({ icon: Icon, label, count, active, onClick, collapsed }: any) => (
    <div 
      onClick={onClick}
      className={`flex items-center gap-4 px-6 py-1.5 rounded-r-full cursor-pointer transition-colors ${active ? 'bg-[#D3E3FD] text-[#001D35] font-bold' : 'text-[#444746] hover:bg-[#E1E5EA]'}`}
    >
        <Icon size={20} className={collapsed ? "mx-auto" : ""} />
        {!collapsed && (
            <>
                <span className="text-sm flex-1">{label}</span>
                {count > 0 && <span className="text-xs font-semibold">{count}</span>}
            </>
        )}
    </div>
);

// Simple formatter for chat text
const formatText = (text: string) => {
    // Basic bold formatting
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

export default GmailLayout;
