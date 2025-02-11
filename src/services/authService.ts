import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  browserPopupRedirectResolver
} from 'firebase/auth';
import { auth } from '../firebase';
import { createOrGetStudent } from './databaseService';

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create or get student profile
    if (user.email && user.displayName) {
      await createOrGetStudent(user.email, user.displayName, user.uid);
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    if (result.user.email && result.user.displayName) {
      await createOrGetStudent(result.user.email, result.user.displayName, result.user.uid);
    }
    return result;
  } catch (error) {
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export const updateUserProfile = async (name: string) => {
  try {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: name
      });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
