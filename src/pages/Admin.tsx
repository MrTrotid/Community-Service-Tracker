import { FC, useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, increment, deleteDoc, getDoc, addDoc } from 'firebase/firestore';

interface Student {
  id: string;
  name: string;
  class: string;
  rollNumber: string;
  email: string;
  totalHours: number;
  isAdmin?: boolean; // Make isAdmin optional
}

interface StudentActivity {
  id: string;
  title: string;
  description: string;
  hours: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  isPunishment: boolean;
}

export const Admin: FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [punishmentHours, setPunishmentHours] = useState<number>(0);
  const [punishmentReason, setPunishmentReason] = useState('');
  const [isSubmittingPunishment, setIsSubmittingPunishment] = useState(false);
  const [pendingPreferences, setPendingPreferences] = useState<any[]>([]);
  const db = getFirestore();

  // Fetch all students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsRef = collection(db, 'students');
        const snapshot = await getDocs(studentsRef);
        const studentsList = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            isAdmin: doc.data().isAdmin || false // Provide default value
          }))
          .filter(student => !student.isAdmin) as Student[];
        
        setStudents(studentsList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching students:', error);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Fetch student activities when a student is selected
  useEffect(() => {
    const fetchActivities = async () => {
      if (!selectedStudent) return;

      try {
        const activitiesRef = collection(db, 'serviceHours');
        const q = query(
          activitiesRef,
          where('studentId', '==', selectedStudent.id)
        );

        const snapshot = await getDocs(q);
        const activitiesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as StudentActivity[];

        console.log('Fetched activities:', activitiesList); // Debug log
        setActivities(activitiesList);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
  }, [selectedStudent]);

  useEffect(() => {
    const fetchPendingPreferences = async () => {
      const q = query(collection(db, 'pendingChanges'));
      const snapshot = await getDocs(q);
      setPendingPreferences(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchPendingPreferences();
  }, []);

  const handleUpdateStatus = async (activityId: string, newStatus: 'approved' | 'rejected') => {
    if (!selectedStudent) return;

    try {
      const activityRef = doc(db, 'serviceHours', activityId);
      const activity = activities.find(a => a.id === activityId);
      
      if (!activity) return;

      await updateDoc(activityRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      // Update student's total hours for approved activities
      if (newStatus === 'approved') {
        const studentRef = doc(db, 'students', selectedStudent.id);
        await updateDoc(studentRef, {
          totalHours: increment(activity.hours)
        });
      }

      // Refresh activities list after update
      const updatedActivities = activities.map(a => 
        a.id === activityId ? { ...a, status: newStatus } : a
      );
      setActivities(updatedActivities);

    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const handleDeleteActivity = async (activityId: string, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent any parent click events
    if (!selectedStudent || !window.confirm('Are you sure you want to delete this activity?')) return;

    try {
      // First get a reference to the activity document
      const activityRef = doc(db, 'serviceHours', activityId);
      
      // Fetch the activity document to get current data
      const activitySnap = await getDoc(activityRef);
      
      if (!activitySnap.exists()) {
        console.error('Activity document not found');
        return;
      }

      const activityData = activitySnap.data();
      console.log('Activity data before deletion:', activityData); // Debug log

      // If the activity was approved, update the student's total hours
      if (activityData.status === 'approved') {
        const studentRef = doc(db, 'students', selectedStudent.id);
        const studentSnap = await getDoc(studentRef);
        
        if (studentSnap.exists()) {
          const currentHours = studentSnap.data().totalHours || 0;
          await updateDoc(studentRef, {
            totalHours: Math.max(0, currentHours - activityData.hours)
          });
        }
      }

      // Delete the activity document
      await deleteDoc(activityRef);
      console.log('Activity deleted successfully'); // Debug log

      // Update the local state
      setActivities(prevActivities => prevActivities.filter(a => a.id !== activityId));

      // If the activity was approved, update the selected student's hours in local state
      if (activityData.status === 'approved') {
        setSelectedStudent(prev => {
          if (!prev) return null;
          return {
            ...prev,
            totalHours: Math.max(0, (prev.totalHours || 0) - activityData.hours)
          };
        });
      }

      alert('Activity deleted successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error deleting activity:', error);
      alert('Error deleting activity: ' + errorMessage);
    }
  };

  const handleAddPunishment = async (studentId: string) => {
    if (!punishmentHours || !punishmentReason) {
      alert('Please enter both hours and reason for punishment');
      return;
    }

    setIsSubmittingPunishment(true);
    try {
      const serviceHoursRef = collection(db, 'serviceHours');
      await addDoc(serviceHoursRef, {
        studentId,
        hours: punishmentHours,
        title: 'Punishment Hours',
        description: punishmentReason,
        date: new Date().toISOString(),
        status: 'approved',
        createdAt: new Date().toISOString(),
        isPunishment: true
      });

      // Update student's total hours
      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, {
        totalHours: increment(punishmentHours)
      });

      // Update local state
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === studentId
            ? { ...student, totalHours: (student.totalHours || 0) + punishmentHours }
            : student
        )
      );

      // Reset form
      setPunishmentHours(0);
      setPunishmentReason('');
      alert('Punishment hours added successfully');
    } catch (error) {
      console.error('Error adding punishment:', error);
      alert('Failed to add punishment hours');
    } finally {
      setIsSubmittingPunishment(false);
    }
  };

  const handlePreferenceAction = async (preferenceId: string, userId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        const preference = pendingPreferences.find(p => p.id === preferenceId);
        const userRef = doc(db, 'students', userId);
        await updateDoc(userRef, {
          class: preference.class,
          location: preference.location,
          updatedAt: new Date().toISOString()
        });
      }
      await deleteDoc(doc(db, 'pendingChanges', preferenceId));
      setPendingPreferences(prev => prev.filter(p => p.id !== preferenceId));
      alert(`Preference change ${action}ed successfully`);
    } catch (error) {
      console.error('Error handling preference:', error);
      alert('Failed to process preference change');
    }
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.name?.toLowerCase().includes(searchLower) ||
      student.rollNumber?.toLowerCase().includes(searchLower) ||
      student.class?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower)
    );
  }).sort((a, b) => {
    // Sort by class first, then by roll number
    if (a.class !== b.class) {
      return a.class.localeCompare(b.class);
    }
    return a.rollNumber.localeCompare(b.rollNumber);
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Student Selection Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <input
            type="text"
            placeholder="Search by name, class, roll number, or email..."
            className="w-full max-w-md px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="ml-2 text-sm text-gray-500">
            {filteredStudents.length} students found
          </div>
        </div>

        {/* Update the student cards to show more info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => (
            <div
              key={student.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedStudent?.id === student.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedStudent(student)}
            >
              <h3 className="font-semibold">{student.name}</h3>
              <div className="mt-1 space-y-1">
                <p className="text-sm text-gray-600">Class: {student.class}</p>
                <p className="text-sm text-gray-600">Roll Number: {student.rollNumber}</p>
                <p className="text-sm text-gray-500">{student.email}</p>
                <p className="text-sm font-medium text-blue-600">Total Hours: {student.totalHours}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Student View */}
      {selectedStudent && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">
            Managing {selectedStudent.name}
          </h2>

          {/* Add Punishment Hours Form - Moved here */}
          <div className="bg-red-50 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-red-800 mb-4">Add Punishment Hours</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  value={punishmentHours || ''}
                  onChange={(e) => setPunishmentHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter hours"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input
                  type="text"
                  value={punishmentReason}
                  onChange={(e) => setPunishmentReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter reason"
                />
              </div>
              <button
                onClick={() => handleAddPunishment(selectedStudent.id)}
                disabled={isSubmittingPunishment || !punishmentHours || !punishmentReason}
                className={`w-full px-4 py-2 rounded-md text-white font-medium
                  ${isSubmittingPunishment || !punishmentHours || !punishmentReason
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isSubmittingPunishment ? 'Adding Punishment...' : 'Add Punishment Hours'}
              </button>
            </div>
          </div>

          {/* Activities List */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Activity History</h3>
            <div className="space-y-4">
              {activities.map(activity => (
                <div key={activity.id} className="bg-white p-4 rounded-lg shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{activity.title}</h3>
                      <p className="text-gray-600">{activity.description}</p>
                      <p className="text-sm text-gray-500">Hours: {activity.hours}</p>
                      <p className="text-sm text-gray-500">
                        Date: {new Date(activity.date).toLocaleDateString()}
                      </p>
                      {activity.isPunishment && (
                        <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mt-2">
                          Punishment Hours
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        activity.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : activity.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                      <div className="flex flex-col space-y-2">
                        {activity.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateStatus(activity.id, 'approved')}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(activity.id, 'rejected')}
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        <button
                          onClick={(e) => handleDeleteActivity(activity.id, e)}
                          className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-gray-500 text-center">No activities found</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Pending Preference Changes</h2>
        <div className="space-y-4">
          {pendingPreferences.map((preference) => (
            <div key={preference.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{preference.studentName}</h3>
                  <p className="text-sm text-gray-600">{preference.studentEmail}</p>
                  <div className="mt-2">
                    <p>Class: {preference.currentClass} → {preference.class}</p>
                    <p>Location: {preference.currentLocation} → {preference.location}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePreferenceAction(preference.id, preference.userId, 'approve')}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handlePreferenceAction(preference.id, preference.userId, 'reject')}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
          {pendingPreferences.length === 0 && (
            <p className="text-gray-500 text-center">No pending preference changes</p>
          )}
        </div>
      </div>
    </div>
  );
};
