
export interface Email {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash';
  avatarColor?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  date: string;
  isPinned?: boolean;
  deletedAt?: string | null; // שדה חדש לניהול מחיקה (תאריך מחיקה או null)
}

export interface User {
  email: string;
  name: string;
}

export type ViewState = 'landing' | 'auth' | 'app';

export type AuthMode = 'signin' | 'signup';

export enum FolderType {
  Inbox = 'inbox',
  Starred = 'starred',
  Snoozed = 'snoozed',
  Sent = 'sent',
  Drafts = 'drafts',
}
