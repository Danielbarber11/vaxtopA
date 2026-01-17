
// שירות לחיבור ל-Google Sheets של Aivan

/**
 * מדריך לחיבור הגיליון:
 * 1. בגיליון גוגל שלך, לחץ על 'הרחבות' (Extensions) > 'Apps Script'.
 * 2. הדבק את קוד השרת (doPost) שברשותך.
 * 3. לחץ 'Deploy' > 'New Deployment' > 'Web App'.
 * 4. הגדר 'Who has access' ל-'Anyone'.
 * 5. העתק את הכתובת שמתחילה ב-script.google.com והדבק אותה במשתנה למטה.
 */

// החלף את המחרוזת הזו בכתובת ה-Web App שקיבלת מה-Deployment
const GOOGLE_SCRIPT_URL = ""; 

/**
 * מסנכרן פעולות משתמש לגיליון גוגל
 */
export const syncToSheets = async (type: 'signup' | 'login' | 'save_chat', email: string, name?: string, payload?: any) => {
  const scriptUrl = GOOGLE_SCRIPT_URL as string;

  // אם הכתובת ריקה או שהיא עדיין כתובת של גיליון (לא סקריפט), אנחנו מדלגים בשקט
  if (!scriptUrl || scriptUrl === "" || scriptUrl.includes("docs.google.com/spreadsheets")) {
    // בגרסת הפיתוח נשאיר הערה ב-console, אך לא נפריע למשתמש
    if (scriptUrl.includes("docs.google.com/spreadsheets")) {
       console.warn("Aivan Sync: Please use the Web App URL from Apps Script Deployment, not the Spreadsheet URL.");
    }
    return;
  }

  try {
    // שליחת הנתונים בפורמט JSON
    // משתמשים ב-no-cors כדי לעקוף חסימות דפדפן (CORS) מול גוגל
    await fetch(scriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        type,
        email,
        name: name || "N/A",
        payload: payload ? JSON.stringify(payload) : "N/A"
      }),
    });
    
    console.log(`✅ Aivan Sync: Successfully sent ${type} event to Sheets.`);
  } catch (error) {
    console.error("❌ Aivan Sync Error:", error);
  }
};
