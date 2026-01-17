import React, { useState, useEffect } from 'react';
import { X, Minimize2, Maximize2, Trash2, Paperclip, Link, Smile, Image as ImageIcon, Lock, PenLine, Sparkles } from 'lucide-react';
import { generateReplySuggestion } from '../services/geminiService';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (to: string, subject: string, body: string) => void;
  initialSubject?: string;
  initialBody?: string;
}

const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose, onSend, initialSubject = '', initialBody = '' }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSubject(initialSubject);
      setBody(initialBody);
    }
  }, [isOpen, initialSubject, initialBody]);

  const handleSmartWrite = async () => {
    if (!subject && !body) return;
    setIsGenerating(true);
    try {
      const draft = await generateReplySuggestion(`נושא: ${subject}\nטיוטה: ${body}\n\nהרחב את זה לאימייל מלא בעברית.`);
      setBody(draft);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-0 left-10 z-50 bg-white shadow-2xl rounded-t-lg flex flex-col transition-all duration-200 ${isMaximized ? 'w-[80vw] h-[80vh] left-10' : 'w-[500px] h-[600px] ml-16'}`} dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#f2f6fc] rounded-t-lg border-b border-gray-200 cursor-pointer"
           onClick={() => !isMaximized && setIsMaximized(true)}>
        <span className="text-sm font-medium text-gray-700">הודעה חדשה</span>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-gray-200 rounded text-gray-600" onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }}>
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button className="p-1 hover:bg-gray-200 rounded text-gray-600" onClick={(e) => { e.stopPropagation(); onClose(); }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="flex flex-col flex-grow">
        <input 
          type="text" 
          placeholder="נמענים" 
          className="border-b border-gray-100 px-4 py-2 text-sm focus:outline-none"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="נושא" 
          className="border-b border-gray-100 px-4 py-2 text-sm focus:outline-none"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <div className="flex-grow relative">
           <textarea 
            className="w-full h-full resize-none p-4 text-sm focus:outline-none font-sans"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          {isGenerating && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <div className="flex items-center gap-2 bg-white shadow-md px-4 py-2 rounded-full border border-gray-100">
                <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-sm text-gray-600">Gemini כותב...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Toolbar */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onSend(to, subject, body)}
            className="bg-[#0b57d0] hover:bg-[#0b57d0] hover:shadow-md text-white px-5 py-2 rounded-full font-medium text-sm flex items-center gap-2 transition-all"
          >
            שלח
          </button>
          <button onClick={handleSmartWrite} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-blue-600 transition-colors" title="עזור לי לכתוב עם Gemini">
            <Sparkles size={18} />
          </button>
          <div className="h-6 w-px bg-gray-200 mx-1"></div>
          <div className="flex items-center gap-1 text-gray-600">
            <button className="p-2 hover:bg-gray-100 rounded text-gray-600"><span className="font-serif font-bold text-lg leading-none">A</span></button>
            <button className="p-2 hover:bg-gray-100 rounded text-gray-600"><Paperclip size={18} /></button>
            <button className="p-2 hover:bg-gray-100 rounded text-gray-600"><Link size={18} /></button>
            <button className="p-2 hover:bg-gray-100 rounded text-gray-600"><Smile size={18} /></button>
            <button className="p-2 hover:bg-gray-100 rounded text-gray-600"><ImageIcon size={18} /></button>
            <button className="p-2 hover:bg-gray-100 rounded text-gray-600"><Lock size={18} /></button>
            <button className="p-2 hover:bg-gray-100 rounded text-gray-600"><PenLine size={18} /></button>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded text-gray-500">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default ComposeModal;