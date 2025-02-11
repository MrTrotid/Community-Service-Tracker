import { useState, useEffect, FC } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  name: string;
  email: string;
  photoURL?: string;
  class: string;
  rollNumber: string;
  location: string;
  joinedDate: string;
  totalHours: number;
  requiredHours: number;
}

const getSection = (email: string): string => {
  if (!email) return 'N/A';
  const sectionNumber = email.charAt(4); // Changed from 3 to 4 for 5th character
  if (!sectionNumber) return 'N/A';
  
  const sectionMap: { [key: string]: string } = {
    '1': 'A',
    '2': 'B',
    '3': 'C',
    '4': 'D',
    '5': 'E',
    '6': 'F'
  };

  return sectionMap[sectionNumber] || 'N/A';
};

export const Profile: FC = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        const userRef = doc(db, 'students', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            name: data.name || currentUser.displayName || '',
            email: data.email || currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            class: data.class || 'Not Set',
            rollNumber: data.rollNumber || 'Not Set',
            location: data.location || 'Not Set',
            joinedDate: data.createdAt || '',
            totalHours: data.totalHours || 0,
            requiredHours: data.requiredHours || 50
          });
        } else {
          console.error('User document does not exist in Firestore');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
      setLoading(false);
    };

    fetchUserData();
  }, [currentUser]);

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="animate-pulse">Loading profile...</div>
    </div>
  );

  if (!userData) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      User data not found
    </div>
  );

  const section = getSection(userData.email);

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Profile Header with Background */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <div className="flex flex-col items-center">
              {userData.photoURL ? (
                <img
                  src={userData.photoURL}
                  alt={userData.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-blue-600 border-4 border-white shadow-lg">
                  {userData.name.charAt(0)}
                </div>
              )}
              <h1 className="mt-4 text-2xl font-bold text-white">{userData.name}</h1>
              <p className="text-blue-100">{userData.email}</p>
            </div>
          </div>

          {/* Academic Details */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Class</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">{userData.class}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Section</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">{section}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Roll Number</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">{userData.rollNumber}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">{userData.location}</p>
              </div>
            </div>

            {/* Service Hours Progress */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Service Hours Progress</h3>
              <div className="mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">{userData.totalHours} / {userData.requiredHours} hours</span>
                  <span className="text-sm font-medium text-blue-600">
                    {Math.round((userData.totalHours / userData.requiredHours) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (userData.totalHours / userData.requiredHours) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              Member since {new Date(userData.joinedDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
