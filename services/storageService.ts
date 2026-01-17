
import { ChatSession, User } from '../types';
import { db, doc, setDoc, getDoc, getDocs, collection, query, where, orderBy, deleteDoc, onSnapshot, writeBatch } from './firebaseService';

const SESSION_KEY = 'AIVAN_SESSION';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

interface StoredUser extends User {
  password?: string;
  termsAccepted?: boolean;
}

export const storageService = {
  async userExists(email: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, "users", email));
      return userDoc.exists();
    } catch (e) {
      console.error("Firebase Check Error:", e);
      return false;
    }
  },

  async isProfileComplete(email: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, "users", email));
      if (!userDoc.exists()) return false;
      const data = userDoc.data() as StoredUser;
      return !!(data.name && data.name.trim().length > 1);
    } catch (e) {
      return false;
    }
  },

  async authenticate(
    mode: 'signin' | 'signup', 
    email: string, 
    password?: string,
    name?: string
  ): Promise<{ success: boolean; message?: string; name?: string }> {
    
    try {
      if (mode === 'signup') {
        const userRef = doc(db, "users", email);
        const userSnap = await getDoc(userRef);
        
        const newUser: StoredUser = {
          email,
          name: name || email.split('@')[0],
          password: password || (userSnap.exists() ? (userSnap.data() as StoredUser).password : ''),
          termsAccepted: true
        };

        await setDoc(userRef, newUser, { merge: true });
        this.createSession(newUser.email, newUser.name);
        
        return { success: true, name: newUser.name };
      } 

      if (mode === 'signin') {
        const userSnap = await getDoc(doc(db, "users", email));
        if (!userSnap.exists()) {
          return { success: false, message: 'משתמש לא נמצא. אנא הירשם תחילה.' };
        }
        const user = userSnap.data() as StoredUser;
        if (user.password !== password) {
          return { success: false, message: 'סיסמה שגויה.' };
        }
        
        if (!user.name || user.name.includes('@')) {
           return { success: false, message: 'PROFILE_INCOMPLETE', name: user.name };
        }

        this.createSession(user.email, user.name);
        
        return { success: true, name: user.name };
      }

      return { success: false, message: 'פעולה לא חוקית' };
    } catch (error) {
      console.error("Firebase Auth Error:", error);
      return { success: false, message: 'שגיאה בחיבור למסד הנתונים. ייתכן שהגדרות ה-Firebase שגויות.' };
    }
  },

  createSession(email: string, name: string) {
    const session = {
      email,
      name,
      lastActive: Date.now(),
      autoLoginEnabled: true 
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  getSession(): { email: string, name: string } | null {
    try {
      const sessionJson = localStorage.getItem(SESSION_KEY);
      if (!sessionJson) return null;
      const session = JSON.parse(sessionJson);
      if (!session.autoLoginEnabled) return null;
      if (Date.now() - session.lastActive > THIRTY_DAYS_MS) {
        localStorage.removeItem(SESSION_KEY); 
        return null;
      }
      return { email: session.email, name: session.name };
    } catch (e) {
      return null;
    }
  },

  clearSession() {
    localStorage.removeItem(SESSION_KEY);
  },

  async saveChat(userEmail: string, chat: ChatSession) {
    try {
      // Create a deep copy to avoid reference issues
      const chatToSave = JSON.parse(JSON.stringify(chat));
      const chatRef = doc(db, "users", userEmail, "chats", chat.id);
      await setDoc(chatRef, chatToSave, { merge: true });
    } catch (error) {
      console.error("Failed to save chat to Firebase", error);
    }
  },

  // Soft Delete: Move to Trash
  async moveToTrash(userEmail: string, chatId: string, chatData: ChatSession) {
      try {
          const chatRef = doc(db, "users", userEmail, "chats", chatId);
          await setDoc(chatRef, { ...chatData, deletedAt: new Date().toISOString() }, { merge: true });
          return true;
      } catch (error) {
          console.error("Failed to move chat to trash", error);
          return false;
      }
  },

  // Restore from Trash
  async restoreChat(userEmail: string, chatId: string, chatData: ChatSession) {
      try {
          const chatRef = doc(db, "users", userEmail, "chats", chatId);
          await setDoc(chatRef, { ...chatData, deletedAt: null }, { merge: true });
          return true;
      } catch (error) {
          console.error("Failed to restore chat", error);
          return false;
      }
  },

  // Hard Delete: Permanently remove
  async permanentlyDeleteChat(userEmail: string, chatId: string) {
    try {
      await deleteDoc(doc(db, "users", userEmail, "chats", chatId));
      return true;
    } catch (error) {
        console.error("Failed to permanently delete chat", error);
        return false;
    }
  },

  // Empty Trash (שימוש ב-WriteBatch למחיקה מרוכזת ואמינה)
  async emptyTrash(userEmail: string, trashedChats: ChatSession[]) {
      if (!trashedChats || trashedChats.length === 0) return true;

      try {
          console.log(`Attempting to empty trash for ${trashedChats.length} chats...`);
          // Firestore מאפשר רק 500 פעולות ב-Batch אחד
          // לכן נפצל לקבוצות של 450 ליתר ביטחון
          const chunkSize = 450;
          for (let i = 0; i < trashedChats.length; i += chunkSize) {
              const chunk = trashedChats.slice(i, i + chunkSize);
              const batch = writeBatch(db);
              
              chunk.forEach(chat => {
                  const ref = doc(db, "users", userEmail, "chats", chat.id);
                  batch.delete(ref);
              });
              
              await batch.commit();
          }
          console.log('Trash emptied successfully');
          return true;
      } catch (error) {
          console.error("Failed to empty trash", error);
          return false;
      }
  },

  // בודק ומוחק שיחות שישבו בסל המיחזור יותר מ-30 יום
  async cleanupOldTrash(userEmail: string, chats: ChatSession[]) {
      const now = new Date().getTime();
      const chatsToDelete = chats.filter(chat => {
          if (!chat.deletedAt) return false;
          const deletedTime = new Date(chat.deletedAt).getTime();
          return (now - deletedTime) > THIRTY_DAYS_MS;
      });

      if (chatsToDelete.length > 0) {
          console.log(`Cleaning up ${chatsToDelete.length} old chats from trash...`);
          // גם כאן נשתמש בפונקציית המחיקה המרוכזת
          await this.emptyTrash(userEmail, chatsToDelete);
      }
  },

  async exportUserData(userEmail: string): Promise<string> {
    const chats = await this.getChats(userEmail);
    const data = {
        userEmail,
        exportDate: new Date().toISOString(),
        chats
    };
    return JSON.stringify(data, null, 2);
  },

  async deleteUserAccount(userEmail: string): Promise<boolean> {
      try {
          // מחיקת כל הצ'אטים
          const chats = await this.getChats(userEmail);
          await this.emptyTrash(userEmail, chats);
          
          // מחיקת מסמך המשתמש
          await deleteDoc(doc(db, "users", userEmail));
          return true;
      } catch (e) {
          console.error("Failed to delete account", e);
          return false;
      }
  },

  // פונקציה ישנה לשליפה חד פעמית (עדיין בשימוש לייצוא)
  async getChats(userEmail: string): Promise<ChatSession[]> {
    try {
      const q = query(collection(db, "users", userEmail, "chats"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const chats: ChatSession[] = [];
      querySnapshot.forEach((doc) => {
        chats.push(doc.data() as ChatSession);
      });
      return chats;
    } catch (error) {
      console.error("Failed to fetch chats from Firebase", error);
      return [];
    }
  },

  // --- פונקציה חדשה: האזנה בזמן אמת לשיחות ---
  subscribeToChats(userEmail: string, onUpdate: (chats: ChatSession[]) => void): () => void {
    try {
        const q = query(collection(db, "users", userEmail, "chats"), orderBy("date", "desc"));
        
        // onSnapshot מאזין לשינויים בזמן אמת
        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const chats: ChatSession[] = [];
                snapshot.forEach((doc) => {
                    chats.push(doc.data() as ChatSession);
                });
                onUpdate(chats);
            },
            (error) => {
                // מונע קריסה של האפליקציה אם אין הרשאות או שגיאת התחברות
                console.warn("Firebase Snapshot Error (Listening disabled):", error.message);
                // במקרה של שגיאה, מחזירים מערך ריק כדי שה-UI ימשיך לעבוד
                onUpdate([]);
            }
        );
        
        return unsubscribe;
    } catch (e) {
        console.error("Error setting up chat subscription:", e);
        return () => {}; // מחזיר פונקציה ריקה למניעת שגיאות ב-useEffect
    }
  }
};
