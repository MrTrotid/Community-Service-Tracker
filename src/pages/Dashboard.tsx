import { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Activity } from '../types/activity';

interface StudentInfo {
  name: string;
  class: string;
  rollNumber: string;
  requiredHours: number;
  totalHours: number;
}

export const Dashboard = () => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    hours: 0,
    date: new Date().toISOString().split('T')[0],
    isPunishment: false
  });
  const db = getFirestore();

  useEffect(() => {
    if (!currentUser) {
      setActivities([]);
      setLoading(false);
      return;
    }

    // Fetch student info
    const fetchStudentInfo = async () => {
      const studentDoc = await getDoc(doc(db, 'students', currentUser.uid));
      if (studentDoc.exists()) {
        setStudentInfo(studentDoc.data() as StudentInfo);
      }
    };

    fetchStudentInfo();

    // Fetch activities
    const activitiesRef = collection(db, 'serviceHours');
    const q = query(activitiesRef, where('studentId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[];
      
      setActivities(activitiesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const activityRef = collection(db, 'serviceHours');
      await addDoc(activityRef, {
        ...newActivity,
        studentId: currentUser.uid,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setNewActivity({
        title: '',
        description: '',
        hours: 0,
        date: new Date().toISOString().split('T')[0],
        isPunishment: false
      });
      setIsAddingActivity(false);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const renderAddActivityForm = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Add New Activity</h2>
        <button
          onClick={() => setIsAddingActivity(!isAddingActivity)}
          className="text-blue-600 hover:text-blue-700"
        >
          {isAddingActivity ? 'Cancel' : 'Add New Activity'}
        </button>
      </div>
      
      {isAddingActivity && (
        <form onSubmit={handleAddActivity} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              value={newActivity.title}
              onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              value={newActivity.description}
              onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hours</label>
              <input
                type="number"
                required
                min="0"
                step="0.5"
                value={newActivity.hours}
                onChange={(e) => setNewActivity({...newActivity, hours: parseFloat(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                required
                value={newActivity.date}
                onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPunishment"
              checked={newActivity.isPunishment}
              onChange={(e) => setNewActivity({...newActivity, isPunishment: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPunishment" className="ml-2 block text-sm text-gray-700">
              This is a punishment activity
            </label>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Submit Activity
            </button>
          </div>
        </form>
      )}
    </div>
  );

  if (loading) return <div>Loading...</div>;

  const approvedActivities = activities.filter(a => a.status === 'approved');
  const pendingActivities = activities.filter(a => a.status === 'pending');
  const totalCompletedHours = approvedActivities.reduce((acc, curr) => acc + curr.hours, 0);
  const punishmentHours = approvedActivities
    .filter(a => a.isPunishment)
    .reduce((acc, curr) => acc + curr.hours, 0);
  const requiredHours = studentInfo?.requiredHours || 40;
  const remainingHours = Math.max(0, requiredHours - totalCompletedHours);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Student Information Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Information</h2>
            <div className="space-y-2">
              <p className="text-gray-600">Name: <span className="font-semibold text-gray-800">{studentInfo?.name}</span></p>
              <p className="text-gray-600">Class: <span className="font-semibold text-gray-800">{studentInfo?.class}</span></p>
              <p className="text-gray-600">Roll Number: <span className="font-semibold text-gray-800">{studentInfo?.rollNumber}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Hours Completed</h3>
          <p className="text-3xl font-bold text-blue-600">{totalCompletedHours}</p>
          <p className="text-sm text-gray-500">Out of {requiredHours} required hours</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Remaining Hours</h3>
          <p className="text-3xl font-bold text-orange-600">{remainingHours}</p>
          <p className="text-sm text-gray-500">Hours left to complete</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Punishment Hours</h3>
          <p className="text-3xl font-bold text-red-600">{punishmentHours}</p>
          <p className="text-sm text-gray-500">Additional required hours</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Pending Activities</h3>
          <p className="text-3xl font-bold text-yellow-600">{pendingActivities.length}</p>
          <p className="text-sm text-gray-500">Awaiting approval</p>
        </div>
      </div>

      {/* Add Activity Form */}
      {renderAddActivityForm()}

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-600 mb-4">Completion Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-blue-600 rounded-full h-4 transition-all duration-500"
            style={{ width: `${Math.min(100, (totalCompletedHours / requiredHours) * 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {Math.round((totalCompletedHours / requiredHours) * 100)}% completed
        </p>
      </div>

      {/* Recent Activities Section */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Activities</h2>
          <div className="grid gap-4">
            {activities.map(activity => (
              <div key={activity.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{activity.title}</h3>
                    <p className="text-gray-600">{activity.description}</p>
                    <p className="text-sm text-gray-500">Hours: {activity.hours}</p>
                    <p className="text-sm text-gray-500">Date: {new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                      activity.status === 'pending'
                        ? 'text-yellow-800 bg-yellow-100'
                        : activity.status === 'approved'
                        ? 'text-green-800 bg-green-100'
                        : 'text-red-800 bg-red-100'
                    }`}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};