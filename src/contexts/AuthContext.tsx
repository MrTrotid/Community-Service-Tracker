import { createContext, useContext, useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const ALLOWED_DOMAIN = 'sxc.edu.np';

const ADMIN_EMAILS = [
  'commandant@sxc.edu.np',
  'admin@sxc.edu.np',
  'bamanguragain@gmail.com'
];

const validateEmail = (email: string) => {
  // Allow admin emails to bypass domain check
  if (ADMIN_EMAILS.includes(email)) {
    return true;
  }
  return email.endsWith(`@${ALLOWED_DOMAIN}`);
};

const checkIfAdmin = (email: string) => {
  return ADMIN_EMAILS.includes(email);
};

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isFirstTimeUser: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const extractRollNumber = (email: string) => {
  return email.split('@')[0];
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  const createUserDocument = async (user: User) => {
    const userRef = doc(db, 'students', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const rollNumber = extractRollNumber(user.email || '');
      const isAdminUser = checkIfAdmin(user.email || '');
      
      await setDoc(userRef, {
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        totalHours: 0,
        requiredHours: 50,
        rollNumber: isAdminUser ? 'ADMIN' : rollNumber,
        bio: '',
        location: '',
        class: isAdminUser ? 'ADMIN' : '',
        studentId: user.uid,
        isAdmin: isAdminUser,
        hasCompletedSetup: false
      });
    }
  };

  const updateRequiredHours = async (userId: string) => {
    const userRef = doc(db, 'students', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.requiredHours !== 50) {
        await setDoc(userRef, {
          ...userData,
          requiredHours: 50
        }, { merge: true });
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsAdmin(checkIfAdmin(user.email || ''));
        const userDoc = await getDoc(doc(db, 'students', user.uid));
        // Only set as first time user if the document doesn't exist or hasCompletedSetup is false
        setIsFirstTimeUser(!userDoc.exists() || userDoc.data()?.hasCompletedSetup === false);
        await createUserDocument(user);
        await updateRequiredHours(user.uid);
      } else {
        setIsAdmin(false);
        setIsFirstTimeUser(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Remove domain hint for better compatibility with admin email
    try {
      const result = await signInWithPopup(auth, provider);
      
      if (!validateEmail(result.user.email || '')) {
        await firebaseSignOut(auth);
        alert('Please use your St. Xavier\'s College email address to sign in.');
        return;
      }

      await createUserDocument(result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      alert('Sign in failed. Please try again.');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value: AuthContextType = {
    currentUser,
    isAdmin,
    loading,
    signInWithGoogle,
    signOut,
    isFirstTimeUser
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
