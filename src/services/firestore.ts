import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { WorkoutSession, WorkoutExercise, SplitType, Exercise } from '@/types'

export async function saveWorkoutSession(
  userId: string,
  session: Omit<WorkoutSession, 'id' | 'userId' | 'startedAt' | 'completedAt'>  & { startedAt: Date }
): Promise<string> {
  const sessionsRef = collection(db, 'users', userId, 'workoutSessions')
  const docRef = await addDoc(sessionsRef, {
    ...session,
    userId,
    completedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getWorkoutSessions(
  userId: string,
  limitCount = 50
): Promise<(WorkoutSession & { id: string })[]> {
  const sessionsRef = collection(db, 'users', userId, 'workoutSessions')
  const q = query(sessionsRef, orderBy('completedAt', 'desc'), limit(limitCount))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as (WorkoutSession & { id: string })[]
}

export async function getWorkoutSessionById(
  userId: string,
  sessionId: string
): Promise<WorkoutSession | null> {
  const docRef = doc(db, 'users', userId, 'workoutSessions', sessionId)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return { id: docSnap.id, ...docSnap.data() } as WorkoutSession
}

export async function getLastWorkoutByType(
  userId: string,
  splitType: SplitType
): Promise<WorkoutSession | null> {
  const sessionsRef = collection(db, 'users', userId, 'workoutSessions')
  const q = query(
    sessionsRef,
    where('splitType', '==', splitType),
    orderBy('completedAt', 'desc'),
    limit(1)
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const docSnap = snapshot.docs[0]
  return { id: docSnap.id, ...docSnap.data() } as WorkoutSession
}

export async function getWorkoutSessionsByType(
  userId: string,
  splitType: SplitType,
  limitCount = 10
): Promise<(WorkoutSession & { id: string })[]> {
  const sessionsRef = collection(db, 'users', userId, 'workoutSessions')
  const q = query(sessionsRef, orderBy('completedAt', 'desc'), limit(50))
  const snapshot = await getDocs(q)
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as WorkoutSession & { id: string }))
    .filter((s) => s.splitType === splitType)
    .slice(0, limitCount)
}

export async function getExerciseHistory(
  userId: string,
  exerciseId: string,
  limitCount = 20
): Promise<{ date: Timestamp; sets: WorkoutExercise['sets']; volumeTotal: number }[]> {
  const sessionsRef = collection(db, 'users', userId, 'workoutSessions')
  const q = query(sessionsRef, orderBy('completedAt', 'desc'), limit(100))
  const snapshot = await getDocs(q)

  const history: { date: Timestamp; sets: WorkoutExercise['sets']; volumeTotal: number }[] = []

  for (const doc of snapshot.docs) {
    const session = doc.data() as WorkoutSession
    const exercise = session.exercises?.find((e) => e.exerciseId === exerciseId)
    if (exercise && session.completedAt) {
      history.push({
        date: session.completedAt,
        sets: exercise.sets,
        volumeTotal: exercise.volumeTotal,
      })
    }
    if (history.length >= limitCount) break
  }

  return history
}

export async function deleteWorkoutSession(userId: string, sessionId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'workoutSessions', sessionId)
  await deleteDoc(docRef)
}

export async function updateUserProfile(userId: string, data: Record<string, unknown>): Promise<void> {
  const profileRef = doc(db, 'users', userId, 'profile', 'settings')
  await updateDoc(profileRef, data)
}

// Custom exercises

export async function saveCustomExercise(
  userId: string,
  exercise: Omit<Exercise, 'id' | 'isCustom' | 'createdBy'>
): Promise<string> {
  const exercisesRef = collection(db, 'users', userId, 'customExercises')
  const docRef = await addDoc(exercisesRef, {
    ...exercise,
    isCustom: true,
    createdBy: userId,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getCustomExercises(userId: string): Promise<Exercise[]> {
  const exercisesRef = collection(db, 'users', userId, 'customExercises')
  const snapshot = await getDocs(exercisesRef)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    isCustom: true,
    createdBy: userId,
  })) as Exercise[]
}

export async function deleteCustomExercise(userId: string, exerciseId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'customExercises', exerciseId)
  await deleteDoc(docRef)
}
