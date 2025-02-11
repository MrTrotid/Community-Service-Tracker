import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const locations = [
  { id: "godavari", name: "Godavari", description: "Perfect for south valley residents" },
  { id: "jawalakhel", name: "Jawalakhel", description: "Central Lalitpur location" },
  { id: "maitighar", name: "Maitighar", description: "Heart of Kathmandu" },
  { id: "lagankhel", name: "Lagankhel", description: "Easy access to Patan" },
  { id: "pulchowk", name: "Pulchowk", description: "Near Engineering Campus" },
  { id: "satdobato", name: "Satdobato", description: "South Lalitpur hub" }
];

const classes = [
  { id: "AS", name: "AS", description: "A-Level Science" },
  { id: "A2", name: "A2", description: "A2 Level" }
];

export const Options: FC = () => {
  const [selectedClass, setSelectedClass] = useState<'AS' | 'A2' | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<{
    class?: string;
    location?: string;
    hasCompletedSetup?: boolean;
  }>({});
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch current user settings
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'students', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCurrentSettings({
            class: data.class,
            location: data.location,
            hasCompletedSetup: data.hasCompletedSetup
          });
          setSelectedClass(data.class as 'AS' | 'A2');
          setSelectedLocation(data.location);
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
      }
    };
    fetchUserSettings();
  }, [currentUser]);

  const handleSubmit = async () => {
    if (!selectedClass || !selectedLocation || !currentUser) return;

    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'students', currentUser.uid);
      await updateDoc(userRef, {
        class: selectedClass,
        location: selectedLocation,
        hasCompletedSetup: true,
        updatedAt: new Date().toISOString()
      });
      
      console.log('User preferences updated:', { class: selectedClass, location: selectedLocation });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating user preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4"
      >
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            {currentSettings.hasCompletedSetup 
              ? 'Update Your Preferences'
              : 'Welcome to St. Xaviers College'
            }
          </motion.h1>
          <p className="text-lg text-gray-600">
            {currentSettings.hasCompletedSetup
              ? 'You can update your class and preferred location here'
              : "Let's get you set up with your community service preferences"
            }
          </p>
          {currentSettings.hasCompletedSetup && (
            <p className="mt-2 text-sm text-gray-500">
              Current settings: {currentSettings.class} - {currentSettings.location}
            </p>
          )}
        </div>

        <div className="space-y-12 bg-white rounded-2xl shadow-xl p-8">
          <section>
            <h2 className="text-2xl font-semibold mb-6">Choose Your Class</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {classes.map((classOption) => (
                <motion.button
                  key={classOption.id}
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedClass(classOption.id as 'AS' | 'A2')}
                  className={`p-6 rounded-xl border-2 text-left transition-colors ${
                    selectedClass === classOption.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <h3 className="text-xl font-medium mb-2">{classOption.name}</h3>
                  <p className="text-gray-600">{classOption.description}</p>
                </motion.button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">Select Your Preferred Location</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {locations.map((location) => (
                <motion.button
                  key={location.id}
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedLocation(location.name)}
                  className={`p-6 rounded-xl border-2 text-left transition-colors ${
                    selectedLocation === location.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <h3 className="text-xl font-medium mb-2">{location.name}</h3>
                  <p className="text-gray-600">{location.description}</p>
                </motion.button>
              ))}
            </div>
          </section>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!selectedClass || !selectedLocation || isSubmitting}
            className={`w-full py-4 rounded-xl text-lg font-medium transition-all
              ${(!selectedClass || !selectedLocation) 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'}
              ${isSubmitting ? 'animate-pulse' : ''}`}
          >
            {isSubmitting 
              ? 'Saving changes...' 
              : currentSettings.hasCompletedSetup
                ? 'Update Preferences'
                : 'Start Your Journey'
            }
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
