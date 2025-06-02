import { initializeApp, getApps } from "firebase/app"
import { getAuth, setPersistence, browserLocalPersistence, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"
import { getStorage, FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyC0dMgHPLRDli459w4nnh9EtWx_VHQVCE8",
  authDomain: "ohsocious-mern.firebaseapp.com",
  projectId: "ohsocious-mern",
  storageBucket: "ohsocious-mern.firebasestorage.app",
  messagingSenderId: "561342181982",
  appId: "1:561342181982:web:073c9387c177cb94433acf",
  measurementId: "G-QS7PNJ4RCK"
}

// Initialize Firebase
let app
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

try {
  // Initialize or get existing app
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  
  // Initialize services
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  
  // Set persistence (only in browser)
  if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error("Error setting auth persistence:", error)
      })
  }
} catch (error) {
  console.error("Error initializing Firebase:", error)
  throw error
}

export { auth, db, storage } 