import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getCustomExercises,
  saveCustomExercise,
  deleteCustomExercise as deleteCustomExerciseFromDb,
} from '@/services/firestore'
import type { Exercise, MuscleGroup, Equipment } from '@/types'

export function useCustomExercises() {
  const { user } = useAuth()
  const [customExercises, setCustomExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCustomExercises = useCallback(async () => {
    if (!user) {
      setCustomExercises([])
      setLoading(false)
      return
    }
    try {
      const exercises = await getCustomExercises(user.uid)
      setCustomExercises(exercises)
    } catch (err) {
      console.error('Failed to fetch custom exercises:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchCustomExercises()
  }, [fetchCustomExercises])

  const addCustomExercise = async (
    name: string,
    primaryMuscle: MuscleGroup,
    equipment: Equipment
  ): Promise<Exercise | null> => {
    if (!user) return null
    const exercise = {
      name,
      aliases: [],
      primaryMuscles: [primaryMuscle] as MuscleGroup[],
      secondaryMuscles: [] as MuscleGroup[],
      equipment,
      category: 'isolation' as const,
    }
    const id = await saveCustomExercise(user.uid, exercise)
    const newExercise: Exercise = {
      ...exercise,
      id,
      isCustom: true,
      createdBy: user.uid,
    }
    setCustomExercises((prev) => [...prev, newExercise])
    return newExercise
  }

  const deleteCustomExercise = async (exerciseId: string) => {
    if (!user) return
    await deleteCustomExerciseFromDb(user.uid, exerciseId)
    setCustomExercises((prev) => prev.filter((e) => e.id !== exerciseId))
  }

  return {
    customExercises,
    loading,
    addCustomExercise,
    deleteCustomExercise,
  }
}
