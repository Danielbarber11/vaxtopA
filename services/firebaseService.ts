
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, deleteDoc, onSnapshot, writeBatch } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// הגדרות הפרויקט הספציפיות שלך (Firebase Config) שסופקו על ידך
const firebaseConfig = {
    apiKey: "AIzaSyBephs8or1F_TiasB0xedWfciLk0kDucwk",
    authDomain: "movies-904cf.firebaseapp.com",
    databaseURL: "https://movies-904cf-default-rtdb.firebaseio.com",
    projectId: "movies-904cf",
    storageBucket: "movies-904cf.firebasestorage.app",
    messagingSenderId: "589064390641",
    appId: "1:589064390641:web:65bbed1f9ea9fdf5f82650"
};

// אתחול האפליקציה והשירותים
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ייצוא פונקציות עזר של Firestore לשימוש ב-storageService
export { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, deleteDoc, onSnapshot, writeBatch };
