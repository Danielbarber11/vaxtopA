import React from 'react';
import { Star, Square, AlertCircle, Trash2 } from 'lucide-react';
import { Email } from '../types';

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (email: Email) => void;
  onToggleStar: (e: React.MouseEvent, id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

const EmailList: React.FC<EmailListProps> = ({ emails, selectedEmailId, onSelectEmail, onToggleStar, onDelete }) => {
  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <div className="bg-gray-100 p-8 rounded-full mb-4">
           <AlertCircle size={48} className="text-gray-300" />
        </div>
        <p className="text-lg">תיבת הדואר שלך ריקה</p>
        <p className="text-sm">הודעות שתקבל יופיעו כאן</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-20">
      {emails.map((email) => (
        <div 
          key={email.id}
          onClick={() => onSelectEmail(email)}
          className={`
            group flex items-center px-4 py-2.5 border-b border-gray-100 cursor-pointer transition-colors
            ${!email.isRead ? 'bg-white font-semibold' : 'bg-[#f8fafd]'} 
            ${selectedEmailId === email.id ? 'bg-blue-50 border-r-4 border-r-blue-600 pr-3' : 'hover:shadow-sm hover:z-10 hover:border-gray-200'}
          `}
        >
          {/* Controls */}
          <div className="flex items-center gap-3 min-w-[100px] text-gray-400">
             <button className="hover:text-gray-600" onClick={(e) => e.stopPropagation()}>
               <Square size={18} />
             </button>
             <button 
                onClick={(e) => onToggleStar(e, email.id)}
                className={`hover:text-gray-600 ${email.isStarred ? 'text-yellow-400 fill-current' : ''}`}
             >
               <Star size={18} />
             </button>
          </div>

          {/* Sender */}
          <div className={`w-48 truncate pl-4 text-[0.95rem] ${!email.isRead ? 'text-gray-900 font-bold' : 'text-gray-600 font-normal'}`}>
            {email.senderName}
          </div>

          {/* Content Preview */}
          <div className="flex-grow flex items-center min-w-0 pl-4">
            <span className={`truncate text-sm ${!email.isRead ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
              {email.subject}
            </span>
            <span className="mx-1 text-gray-400">-</span>
            <span className="truncate text-sm text-gray-500 flex-grow">
              {email.snippet}
            </span>
          </div>

          {/* Date & Hover Actions */}
          <div className="min-w-[80px] text-left flex justify-end flex-row-reverse">
            <span className="group-hover:hidden text-xs font-medium text-gray-500 font-bold">
               {email.date}
            </span>
            <div className="hidden group-hover:flex items-center gap-2">
               <button 
                  onClick={(e) => onDelete(e, email.id)}
                  className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors" 
                  title="מחק"
                >
                  <Trash2 size={16} />
               </button>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
};

export default EmailList;