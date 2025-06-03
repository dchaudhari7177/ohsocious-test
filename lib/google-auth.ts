import { auth, db } from "@/lib/firebase"
import { GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"

const provider = new GoogleAuthProvider()

interface AuthResult {
  user: any
  isNewUser: boolean
  error?: string
}

export async function signInWithGoogle(isSignUp = false): Promise<AuthResult> {
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    const email = user.email

    // Validate .edu email
    if (!email || !email.toLowerCase().endsWith('.edu')) {
      throw new Error('Only college email addresses (.edu) are allowed')
    }

    // Check if email exists
    const signInMethods = await fetchSignInMethodsForEmail(auth, email)
    const userExists = signInMethods.length > 0

    // Handle signup vs login scenarios
    if (isSignUp && userExists) {
      throw new Error('An account with this email already exists. Please sign in instead.')
    }

    if (!isSignUp && !userExists) {
      throw new Error('No account found with this email. Please sign up first.')
    }

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid))
    const isNewUser = !userDoc.exists()
    
    if (isNewUser) {
      // Create new user document
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        emailVerified: true, // Google OAuth emails are pre-verified
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      })
    } else {
      // Update last login time
      await setDoc(doc(db, "users", user.uid), {
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    }

    return { user, isNewUser }
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      return { user: null, isNewUser: false, error: 'Sign-in cancelled' }
    }
    
    if (error.code === 'auth/account-exists-with-different-credential') {
      return { 
        user: null, 
        isNewUser: false, 
        error: 'An account already exists with a different sign-in method. Please use your original sign-in method.' 
      }
    }

    return { user: null, isNewUser: false, error: error.message }
  }
} 