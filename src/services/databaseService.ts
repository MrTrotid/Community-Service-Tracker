import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  setDoc  // Add this import
} from 'firebase/firestore';
import { COLLECTIONS, FirestoreStudent, FirestoreServiceHour } from '../types/firestore';

// Helper function to create timestamps
const getTimestamps = () => ({
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString()
});

// Enhanced service hours operations
export const addServiceHours = async (
  serviceHour: Omit<FirestoreServiceHour, 'id' | 'createdAt' | 'lastUpdated' | 'status'>,
  studentEmail: string
) => {
  try {
    const studentId = studentEmail.substring(0, 7).toLowerCase();
    const newServiceHour: Omit<FirestoreServiceHour, 'id'> = {
      ...serviceHour,
      studentId,
      studentEmail,
      status: 'pending',
      ...getTimestamps()
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.SERVICE_HOURS), newServiceHour);
    return { id: docRef.id, ...newServiceHour };
  } catch (error) {
    console.error('Error adding service hours:', error);
    throw error;
  }
};

// Get student's service hours with pagination and sorting
export const getStudentServiceHours = async (
  studentId: string, 
  pageSize = 10, 
  lastVisible?: any,
  status?: 'pending' | 'approved' | 'rejected'
) => {
  try {
    let queryConstraints: any[] = [
      where('studentId', '==', studentId),
      orderBy('date', 'desc'),
      limit(pageSize)
    ];

    if (status) {
      queryConstraints.unshift(where('status', '==', status));
    }

    if (lastVisible) {
      queryConstraints.push(startAfter(lastVisible));
    }

    const q = query(collection(db, COLLECTIONS.SERVICE_HOURS), ...queryConstraints);
    const querySnapshot = await getDocs(q);

    const serviceHours = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestoreServiceHour[];

    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      serviceHours,
      lastDoc,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error getting service hours:', error);
    throw error;
  }
};

// Get total hours by status
export const getStudentHoursByStatus = async (studentId: string) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.SERVICE_HOURS),
      where('studentId', '==', studentId)
    );
    
    const querySnapshot = await getDocs(q);
    const hours = {
      approved: 0,
      pending: 0,
      rejected: 0,
      total: 0
    };

    querySnapshot.docs.forEach(doc => {
      const data = doc.data() as FirestoreServiceHour;
      hours[data.status] += data.hours;
      if (data.status === 'approved') {
        hours.total += data.hours;
      }
    });

    return hours;
  } catch (error) {
    console.error('Error getting hours by status:', error);
    throw error;
  }
};

// Student Operations
export const createOrGetStudent = async (email: string, name: string, uid: string) => {
  try {
    // Use UID as the document ID
    const studentRef = doc(db, COLLECTIONS.STUDENTS, uid);
    const studentDoc = await getDoc(studentRef);

    if (!studentDoc.exists()) {
      const newStudent: FirestoreStudent = {
        id: uid,
        name,
        email,
        totalHours: 0,
        requiredHours: 50,
        punishmentHours: 0,
        isFirstLogin: true,
        ...getTimestamps()
      };
      
      await setDoc(studentRef, newStudent);
      console.log('Created new student:', email);
      return newStudent;
    }

    return studentDoc.data() as FirestoreStudent;
  } catch (error) {
    console.error('Error in createOrGetStudent:', error);
    throw error;
  }
};

export const updateStudentHours = async (studentId: string, totalHours: number) => {
  try {
    const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);
    await updateDoc(studentRef, {
      totalHours: totalHours
    });
  } catch (error) {
    console.error('Error updating student hours:', error);
    throw error;
  }
};

export const getStudent = async (studentId: string) => {
  try {
    const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);
    const studentDoc = await getDoc(studentRef);
    if (studentDoc.exists()) {
      return { id: studentDoc.id, ...studentDoc.data() } as FirestoreStudent;
    }
    return null;
  } catch (error) {
    console.error('Error getting student:', error);
    throw error;
  }
};

// Admin Operations
export const updateServiceHourStatus = async (
  serviceHourId: string, 
  status: 'approved' | 'rejected', 
  verifierId: string
) => {
  try {
    const serviceHourRef = doc(db, COLLECTIONS.SERVICE_HOURS, serviceHourId);
    const serviceHourDoc = await getDoc(serviceHourRef);
    
    if (!serviceHourDoc.exists()) {
      throw new Error('Service hour record not found');
    }

    const serviceHourData = serviceHourDoc.data() as FirestoreServiceHour;

    await updateDoc(serviceHourRef, {
      status,
      verifierId
    });

    // Only update student hours if the status is approved
    if (status === 'approved') {
      const studentRef = doc(db, COLLECTIONS.STUDENTS, serviceHourData.studentId);
      const studentDoc = await getDoc(studentRef);
      
      if (studentDoc.exists()) {
        const studentData = studentDoc.data() as FirestoreStudent;
        await updateDoc(studentRef, {
          totalHours: studentData.totalHours + serviceHourData.hours,
          requiredHours: Math.max(0, studentData.requiredHours - serviceHourData.hours)
        });
      }
    }
  } catch (error) {
    console.error('Error updating service hour status:', error);
    throw error;
  }
};
